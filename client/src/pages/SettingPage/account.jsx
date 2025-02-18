import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import styles from '../../styles/settings.module.css'; // CSS 모듈 import
import { AuthContext } from '../../AuthContext';

function MainContent() {
  const { user, isAuthenticated } = useContext(AuthContext);

  if (!isAuthenticated) return <Navigate to={`/auth/login`} />;

  return (
    <section className={'content'}>
      <div className={styles.header}>
        <h1 className={styles['set_header_title']}>계정 관리</h1>
        {isAuthenticated === true ? (
          <h1 className={styles['set_header_subtitle']}>@{user.user_handle}</h1>
        ) : (
          <h1>잠시만 기다려주세요</h1>
        )}
      </div>

      <div className={styles['notice-section']}>
        <div className={styles['section-header']}>
          <h2>프로필</h2>
        </div>
        <div className={styles['item-grid']}>
          <div className={styles['item-card']}>
            <h3>핸들</h3>
            <p id="username">{user.user_handle}</p>
          </div>
          <div className={styles['item-card']}>
            <h3>이름</h3>
            <p id="username">{user.display_name}</p>
          </div>
        </div>
        <div className={styles['section-header']}>
          <h2>권한</h2>
        </div>
        <div className={styles['item-grid']}>
          <div className={styles['item-card']}>
            <h3>액세스</h3>
            <p id="username">{user.rank}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default MainContent;
