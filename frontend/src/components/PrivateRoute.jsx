import React from 'react';
import { Navigate } from 'react-router-dom';
import { notification } from 'antd';
import userpool from '../handlers/userpool';

const PrivateRoute = ({ element: Element }) => {
  const user = userpool.getCurrentUser();

  if (!user){
    // Display notification to the user
    notification.warning({
      message: 'Unauthorized',
      description: 'You must be signed in to access this.',
      placement: 'topRight',
    });

    // Redirect to login page
    return <Navigate to="/login" />;
  }

  user.getSession((err, session) => {
    if (err) {
      // Display notification to the user
      notification.error({
        message: 'Session Expired',
        description: 'Your session has expired. Please sign in again.',
        placement: 'topRight',
      });

      // Redirect to login page
      window.location.href = '/login';
    }
  })

  // If user is authenticated, render the element
  return <Element />;
};

export default PrivateRoute;