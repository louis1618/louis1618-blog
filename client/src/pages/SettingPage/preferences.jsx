import React, { useState } from 'react';
import styles from '../../styles/settings.module.css';  // CSS 모듈 import

function MainContent() {
  // 라이트/다크 모드 상태 관리
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode(prevMode => !prevMode);
    // 실제 테마 변경
    document.body.classList.toggle('dark-mode', !isDarkMode);
  };

  return (
    <section className={'content'}>
      <div className={styles.header}>
        <h1 className={styles['set_header_title']}>환경설정</h1>
      </div>

      <div className={styles['notice-section']}>
        <div className={styles['section-header']}>
          <h2>외관</h2>
        </div>
        <div className={styles['item-grid']}>
          <div className={styles['item-card']}>
            <h3>라이트/다크모드</h3>
            <p>개발 중인 기능입니다.</p>
            <button className={styles['theme-toggle-btn']} onClick={toggleTheme}>
              {isDarkMode ? '라이트 모드' : '다크 모드'}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default MainContent;
