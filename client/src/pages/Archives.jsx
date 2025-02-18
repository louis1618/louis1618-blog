import React, { useContext } from 'react';
import '../styles/Notice.css';
import { AuthContext } from '../AuthContext';

function MainContent() {
  const { user, isAuthenticated} = useContext(AuthContext);

  return (
    <section className="content">
      <div className="home-header">
        {isAuthenticated === true ? <h1 id="username">{user.user_handle} 님에게 공개하는 나의 업적</h1> : <h1>업적</h1>}
      </div>

      <div className="notice-section">
        <div className="section-header">
          <h2>2025</h2>
        </div>
        <div className="item-grid">
          <div className="item-card">
            <h3>없어요</h3>
            <p>네 없어요</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default MainContent;