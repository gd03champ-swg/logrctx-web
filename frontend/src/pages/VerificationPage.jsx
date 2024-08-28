import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, notification, Typography } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import { CognitoUser } from 'amazon-cognito-identity-js';
import userpool from '../handlers/userpool';

const { Title, Text } = Typography;

const VerificationPage = () => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resent, setResent] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Extracting email from location state
  const { email } = location.state || {};

  useEffect(() => {
    if (!email) {
      navigate('/');
    }
  }, [email, navigate]);

  const handleVerify = () => {
    setLoading(true);

    console.log("code in verify: "+code);

    if (!code.trim()) {
        notification.error({
          message: 'Verification Failed',
          description: 'Please enter a valid verification code.',
        });
        setLoading(false);
        return;
      }

    const user = new CognitoUser({
      Username: email,
      Pool: userpool,
    });

    user.confirmRegistration(code, true, (err, result) => {
      setLoading(false);
      if (err) {
        notification.error({
          message: 'Verification Failed',
          description: err.message || 'An error occurred during verification.',
        });
      } else {
        notification.success({
          message: 'Verification Successful',
          description: 'Your account has been verified.',
        });
        navigate('/login'); // Redirect to login page
      }
    });
  };

  const handleResendCode = () => {
    const user = new CognitoUser({
      Username: email,
      Pool: userpool,
    });

    user.resendConfirmationCode((err) => {
      if (err) {
        notification.error({
          message: 'Resend Failed',
          description: err.message || 'An error occurred while resending the code.',
        });
      } else {
        notification.success({
          message: 'Code Resent',
          description: 'A new verification code has been sent to your email.',
        });
        setResent(true);
      }
    });
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100%', backgroundColor: '#f0f2f5' }}>
      <Card bordered={false} style={{ maxWidth: '400px', width: '100%', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)', borderRadius: '8px', padding: '24px' }}>
        <Title level={3} style={{ textAlign: 'center', marginBottom: '20px' }}>Verify Your Account</Title>
        <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginBottom: '24px' }}>
          Enter the verification code sent to your email.
        </Text>

        <Form layout="vertical" onFinish={handleVerify}>
          <Form.Item name="email" initialValue={email}>
            <Input
              prefix={<MailOutlined />} 
              placeholder="Email" 
              disabled 
              size="large" 
            />
          </Form.Item>
          <Form.Item
            name="code"
            rules={[{ required: true, message: 'Please enter the verification code!' }]}
          >
            <Input
              prefix={<LockOutlined />}
              placeholder="Verification Code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              size="large"
            />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              style={{ background: '#1890ff', borderColor: '#1890ff', height: '45px' }}
              loading={loading}
            >
              Verify Account
            </Button>
          </Form.Item>
        </Form>

        <Button
          type="link"
          onClick={handleResendCode}
          disabled={resent}
          block
          style={{ textAlign: 'center', marginTop: '10px' }}
        >
          Resend Verification Code
        </Button>
      </Card>
    </div>
  );
};

export default VerificationPage;
