import React from 'react';
import { Spin, Typography, Space, Row, Col, Image } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import logo from '../assets/logo.png';
import nameLogo from '../assets/logo-name.png';

const { Text } = Typography;

const LoadingScreen = () => {
  return (
    <div style={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <Row justify="center" align="middle">
        <Col>
          <Space direction="vertical" align="center" size="large">
            {/* Optional: Add a logo or branding image */}
            <Image
              width={120}
              src={logo} // Replace with your logo or a relevant image
              preview={false}
            />
            <Spin
              indicator={<LoadingOutlined style={{ fontSize: 64, color: '#1890ff' }} spin />}
              tip={<Text style={{ fontSize: 24, color: '#fff' }}>Just a moment...</Text>}
            />
            <Text style={{ opacity: 0.7 }}>We’re preparing something amazing for you.</Text>
            <Image
              width={120}
              src={nameLogo} // Replace with your logo or a relevant image
              preview={false}
            />
          </Space>
        </Col>
      </Row>
    </div>
  );
};

export default LoadingScreen;
