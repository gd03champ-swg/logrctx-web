// App.jsx
import React, { useState } from 'react';
import { Layout, Menu, Typography, Avatar } from 'antd';
import { DashboardOutlined, UserOutlined, FileTextOutlined, SettingOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { BrowserRouter as Router, Route, Routes, Link, useLocation } from 'react-router-dom';
import LogReducer from './components/LogReducer.jsx'; // The Log Reducer component
import UnderConstruction from './components/UnderConstruction.jsx'; // The Under Construction component

const { Header, Sider, Content, Footer } = Layout;
const { Title } = Typography;

// Breadcrumb component that dynamically updates based on the current path
const Breadcrumbs = () => {
  const location = useLocation();
  const pathSnippets = location.pathname.split('/').filter(i => i);
  
  const breadcrumbItems = [
    <Link to="/" key="dashboard">Logrctx</Link>,
    ...pathSnippets.map((_, index) => {
      const url = `/${pathSnippets.slice(0, index + 1).join('/')}`;
      return (
        <Link to={url} key={url}>
          {pathSnippets[index]}
        </Link>
      );
    })
  ];

  return (
    <div style={{ margin: '16px', marginTop: '16px', marginLeft: '32px' }}>
      {breadcrumbItems.map((item, index) => (
        <span key={index}>
          {item} {index < breadcrumbItems.length - 1 && '/ '}
        </span>
      ))}
    </div>
  );
};

const App = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Router>
      <Layout style={{ minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={(value) => setCollapsed(value)}
        >
          <div style={{ height: '32px', margin: '16px', textAlign: 'center', color: 'white' }}>
            <Title level={4} style={{ color: 'white', margin: 0 }}>Logrctx</Title>
          </div>
          <Menu
            theme="dark"
            mode="inline"
            defaultSelectedKeys={['1']}
          >
            <Menu.Item key="1" icon={<DashboardOutlined />}>
              <Link to="/">Log Reducer</Link>
            </Menu.Item>
            <Menu.Item key="2" icon={<FileTextOutlined />}>
              <Link to="/logrctx-ai">Logrctx AI</Link>
            </Menu.Item>
            <Menu.Item key="3" icon={<SettingOutlined />}>
              <Link to="/settings">Settings</Link>
            </Menu.Item>
            <Menu.Item key="4" icon={<InfoCircleOutlined />}>
              <Link to="/about">About</Link>
            </Menu.Item>
          </Menu>
        </Sider>
        <Layout>
          <Header style={{ background: '#fff', padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
            <Title level={3} style={{ margin: 0 }}>Logrctx Web</Title>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Avatar size="large" icon={<UserOutlined />} />
              <span style={{ marginLeft: '8px', color: '#595959' }}>Admin</span>
            </div>
          </Header>

          <Breadcrumbs /> {/* Dynamic Breadcrumbs */}

          <Content style={{ margin: '24px 16px 0', padding: '24px', transition: 'all 0.3s', backgroundColor: '#fff', borderRadius: '8px' }}>
            <Routes>
              <Route path="/" element={<LogReducer />} />
              <Route path="/logrctx-ai" element={<UnderConstruction />} />
              <Route path="/settings" element={<UnderConstruction />} />
              <Route path="/about" element={<UnderConstruction />} />
            </Routes>
          </Content>
          <Footer style={{ textAlign: 'center', background: '#fff', borderTop: '1px solid #e8e8e8' }}>Log Reducer Dashboard ©2024</Footer>
        </Layout>
      </Layout>
    </Router>
  );
};

export default App;
