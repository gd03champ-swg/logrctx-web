import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { notification } from 'antd';
import userpool from '../handlers/userpool';
import { useNavigate } from 'react-router-dom';

import LoadingScreen from './LoadingScreen';

const PrivateRoute = ({ element: Element }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);  // Track loading state

  const navigate = useNavigate();

  useEffect(() => {
    const user = userpool.getCurrentUser();
    if (user) {
      user.getSession((err, session) => {
        if (!err) {
          setIsAuthenticated(true); // User is authenticated
        }
        setIsPageLoading(false); // End loading state
      });
    } else {
      setIsPageLoading(false); // End loading state if no user
    }
  }, []);

  if (isPageLoading) {
    return <LoadingScreen />; 
  }

  // If user is authenticated, render the element
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  } else {
    return <Element />;
  }

};

export default PrivateRoute;