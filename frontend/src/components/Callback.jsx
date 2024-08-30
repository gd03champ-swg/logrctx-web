import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import userpool from '../handlers/userpool'; // Existing Cognito pool
import { authenticateWithSSOTokens } from '../handlers/auth'; // New function for SSO

import LoadingScreen from './LoadingScreen';

const Callback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.substring(1)); // Remove the leading `#`

    const idToken = params.get('id_token');
    const accessToken = params.get('access_token');

    if (idToken && accessToken) {
      // Use a helper function to handle SSO tokens
      authenticateWithSSOTokens(idToken, accessToken)
        .then(() => {
          navigate('/');
        })
        .catch(err => {
          console.error('SSO authentication failed', err);
        });
    } else {
      console.error('Authentication failed, no token found');
    }
  }, [navigate]);

  return <LoadingScreen />;
};

export default Callback;
