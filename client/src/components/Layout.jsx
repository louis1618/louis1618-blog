import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import '../styles/Layout.css'

function Layout() {
  return (
    <div className="container">
      <div className="main-content">
          <Sidebar />
          <Outlet />
      </div>
    </div>
  );
}

export default Layout;
