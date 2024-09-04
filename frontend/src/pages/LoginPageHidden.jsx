import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Avatar, notification, Spin, Typography, Checkbox, Divider, Row, Col } from 'antd';
import { LockOutlined, MailOutlined, GoogleOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate, Navigate } from 'react-router-dom';

import { authenticate } from '../handlers/auth';
import userpool from '../handlers/userpool';

import LoadingScreen from '../components/LoadingScreen';

const { Title, Text } = Typography;

const LoginPageHidden = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginErr, setLoginErr] = useState(null);
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
    return <LoadingScreen />;  // Optionally show a loading state
  }

  if (isAuthenticated) {
    return <Navigate to="/" />;
  }


  const handleLogin = async () => {
    setLoading(true);
    authenticate(email, password)
      .then((data) => {
        setLoading(false);
        notification.success({
          message: 'Login Successful',
          description: 'You have successfully logged in.',
        });
        onLoginSuccess(); // Handle any post-login logic here
        setIsAuthenticated(true);
      })
      .catch((err) => {
        setLoading(false);
  
        // User verification logic if UserNotConfirmedException is thrown
        if (err.code === 'UserNotConfirmedException') {
          notification.warning({
            message: 'Account Not Verified',
            description: 'Please verify your account before logging in.',
          });

          console.log("Email passing to verify page: ", email);
  
          // Programmatic navigation to the verification page
          navigate('/verify', { state: { email } }); // Pass the email if needed on the verification page
          return;
        }
  
        setLoginErr(err.message);
        console.log(err);
        notification.error({
          message: 'Login Failed',
          description: err.message || 'An error occurred during login.',
        });
      });
  };

  const handleSSOLogin = (provider) => {
    if (provider === 'Swiggy SSO') {
      const domain = import.meta.env.VITE_COGNITO_DOMAIN // Your Cognito domain
      const clientId = import.meta.env.VITE_CLIENT_ID; // Your Cognito client ID
      const redirectUri = import.meta.env.VITE_SELF_URL +'/callback'; // Your redirect URI for local testing
  
      const loginUrl = `https://${domain}/login?response_type=token&client_id=${clientId}&redirect_uri=${redirectUri}&identity_provider=SAML`;
  
      // Redirect to Cognito hosted UI
      window.location.href = loginUrl;
    } else {
      notification.info({
        message: `Sign in with ${provider}`,
        description: `${provider} login not implemented.`,
      });
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100%', 
      backgroundImage: 'linear-gradient(135deg, #f0f2f5 50%, #001529 50%)', 
      padding: '50px',
    }}>
      <Card 
        bordered={false} 
        style={{ 
          maxWidth: '500px', 
          width: '100%', 
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)', 
          borderRadius: '12px', 
          padding: '40px', 
          backgroundColor: '#fff' 
        }}
      >
        <Row justify="center" style={{ marginBottom: '20px' }}>
          <Avatar size={80} icon={<UserOutlined />} />
        </Row>
        <Title level={3} style={{ textAlign: 'center', marginBottom: '20px' }}>Welcome Back</Title>
        <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginBottom: '24px' }}>
          Please log in to continue
        </Text>

        <Form layout="vertical" onFinish={handleLogin}>
          <Form.Item
            name="email"
            rules={[{ required: true, message: 'Please enter your email!' }]}
          >
            <Input
              prefix={<MailOutlined />} 
              placeholder="Email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              size="large"
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please enter your password!' }]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="Password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              size="large"
            />
          </Form.Item>
          <Form.Item>
            <Checkbox>Keep me logged in</Checkbox>
          </Form.Item>
          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              block 
              size="large" 
              style={{ background: '#1890ff', borderColor: '#1890ff', height: '50px', fontSize: '16px' }}
              disabled={loading}
            >
              {loading ? <Spin /> : 'Login'}
            </Button>
          </Form.Item>
        </Form>

        {loginErr && (
          <div style={{ textAlign: 'center', marginTop: '16px', color: 'red' }}>
            {loginErr}
          </div>
        )}

        <Divider>Or</Divider>

        <Button
          icon={<GoogleOutlined />}
          size="large"
          block
          style={{ marginBottom: '10px', height: '50px', fontSize: '16px' }}
          onClick={() => handleSSOLogin('Google')}
        >
          Sign in with Google
        </Button>

        <Button
          icon={<UserOutlined />}
          size="large"
          block
          style={{ height: '50px', fontSize: '16px' }}
          onClick={() => handleSSOLogin('Swiggy SSO')}
        >
          Sign in with Swiggy SSO
        </Button>
      </Card>
    </div>
  );
};

export default LoginPageHidden;
