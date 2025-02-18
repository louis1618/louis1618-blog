import React, { useState, useEffect, useRef, useCallback, useContext } from "react";
import "../styles/Home.css";
import { NavLink, useNavigate, useSearchParams } from "react-router-dom";
import avator from "../assets/img/user-avatar.svg";
import { AuthContext } from "../AuthContext";

import ReactMarkdown from "react-markdown";
import ReactMarkdownEditorLite from 'react-markdown-editor-lite';
import 'react-markdown-editor-lite/lib/index.css';
import MarkdownIt from 'markdown-it';
const mdParser = new MarkdownIt();

const MainContent = () => {
  const { isAuthenticated, user } = useContext(AuthContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "all";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [posts, setPosts] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();
  const [newPost, setNewPost] = useState({
    title: "",
    description: "",
    tags: [],
    rank: "1",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [errorMessage2, setErrorMessage2] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [allPostsLoaded, setAllPostsLoaded] = useState(false); // 모든 포스트 로드 여부
  const [page, setPage] = useState(1); // 페이지 번호
  const observer = useRef(null); // Intersection Observer 인스턴스
  const observing = useRef(false); // 관찰 중인지 여부

  useEffect(() => {
    // 페이지 변경 시, observing.current 상태를 리셋합니다.
    observing.current = false;
  }, [activeTab]);

  useEffect(() => {
    const fetchPosts = async () => {
      if (observing.current) return;
      observing.current = true;
      setIsLoading(true);
  
      const rankMapping = {
        all: "",
        portfolio: "포트폴리오",
        dev: "개발",
        others: "고정됨",
      };
  
      const rankFilter = rankMapping[activeTab] || "";
  
      try {
        const response = await fetch(`/api/posts?page=${page}&limit=10&rank=${rankFilter}`);
        const data = await response.json();
  
        if (response.status === 500) {
          setPosts([]);
          setErrorMessage(data.message || "권한이 없습니다.");
        } else {
          if (data.length === 0) {
            setAllPostsLoaded(true);
          } else {
            setPosts((prevPosts) => {
              const updatedPosts = [...prevPosts, ...data];
  
              const seenIds = new Set();
              const uniquePosts = updatedPosts.filter((post) => {
                if (seenIds.has(post._id)) return false;
                seenIds.add(post._id);
                return true;
              });
  
              return uniquePosts;
            });
          }
          setErrorMessage("");
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
        setErrorMessage("서버로부터 데이터를 가져오는 중 오류가 발생했습니다.");
      } finally {
        setIsLoading(false);
        observing.current = false;
      }
    };
  
    fetchPosts();
  }, [page, activeTab]); 
  
  const handleIntersection = useCallback(
    (entries) => {
      if (observing.current) return;
      if (!allPostsLoaded && entries[0].isIntersecting) {
        observing.current = true;
        setPage((prevPage) => prevPage + 1);
        observing.current = false;
      }
    },
    [allPostsLoaded],
  );

  const targetRef = useCallback(
    (node) => {
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver(handleIntersection);
      if (node) observer.current.observe(node);
    },
    [handleIntersection],
  );

  const sortPosts = (posts) => {
    return posts.sort((a, b) => {
      const rankOrder = { "고정됨": 1, "포트폴리오": 2, "개발": 3 };
  
      const rankA = rankOrder[a.rank] || 4;
      const rankB = rankOrder[b.rank] || 4;
  
      if (rankA !== rankB) {
        return rankA - rankB;
      }
  
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
    
    setPage(1);
    setAllPostsLoaded(false);

    if (observer.current) {
      observer.current.disconnect();
    }
  };  

  const filteredPosts =
    activeTab === "all"
      ? sortPosts(posts)
      : sortPosts(
          posts.filter(
            (post) =>
              (activeTab === "portfolio" && post.rank === "포트폴리오") ||
              (activeTab === "dev" && post.rank === "개발") || 
              (activeTab === "others" && post.rank === "고정됨") 
          ),
        );

  const handlePopupToggle = () => {
    setShowPopup(!showPopup);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPost((prevPost) => ({
      ...prevPost,
      [name]: value,
    }));
  };

  const handleTagsChange = (e) => {
    const inputValue = e.target.value;
    setNewPost((prevPost) => ({
      ...prevPost,
      tags: inputValue.split(",").map((tag) => tag.trim()),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/rposts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newPost),
      });

      if (response.status === 200) {
        const updatedPosts = await response.json();
        setPosts(updatedPosts);
        setShowPopup(false);
        setErrorMessage("");
      } else if (response.status === 403) {
        navigate("/auth/login");
        return alert("로그인 후 이용하세요.");
      } else {
        const errorData = await response.json();
        setErrorMessage2(errorData.message || "알 수 없는 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error("Error:", error);
      setErrorMessage2("알 수 없는 오류가 발생했습니다.");
    }
  };

  const handleEditorChange = ({ text }) => {
    setNewPost((prevPost) => ({
      ...prevPost,
      description: text,
    }));
  };

  return (
    <section className="content">
      <div className="posts-layout-list">
        {/* isAuthenticated  user.rank 체크 */}
        {isAuthenticated && user.rank >= 3 && (
          <div className="community-header">
            <div className="create-post-button" onClick={() => setShowPopup(true)}>
              <img src={avator} alt="사용자 아바타" />
              포스트 작성하기
            </div>
          </div>
        )}

        {errorMessage && <div className="error-message">{errorMessage}</div>}

        {!errorMessage && (
          <>
            <div className="community-tabs">
              <button className={`tab ${activeTab === "all" ? "active" : ""}`} onClick={() => handleTabChange("all")}>
                전체
              </button>
              <button className={`tab ${activeTab === "portfolio" ? "active" : ""}`} onClick={() => handleTabChange("portfolio")}>
                포트폴리오
              </button>
              <button className={`tab ${activeTab === "dev" ? "active" : ""}`} onClick={() => handleTabChange("dev")}>
                개발내역
              </button>
              <button className={`tab ${activeTab === "others" ? "active" : ""}`} onClick={() => handleTabChange("others")}>
                기타
              </button>
            </div>

            <div className="community-posts">
            {filteredPosts.length > 0 ? (
              filteredPosts.map((post) => (
                <NavLink to={`/posts/view/${post._id}`} key={post._id} className="post-item">
                <div className="post-header">
                    {post.d_author && post.author && (
                      <span className="post-author">
                        {post.d_author} (@{post.author})
                      </span>
                    )}
                    {post.date && <span className="post-date">{post.date}</span>}
                  </div>

                  <h2 className="post-title">{post.title}</h2>
                  <p className="post-description">
                    <ReactMarkdown>{post.description}</ReactMarkdown>
                  </p>

                  <div className="post-tags">
                    {post.tags.map((tag) => (
                      <span key={tag} className="tag">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  {post.rank && <span className="post-rank">{post.rank}</span>}
                </NavLink>
              ))
            ) : (
              !isLoading && <p className="no-posts-message">여긴 아무것도 없네요😭</p>
            )}
            
            {!allPostsLoaded  && (
              <div ref={targetRef} className="prs-message">
              <svg className='loader' viewBox="25 25 50 50">
                <circle r="20" cy="50" cx="50"></circle>
              </svg>
              </div>
            )}

            {allPostsLoaded && filteredPosts.length > 0 && (
                <p className="all-posts-message">모든 포스트를 확인했습니다.</p>
            )}

            {allPostsLoaded && filteredPosts.length > 0 && (
                <p className="additional-message">© 2025 Louis1618</p>
            )}
          </div>
          </>
        )}

        {showPopup && (
          <div className="popup-overlay">
            <div className="popup-container">
              <button className="close-popup" onClick={handlePopupToggle}>
                ×
              </button>
              <h2>포스트 작성</h2>
              <form onSubmit={handleSubmit}>
                <label>
                  제목:
                  <input
                    type="text"
                    name="title"
                    value={newPost.title}
                    onChange={handleInputChange}
                    required
                  />
                </label>
                <ReactMarkdownEditorLite
                  value={newPost.description || ""}
                  onChange={handleEditorChange}
                  style={{ height: "300px" }}
                  renderHTML={(text) => mdParser.render(text)}
                  config={{
                    image: false,
                  }}
                  onImageUpload={(file) => {
                    return new Promise((resolve, reject) => {
                      reject("이미지 업로드가 비활성화되었습니다.");
                    });
                  }}
                />
                <label>
                  태그 (쉼표로 구분):
                  <input
                    type="text"
                    name="tags"
                    value={newPost.tags.join(", ")}
                    onChange={handleTagsChange}
                  />
                </label>
                <button type="submit">포스트 제출</button>
              </form>
              {errorMessage2 && <p className="error-message2">{errorMessage2}</p>}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default MainContent;