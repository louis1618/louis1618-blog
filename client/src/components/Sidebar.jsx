import React, { useContext, useState, useRef, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import styles from '../styles/sidebar.module.css';
import { AuthContext } from '../AuthContext';
import logo from '../assets/img/logo_background.svg';

function Sidebar() {
  const { user, isAuthenticated, logout } = useContext(AuthContext);
  const [showPopup, setShowPopup] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = () => {
    logout();
    setShowPopup(false);
  };

  const handleMobileLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  const [elapsedTime, setElapsedTime] = useState({
    years: 0,
    months: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const updateElapsedTime = () => {
      const now = new Date();
      const birthDate = new Date(2010, 9, 1, 12, 0); // 연도 | 월 | 일 | 시간 | 분 순으로 나열
      const diff = now - birthDate;
  
      const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
      const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30.4375));
      const weeks = Math.floor(diff / (1000 * 60 * 60 * 24 * 7));
      const days = Math.floor(diff / (1000 * 60 * 60 * 24)); 
      const hours = Math.floor(diff / (1000 * 60 * 60)); 
      const minutes = Math.floor(diff / (1000 * 60));
      const seconds = Math.floor(diff / 1000);
  
      setElapsedTime({
        years,
        months,
        weeks,
        days,
        hours,
        minutes,
        seconds,
      });
    };
  
    updateElapsedTime();
    const interval = setInterval(updateElapsedTime, 1000);
  
    return () => clearInterval(interval);
  }, []);
  
  return (
    <>
      {/* 모바일 메뉴 토글 버튼 */}
      <button className={styles['mobile-menu-toggle']} onClick={toggleMobileMenu} title="mobilemenu">
        <i className={`fa-solid ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
      </button>

      <aside className={`${styles['sidebar']} ${isMobileMenuOpen ? styles['mobile-open'] : ''}`}>
        <div className={styles['logo-container']}>
          <a href="/home" className={styles['logo-link']}>
            <img src={logo} alt="louis1618" className={styles['logo_img']} />
          </a>
          <a href="/home"><span className={styles['header_title']}>Louis1618</span></a>
          <div className={styles['text_switcher']}>
            <div className={styles['subtitle_text_switch']}>
              <span className={styles['header_subtitle']}>louis.devop@gmail.com</span>
              <span className={styles['header_subtitle']}>태어난지 {elapsedTime.years} 년</span>
              <span className={styles['header_subtitle']}>태어난지 {elapsedTime.days} 일</span>
              <span className={styles['header_subtitle']}>태어난지 {elapsedTime.hours} 시간</span>
              <span className={styles['header_subtitle']}>태어난지 {elapsedTime.minutes} 분</span>
              <span className={styles['header_subtitle']}>태어난지 {elapsedTime.seconds} 초</span>
            </div>
          </div>
        </div>

        <nav className={styles['side-nav']}>
          <NavLink
            to="/home"
            className={({ isActive }) =>
              isActive || window.location.pathname.startsWith('/home')
                ? styles.active
                : ''
            }
            onClick={handleMobileLinkClick}
          >
            <i className="fa-solid fa-house fa-lg"></i> 홈
          </NavLink>
          <NavLink 
            to="/project" 
            className={({ isActive }) => (isActive ? styles.active : '')}
            onClick={handleMobileLinkClick}
          >
            <i className="fa-solid fa-square-poll-horizontal fa-xl"></i> 프로젝트
          </NavLink>
          <NavLink
            to="/source"
            className={({ isActive }) => (isActive ? styles.active : '')}
            onClick={handleMobileLinkClick}
          >
            <i className="fa-solid fa-comments fa-lg"></i> 오픈소스
          </NavLink>
          <NavLink
            to="/archives"
            className={({ isActive }) => (isActive ? styles.active : '')}
            onClick={handleMobileLinkClick}
          >
            <i className="fa-solid fa-star fa-lg"></i> 업적
          </NavLink>
          <NavLink
            to="/about"
            className={({ isActive }) => (isActive ? styles.active : '')}
            onClick={handleMobileLinkClick}
          >
            <i className="fa-solid fa-circle-info fa-lg"></i> 소개
          </NavLink>
          <NavLink
            to="/settings"
            className={({ isActive }) => (isActive ? styles.active : '')}
            onClick={handleMobileLinkClick}
          >
            <i className="fa-solid fa-gear fa-lg"></i> 설정
          </NavLink>
        </nav>

        <div className={styles['quick-links']}>
          {isAuthenticated ? (
            <div className={styles['user-button']} onClick={togglePopup} ref={popupRef}>
              <i className="fa-solid fa-user fa-xl"></i>
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
            <NavLink 
              className={styles['user-button']} 
              to={`/auth/login?redirect=${redirectUrl}`}
              onClick={handleMobileLinkClick}
            >
              <i className="fa-solid fa-user-large fa-lg"></i> 로그인
            </NavLink>
          )}
        </div>
      </aside>

      {/* 모바일 메뉴 오버레이 */}
      {isMobileMenuOpen && (
        <div 
          className={styles['mobile-overlay']} 
          onClick={toggleMobileMenu}
        ></div>
      )}
    </>
  );
}

export default Sidebar;
