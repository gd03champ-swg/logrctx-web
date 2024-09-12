import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, DatePicker, notification, Typography, Space, Alert, Divider, Row, Col, List, Popconfirm } from 'antd';
import { CopyOutlined, LockOutlined, DeleteOutlined, RedoOutlined, InfoCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { getSuperToken } from '../handlers/auth';

const { Paragraph, Title, Text } = Typography;

const APITokenPage = () => {
  const [form] = Form.useForm();
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [storedTokens, setStoredTokens] = useState([]);

  // Load stored tokens from localStorage on component mount
  useEffect(() => {
    const tokens = JSON.parse(localStorage.getItem('apiTokens')) || [];
    setStoredTokens(tokens);
  }, []);

  // Function to generate the API token
  const generateToken = (values) => {
    setLoading(true);

    // Simulate API token generation
    setTimeout( async () => {
      const newToken = await getSuperToken();
      const expiration = values.expirationDate.format('YYYY-MM-DD');
      const tokenData = { tokenName: values.tokenName, token: newToken, expiration, created: dayjs().format('YYYY-MM-DD HH:mm:ss') };

      // Save to localStorage
      const updatedTokens = [...storedTokens, tokenData];
      localStorage.setItem('apiTokens', JSON.stringify(updatedTokens));
      setStoredTokens(updatedTokens);

      // Show notification
      setToken(newToken);
      notification.success({
        message: 'Token Generated',
        description: 'Your API token has been successfully generated!',
      });

      setLoading(false);
    }, 2000);
  };

  // Function to handle deleting a token
  const handleDeleteToken = (tokenToDelete) => {
    const updatedTokens = storedTokens.filter((item) => item.token !== tokenToDelete);
    localStorage.setItem('apiTokens', JSON.stringify(updatedTokens));
    setStoredTokens(updatedTokens);

    notification.info({
      message: 'Token Deleted',
      description: 'The token has been successfully deleted.',
    });
  };

  // Function to handle copying the token to clipboard
  const copyToClipboard = (token) => {
    navigator.clipboard.writeText(token);
    notification.success({
      message: 'Token Copied',
      description: 'The token has been copied to your clipboard.',
    });
  };

  return (
    <div style={{ padding: '40px', backgroundColor: '#f0f2f5' }}>
      <Row justify="center" gutter={[16, 16]}>
        <Col xs={24} md={16} lg={12}>
          <Card style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
            <Title level={2} style={{ textAlign: 'center' }}>
              <LockOutlined /> Generate API Token
            </Title>
            <Divider />
            <Form form={form} layout="vertical" onFinish={generateToken}>
              <Form.Item
                label="Token Name"
                name="tokenName"
                rules={[{ required: true, message: 'Please input a token name!' }]}
              >
                <Input placeholder="Enter a descriptive name for your token" />
              </Form.Item>

              <Form.Item
                label="Expiration Date"
                name="expirationDate"
                initialValue={dayjs().add(1, 'day')} // Set default to next day
                rules={[{ required: true, message: 'Please select an expiration date!' }]}
                >
                <DatePicker
                    style={{ width: '100%' }}
                    format="YYYY-MM-DD"
                    disabledDate={(current) => current && current < dayjs().endOf('day')}
                    defaultValue={dayjs().add(1, 'day')} // Default to next day
                    disabled // Disable user modification
                />
                </Form.Item>


              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<LockOutlined />}
                  block
                  loading={loading}
                >
                  Generate Token
                </Button>
              </Form.Item>
              <Button
                type="link"
                href="/about#api-usage"  // Link to the About page's API usage section
                icon={<InfoCircleOutlined />}
                >
                Learn more about API usage
                </Button>
            </Form>

            {token && (
              <>
                <Divider />
                <Alert
                  message="API Token Generated"
                  description="Please copy and store this token securely. You won't be able to see it again!"
                  type="success"
                  showIcon
                />
                <div style={{ marginTop: '20px' }}>
                  <Paragraph copyable={{ text: token, icon: <CopyOutlined /> }} style={{ wordBreak: 'break-all' }}>
                    <Text code>{token}</Text>
                  </Paragraph>
                  <Button type="default" icon={<RedoOutlined />} style={{ marginLeft: '10px' }} onClick={() => setToken(null)}>
                    Regenerate
                  </Button>
                </div>

              </>
            )}
          </Card>

          {/* List of Generated Tokens */}
          {storedTokens.length > 0 && (
            <Card
              style={{ marginTop: '20px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}
              title="Previously Generated Tokens"
            >
              <List
                bordered
                dataSource={storedTokens}
                renderItem={(item) => (
                  <List.Item
                    actions={[
                      <Button icon={<CopyOutlined />} onClick={() => copyToClipboard(item.token)}>
                        Copy
                      </Button>,
                      <Popconfirm
                        title="Are you sure you want to delete this token?"
                        onConfirm={() => handleDeleteToken(item.token)}
                        okText="Yes"
                        cancelText="No"
                      >
                        <Button icon={<DeleteOutlined />} danger>
                          Delete
                        </Button>
                      </Popconfirm>,
                    ]}
                  >
                    <List.Item.Meta
                      title={item.tokenName}
                      description={`Token created: ${item.created}, Expires on: ${item.expiration}`}
                    />
                  </List.Item>
                )}
              />
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default APITokenPage;
