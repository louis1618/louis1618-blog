import React, { useState, useEffect, useRef, useCallback, useContext } from "react";
import "../styles/Home.css";
import { NavLink, useNavigate } from "react-router-dom";
import avator from "../assets/img/user-avatar.svg";
import { AuthContext } from "../AuthContext";

const MainContent = () => {
  const { isAuthenticated, user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("all");
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
  const [allPostsLoaded, setAllPostsLoaded] = useState(false); // 모든 포스트 로드 여부
  const [page, setPage] = useState(1); // 페이지 번호
  const observer = useRef(null); // Intersection Observer 인스턴스
  const observing = useRef(false); // 관찰 중인지 여부

  useEffect(() => {
    const fetchPosts = async () => {
      if (observing.current) return;
      observing.current = true;

      try {
        const response = await fetch(`/api/posts?page=${page}&limit=10`);
        const data = await response.json();

        if (response.status === 500) {
          setPosts([]);
          setErrorMessage(data.message || "권한이 없습니다.");
        } else {
          if (data.length === 0) {
            setAllPostsLoaded(true);
          } else {
            // 새로운 게시물을 배열의 맨 앞에 추가
            setPosts((prevPosts) => {
              // 새로운 게시물을 앞에 추가
              const updatedPosts = [...prevPosts, ...data];
              const uniquePosts = [];
              const seenIds = new Set();
              for (const post of updatedPosts) {
                if (!seenIds.has(post._id)) {
                  uniquePosts.push(post);
                  seenIds.add(post._id);
                }
              }
              return uniquePosts;
            });
            // 스크롤 이벤트 발생 시 페이지 업데이트
            // setPage((prevPage) => prevPage + 1);
          }
          setErrorMessage("");
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
        setErrorMessage("서버로부터 데이터를 가져오는 중 오류가 발생했습니다.");
      } finally {
        observing.current = false;
      }
    };

    fetchPosts();
  }, [page]); // page가 변경될 때마다 fetchPosts 함수 실행

  // Intersection Observer 콜백 함수
  const handleIntersection = useCallback(
    (entries) => {
      if (observing.current) return;
      if (!allPostsLoaded && entries[0].isIntersecting) {
        observing.current = true;
        // 스크롤 이벤트 발생 시 페이지 업데이트
        setPage((prevPage) => prevPage + 1);
        observing.current = false;
      }
    },
    [allPostsLoaded],
  );

  // 스크롤 관찰 대상
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
      if (a.rank === "관리자" && b.rank !== "관리자") return -1;
      if (a.rank !== "관리자" && b.rank === "관리자") return 1;
      // createdAt 필드를 기준으로 내림차순 정렬
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  };

  const filteredPosts =
    activeTab === "all"
      ? sortPosts(posts)
      : sortPosts(
          posts.filter(
            (post) =>
              (activeTab === "admin" && post.rank === "관리자") ||
              (activeTab === "user" && post.rank === "유저"),
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

  return (
    <section className="content">
      <div className="posts-layout-list">
        {/* 조건 추가: isAuthenticated와 user.rank 체크 */}
        {isAuthenticated && user.rank === 5 && (
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
              <button
                className={`tab ${activeTab === "all" ? "active" : ""}`}
                onClick={() => setActiveTab("all")}
              >
                전체
              </button>
              <button
                className={`tab ${activeTab === "user" ? "active" : ""}`}
                onClick={() => setActiveTab("user")}
              >
                유저
              </button>
              <button
                className={`tab ${activeTab === "admin" ? "active" : ""}`}
                onClick={() => setActiveTab("admin")}
              >
                관리자
              </button>
            </div>

            <div className="community-posts">
              {filteredPosts &&
                filteredPosts.map((post) => (
                  <NavLink to={`/posts/view/${post._id}`} key={post._id} className="post-item">
                    <div className="post-header">
                      {post.author && <span className="post-author">{post.author}</span>}
                      {post.date && <span className="post-date">{post.date}</span>}
                    </div>

                    <h2 className="post-title">{post.title}</h2>
                    <p className="post-description">{post.description}</p>
                    <div className="post-tags">
                      {post.tags.map((tag) => (
                        <span key={tag} className="tag">
                          #{tag}
                        </span>
                      ))}
                    </div>
                    {post.rank && <span className="post-rank">{post.rank}</span>}
                  </NavLink>
                ))}
              {!allPostsLoaded && <div ref={targetRef} className="loading"></div>}
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
                <label>
                  내용:
                  <textarea
                    name="description"
                    value={newPost.description}
                    onChange={handleInputChange}
                    required
                  />
                </label>
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