import React from 'react';
import { Outlet } from 'react-router-dom';
import MainSidebar from './Sidebar';
import Sidebar from './SettingSidebar';
import '../styles/Layout.css'

function Layout() {
  return (
    <div className="container">
      <div className="main-content">
          <MainSidebar />
          <Sidebar />
          <Outlet />
      </div>
    </div>
  );
}

export default Layout;
