import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

/**import all components */
import PageNotFound from './components/pagenotfound';
import Password from './components/password';
import Profile from './components/profile';
import Recovery from './components/recovery';
import Register from './components/register';
import Reset from './components/reset';
import Username from './components/username';

/**auth middleware */
import { AuthorizeUser, ProtectRoute } from './middleware/auth';

/**root routes */
const router = createBrowserRouter([
  {
    path: '/',
    element: <Username />,
  },
  {
    path: '/register',
    element: <Register> </Register>,
  },
  {
    path: '/password',
    element: (
      <ProtectRoute>
        <Password />
      </ProtectRoute>
    ),
  },
  {
    path: '/profile',
    element: (
      <AuthorizeUser>
        <Profile />
      </AuthorizeUser>
    ),
  },
  {
    path: '/reset',
    element: <Reset> </Reset>,
  },
  {
    path: '/recovery',
    element: <Recovery> </Recovery>,
  },
  {
    path: '*',
    element: <PageNotFound> </PageNotFound>,
  },
]);

export default function App() {
  return (
    <main>
      <RouterProvider router={router}></RouterProvider>
    </main>
  );
}
