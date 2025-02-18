import React, { useContext, useState, useRef, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import styles from '../styles/sidebar.module.css'; // CSS Module import
import { AuthContext } from '../AuthContext';
import logo from '../assets/img/logo_background.svg';

function Sidebar() {
  const { user, isAuthenticated, logout } = useContext(AuthContext);
  const [showPopup, setShowPopup] = useState(false);
  const popupRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const redirectUrl = encodeURIComponent(location.pathname);

  const handleClickOutside = (event) => {
    if (popupRef.current && !popupRef.current.contains(event.target)) {
      setShowPopup(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const togglePopup = () => {
    setShowPopup(!showPopup);
  };

  const handleLogout = () => {
    logout();
    setShowPopup(false);
  };

  return (
    <aside className={styles['sidebar']}>
        <div className={styles['logo-container']}>
          <a href="/home" className={styles['logo-link']}>
            <img src={logo} alt="louis1618" className={styles['logo_img']} />
          </a>
          <a href="/home"><span className={styles['header_title']}>Louis1618</span></a>
          <span className={styles['header_subtitle']}>안녕하세요!</span>
        </div>

      <nav className={styles['side-nav']}>
        <NavLink
          to="/home"
          className={({ isActive }) =>
            isActive || window.location.pathname.startsWith('/home')
              ? styles.active
              : ''
          }
        >
          <i className="fa-solid fa-house fa-lg"></i> 홈
        </NavLink>
        <NavLink to="/project" className={({ isActive }) => (isActive ? styles.active : '')}>
          <i className="fa-solid fa-square-poll-horizontal fa-xl"></i> 프로젝트
        </NavLink>
        <NavLink
          to="/source"
          className={({ isActive }) => (isActive ? styles.active : '')}
        >
          <i className="fa-solid fa-comments fa-lg"></i> 오픈소스
        </NavLink>
        <NavLink
          to="/archives"
          className={({ isActive }) => (isActive ? styles.active : '')}
        >
          <i className="fa-solid fa-star fa-lg"></i> 업적
        </NavLink>
        <NavLink
          to="/about"
          className={({ isActive }) => (isActive ? styles.active : '')}
        >
         <i className="fa-solid fa-circle-info fa-lg"></i> 소개
        </NavLink>
        <NavLink
          to="/settings"
          className={({ isActive }) => (isActive ? styles.active : '')}
        >
          <i class="fa-solid fa-gear fa-lg"></i> 설정
        </NavLink>
      </nav>

      <div className={styles['quick-links']}>
        {isAuthenticated ? (
          <div className={styles['user-button']} onClick={togglePopup} ref={popupRef}>
            <i class="fa-solid fa-user fa-xl"></i>

            <div className={styles['user-info']}>
              {user.display_name && <span className={styles['user-display-name']}>{user.display_name}</span>}
              {user.user_handle && <span className={styles['user-handle']}>@{user.user_handle}</span>}
            </div>

            {showPopup && (
              <div className={styles['user-popup']}>
                <button onClick={() => navigate("/settings")}>계정 관리</button>
                <button onClick={handleLogout}>로그아웃</button>
              </div>
            )}
          </div>
        ) : (
          <NavLink className={styles['user-button']} to={`/auth/login?redirect=${redirectUrl}`}>
            <i className="fa-solid fa-user-large fa-lg"></i> 로그인
          </NavLink>
        )}
      </div>

    </aside>
  );
}

export default Sidebar;
