import React from 'react';
import '../styles/Project.css';

function MainContent() {
  return (
    <section className="content">
      <div className="recent-posts-section">
        <div className="section-header">
          <h2>진행 중인 프로젝트</h2>
        </div>
        <div className="item-grid">
          <div className="item-card">
            <h3>포트폴리오 사이트 제작</h3>
            <p>2025-02-14</p>
          </div>
        </div>
      </div>

      <div className="notice-section">
        <div className="section-header">
          <h2>2025 프로젝트</h2>
        </div>
        <div className="item-grid">
          <div className="item-card">
            <h3>포트폴리오 사이트 제작</h3>
            <p>2025-02-14</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default MainContent;
