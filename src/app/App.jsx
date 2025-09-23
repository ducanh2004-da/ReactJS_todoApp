import React, { useState, useEffect } from 'react'
import { gql } from '@apollo/client';
import { client } from '../configs/client.config.js'; // adjust path if needed
import './App.css'
import Home from './Home/Home.jsx';
import Login from './Auth/Login.jsx';
import Main from './MainPage/Main.jsx';
import Register from './Auth/Register.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';
import { BrowserRouter, Routes, Route, Link, Outlet } from 'react-router-dom';
import RequireRole from './components/RequireRole.jsx';
import AdminPage from './Admin/adminPage.jsx';
function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <header className="app-header">
          <div className="app-header-content">
            <span className="app-logo">📝</span>
            <span className="app-title">Todo List App</span>
            <nav className="app-nav">
              <Link to="/">Home</Link>
              <Link to="/signin">Sign In</Link>
              <Link to="/signup">Sign Up</Link>
              <Link to="/task">Main Page</Link>
              <Link to="/admin">Admin Page</Link>
            </nav>
          </div>
        </header>
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/signin" element={<Login />} />
            <Route path="/signup" element={<Register />} />
            <Route path="/task" element={
              <RequireRole allowedRoles={['USER','ADMIN']}>
                <Main />
              </RequireRole>
            } />
            <Route path='/admin' element={
              <RequireRole allowedRoles={['ADMIN']}>
                <AdminPage />
              </RequireRole>} />
          </Routes>
        </main>
        <footer className="app-footer">
          &copy; {new Date().getFullYear()} Made by Duc Anh. All rights reserved.
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App