/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import '../styles.css';

import Pregame from './screens/Pregame.jsx';
import Game from './screens/Game.jsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Pregame />,
  },
  {
    path: '/game/:room_id',
    element: <Game />,
    loader: async ({ params }) => {
      return params.room_id;
    },
  },
]);

// App
function App() {
  return (
    <div className='App'>
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
