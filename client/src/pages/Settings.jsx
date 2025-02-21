import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import SettingSidebar from '../components/SettingSidebar';
import Sidebar from '../components/Sidebar';
import styles from '../styles/settings.module.css';

function Settings() {
  const [isSettingsSidebarOpen, setIsSettingsSidebarOpen] = useState(false);
  const [showMainSidebar, setShowMainSidebar] = useState(false);

  const toggleSettingsSidebar = () => {
    setIsSettingsSidebarOpen(!isSettingsSidebarOpen);
    setShowMainSidebar(false);
  };

  const handleMainMenuClick = () => {
    setShowMainSidebar(true);
    setIsSettingsSidebarOpen(false);
  };

  return (
    <div className="container">
      <button 
        className={styles['settings-menu-toggle']} 
        onClick={toggleSettingsSidebar}
      >
        <i className={`fa-solid ${isSettingsSidebarOpen ? 'fa-times' : 'fa-bars'}`}></i>
      </button>

      {showMainSidebar ? (
        <Sidebar />
      ) : (
        <SettingSidebar 
          isOpen={isSettingsSidebarOpen} 
          onMainMenuClick={handleMainMenuClick}
        />
      )}

      <div className="main-content">
        <div className="content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default Settings;
