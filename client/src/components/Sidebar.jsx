import React, { useContext, useState, useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import '../styles/Sidebar.css';
import { AuthContext } from '../AuthContext';
import logo from '../assets/img/logo_background.svg';

function Sidebar() {
  const { user, isAuthenticated, logout } = useContext(AuthContext);
  const [showPopup, setShowPopup] = useState(false);
  const popupRef = useRef(null);

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
    <aside>
      <div className="logo">
        <a href="/home">
          <img src={logo} alt="louis1618" className="logo_img" />
        </a>
      </div>
      <nav className="side-nav">
        <NavLink
          to="/home"
          className={({ isActive }) =>
            isActive || window.location.pathname.startsWith('/home')
              ? 'active'
              : ''
          }
        >
          <i className="fa-solid fa-house fa-lg"></i> 홈
        </NavLink>
        <NavLink to="/project" className={({ isActive }) => (isActive ? 'active' : '')}>
          <i className="fa-solid fa-square-poll-horizontal fa-xl"></i> 프로젝트
        </NavLink>
        <NavLink
          to="/source"
          className={({ isActive }) => (isActive ? 'active' : '')}
        >
          <i className="fa-solid fa-comments fa-lg"></i> 오픈소스
        </NavLink>
        <NavLink
          to="/archives"
          className={({ isActive }) => (isActive ? 'active' : '')}
        >
          <i class="fa-solid fa-star fa-lg"></i> 업적
        </NavLink>
        <NavLink
          to="/about"
          className={({ isActive }) => (isActive ? 'active' : '')}
        >
       <i class="fa-solid fa-circle-info fa-lg"></i> 정보
        </NavLink>
      </nav>
      <div className="quick-links">
        {isAuthenticated ? (
          <div className="user-button" onClick={togglePopup} ref={popupRef}>
            <i className="fa-solid fa-user-large fa-lg"></i> {user.username}
            {showPopup && (
              <div className="user-popup">
                <button onClick={() => alert('개발 중 입니다')}>
                  설정
                </button>
                <button onClick={handleLogout}>로그아웃</button>
              </div>
            )}
          </div>
        ) : (
          <NavLink className='user-button' to="/login">
            <i className="fa-solid fa-user-large fa-lg"></i> 로그인
          </NavLink>
        )}
      </div>
    </aside>
  );
}

export default Sidebar;