// App.jsx
import React, { useState, useEffect } from 'react';
import { Layout, Typography, Avatar, Modal } from 'antd';
import { UserOutlined  } from '@ant-design/icons';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { Breadcrumbs } from './components/Breadcumbs.jsx';

import Dashboard from './pages/Dashboard.jsx'; // The Log Reducer component
import UnderConstruction from './pages/UnderConstruction.jsx'; // The Under Construction component

import PrivateRoute from './components/PrivateRoute.jsx';  // Import the PrivateRoute component
import MenuComponent from './components/MenuComponent.jsx';
import LoginPage from './pages/LoginPage.jsx'; // The Login Page component
import SignUpPage from './pages/SignUpPage.jsx'; // The SignUp Page component
import VerificationPage from './pages/VerificationPage.jsx'; // The Verification Page component

import userpool from './handlers/userpool';
import { logout } from './handlers/auth.js';

const { Header, Sider, Content, Footer } = Layout;
const { Title } = Typography;

import './App.css';

const App = () => {
  const [collapsed, setCollapsed] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    handleAuthenticated()
  }, []);

  const handleAuthenticated = async () => {
    const currentUser = userpool.getCurrentUser();
    if (currentUser) {
      currentUser.getSession((err, session) => {
        if (!err) {
          setUser(session.getIdToken().payload.email);
        } else {
          console.log("No session found")
        }
      });
    }
  };

  const handleLogout = async () => {
    Modal.confirm({
      title: 'Logout',
      content: 'Are you sure you want to logout?',
      onOk: () => {
        try {
          logout();
          setUser(null);
          console.log('Logged out successfully');
        } catch (error) {
          console.log('Error signing out: ', error);
        }
      }
    });
  };

  return (
    <Router>
      <Layout style={{ minHeight: '100vh', backgroundColor: '#f0f2f5' }}>

        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={(value) => setCollapsed(value)}
        >
          <div style={{ height: '32px', margin: '16px', textAlign: 'center', color: 'white' }}>
          <div id='logo' className="logo, zoom" style={{ height: '31px', background: '#333', borderRadius: '6px', margin: '8px 12px 8px 12px'}}></div>
          </div>
          <MenuComponent user={user} handleLogout={handleLogout} />
        </Sider>

        <Layout>

          <Header style={{ background: '#fff', padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
            <Title level={3} style={{ margin: 0 }}>Logrctx</Title>
            { user && 
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Avatar size="large" icon={<UserOutlined />} />
              <span style={{ marginLeft: '8px', color: '#595959' }}>{user}</span>
            </div>
            }
          </Header>

          {/*<Breadcrumbs /> {/* Dynamic Breadcrumbs */}

          <Content style={{ margin: '24px 16px 0', padding: '24px', transition: 'all 0.3s', backgroundColor: '#fff', borderRadius: '8px' }}>
            <Routes>

              <Route path='/verify' element={<VerificationPage />} />

              // Public routes (accesed only if user is not authenticated)
              <Route path="/login" element={<LoginPage onLoginSuccess={handleAuthenticated} />} />
              <Route path="/signup" element={<SignUpPage />} />

              // Private routes
              <Route path="/" element={<PrivateRoute element={Dashboard} />} />
              <Route path="/logrctx-ai" element={<PrivateRoute element={UnderConstruction} />} />
              <Route path="/settings" element={<PrivateRoute element={UnderConstruction} />} />
              <Route path="/about" element={<PrivateRoute element={UnderConstruction} />} />

            </Routes>
          </Content>

          <Footer style={{ textAlign: 'center', background: '#fff', borderTop: '1px solid #e8e8e8', marginTop: '2%' }}>Log Reducer Dashboard ©2024</Footer>
        </Layout>
      </Layout>
    </Router>
  );
};

export default App;
