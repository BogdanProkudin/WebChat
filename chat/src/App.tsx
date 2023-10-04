import React from 'react';
import { Routes, Route, Navigate, useRoutes } from 'react-router-dom';

import { useState, useEffect } from 'react';
import { Sign } from './components/SignUp/SignUp';

import Registration from './components/Registration/Registration';
import Chat from './components/Chat/Chat';
import RegisterAvatarPage from './components/Registration/RegisterAvatarPage';

function App() {
  const token = localStorage.getItem('token');

  const routes = [
    {
      path: '/',
      element: token ? <Navigate to="/Chat" /> : <Navigate to="/signUp" />
    },
    {
      path: '/Registration/ProfileImage',
      element: token ? <Navigate to="/Chat" /> : <RegisterAvatarPage />
    },
    {
      path: '/signUp',
      element: token ? <Navigate to="/Chat" /> : <Sign />
    },
    {
      path: '/Chat/:id',
      element: token ? <Chat /> : <Navigate to="/signUp" />
    },
    {
      path: '/Chat',
      element: token ? <Chat /> : <Navigate to="/signUp" />
    },
    {
      path: '/Registration',
      element: token ? <Navigate to="/Chat" /> : <Registration />
    }
  ];
  const routing = useRoutes(routes);

  return <div className="App">{routing}</div>;
}

export default App;
