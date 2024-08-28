import React, { useState } from 'react';
import { Form, Input, Button, Card, Avatar, notification, Spin, Typography, Divider, Row, Col } from 'antd';
import { LockOutlined, MailOutlined, UserOutlined, GoogleOutlined } from '@ant-design/icons';
import { useNavigate, Navigate } from 'react-router-dom';
import { CognitoUserAttribute } from 'amazon-cognito-identity-js';

import userpool from '../handlers/userpool';

const { Title, Text } = Typography;

const SignUpPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [signUpErr, setSignUpErr] = useState(null);
  const navigate = useNavigate();

  const user = userpool.getCurrentUser();
  if (user) {
    return <Navigate to="/" />;
  }

  const handleSignUp = () => {
    setLoading(true);
    const attributeList = [];
    attributeList.push(
      new CognitoUserAttribute({
        Name: 'email',
        Value: email,
      })
    );

    userpool.signUp(email, password, attributeList, null, (err, data) => {
      setLoading(false);
      if (err) {
        setSignUpErr(err.message);
        notification.error({
          message: 'Sign Up Failed',
          description: err.message || 'An error occurred during sign up.',
        });
      } else {
        notification.success({
          message: 'Sign Up Successful',
          description: 'Please check your email to verify your account.',
        });

        // Redirect to verification page
        navigate('/verify', { state: { email } });
      }
    });
  };

  const handleSSOLogin = (provider) => {
    notification.info({
      message: `Sign up with ${provider}`,
      description: `${provider} sign up not implemented.`,
    });
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
        <Title level={3} style={{ textAlign: 'center', marginBottom: '20px' }}>Create an Account</Title>
        <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginBottom: '24px' }}>
          Please fill in the details to sign up
        </Text>

        <Form layout="vertical" onFinish={handleSignUp}>
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
            <Button 
              type="primary" 
              htmlType="submit" 
              block 
              size="large" 
              style={{ background: '#1890ff', borderColor: '#1890ff', height: '50px', fontSize: '16px' }}
              disabled={loading}
            >
              {loading ? <Spin /> : 'Sign Up'}
            </Button>
          </Form.Item>
        </Form>

        {signUpErr && (
          <div style={{ textAlign: 'center', marginTop: '16px', color: 'red' }}>
            {signUpErr}
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
          Sign up with Google
        </Button>

        <Button
          icon={<UserOutlined />}
          size="large"
          block
          style={{ height: '50px', fontSize: '16px' }}
          onClick={() => handleSSOLogin('Swiggy SSO')}
        >
          Sign up with Swiggy SSO
        </Button>
      </Card>
    </div>
  );
};

export default SignUpPage;
