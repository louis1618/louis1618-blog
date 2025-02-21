import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { marked } from 'marked';
import styles from '../styles/PostDetail.module.css';

const PostDetail = () => {
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState('');
  const { id } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/posts/${id}`);
        if (!response.ok) {
          throw new Error('Post not found');
        }
        const data = await response.json();
        setPost(data);
        setIsLoading(false);

        const commentsResponse = await fetch(`/api/comments/${id}`);
        if (!commentsResponse.ok) {
          throw new Error('Comments not found');
        }
        const commentsData = await commentsResponse.json();
        setComments(commentsData);

        const sortedComments = commentsData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setComments(sortedComments);
      } catch (err) {
        setIsLoading(false);
        setError('해당 포스트는 존재하지 않습니다. 잠시 후 홈으로 이동합니다...');
        setTimeout(() => {
          navigate('/home');
        }, 1000);
      }
    };

    fetchPost();
  }, [id]);

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleAddComment = async (e) => {
    e.preventDefault();

    if (!content.trim()) {
      return;
    }
    
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postId: id, content }),
      });
      if (!response.ok) {
        if (response.status === 400) {
          return alert('비정상적인 행동이 감지되었습니다.');
        } else if (response.status === 401) {
          return alert('관리자 외 댓글을 작성할 수 없는 게시물 입니다.');
        } else if (response.status === 404) {
          navigate('/auth/login');
          return alert('로그인 후 이용하세요.');
        } else {
          return alert('알 수 없는 오류가 발생했습니다.');
        }
      }

      const newComment = await response.json();
      setComments([newComment, ...comments]);
      setContent('');
    } catch (err) {
      setError('댓글을 추가할 수 없습니다');
    }
  };

  return (
      <section className="content">
      <div className={styles['post-layout']}>
        <div className={styles['post-detail']}>
          {error ? (
            <div className={styles['prs-message']}>
              <p>{error}</p>
            </div>
          ) : isLoading ? (
            <div className="prs-message">
              <svg className={styles.loader} viewBox="25 25 50 50">
                <circle r="20" cy="50" cx="50"></circle>
              </svg>
            </div>
          ) : (
            <>
              <div className={styles['back-button']} onClick={handleBackClick}>
                <i className="fa-solid fa-chevron-left"></i>
              </div>
              <div className={styles['post_title']}>
                <h1>{post ? post.title : ''}</h1>
              </div>
              <div className={styles['post-meta']}>
                <span>작성자: {post ? post.author : ''} 날짜: {post ? post.date : ''}</span>
              </div>

              {/* Markdown */}
              <div
                className={styles['post-details-docs']}
                dangerouslySetInnerHTML={{ __html: marked(post.description) }}
              />

              <div className={styles['post-tags']}>
                {post && post.tags && post.tags.map(tag => (
                  <span key={tag} className={styles['tag']}>#{tag}</span>
                ))}
              </div>

              <div className={styles['post-comments']}>
                <h2>댓글</h2>
                <div className={styles['add-comment']}>
                  <form onSubmit={handleAddComment}>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="이 게시물에 댓글을 남겨보세요"
                        required
                    />
                    <button type="submit">게시</button>
                  </form>
                </div>

                {comments.map((comment) => (
                  <div key={comment._id} className={styles['comment']}>
                    <span className={styles['comment-author']}>{comment.author}</span>
                    <p>{comment.content}</p>
                    <span className={styles['comment-date']}>{new Date(comment.createdAt).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default PostDetail;
