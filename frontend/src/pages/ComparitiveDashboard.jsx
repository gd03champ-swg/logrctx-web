// UnderConstruction.jsx
import React from 'react';
import { Typography } from 'antd';
import { ToolOutlined } from '@ant-design/icons';

const { Title } = Typography;

const ComparitiveDashboard = () => {
  return (
    <div style={{ textAlign: 'center', marginTop: '20%', color: '#595959' }}>
      <ToolOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
      <Title level={2}>This Page is Under Construction</Title>
      <p>We're working hard to bring you new features. Stay tuned!</p>
    </div>
  );
};

export default ComparitiveDashboard;
