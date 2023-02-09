/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import Pregame from './screens/Pregame.jsx';
import Lobby from './pregame/Lobby.jsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Pregame />,
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
