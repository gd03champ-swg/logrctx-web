// App.jsx
import React, { useState, useEffect } from 'react';
import { Layout, Typography, Avatar, Modal, Button, Drawer, FloatButton } from 'antd';
import { UserOutlined, QuestionCircleOutlined  } from '@ant-design/icons';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { Tag } from "antd";

import Dashboard from './pages/Dashboard.jsx'; // The Log Reducer component
import UnderConstruction from './pages/UnderConstruction.jsx'; // The Under Construction component

import PrivateRoute from './components/PrivateRoute.jsx';  // Import the PrivateRoute component
import MenuComponent from './components/MenuComponent.jsx';
import LoginPage from './pages/LoginPage.jsx'; // The Login Page component
import SignUpPage from './pages/SignUpPage.jsx'; // The SignUp Page component
import LoginPageHidden from './pages/LoginPageHidden.jsx'; // The Hidden Login Page component
import VerificationPage from './pages/VerificationPage.jsx'; // The Verification Page component
import NotFoundPage from './pages/NotFoundPage.jsx'; // The 404 Page component
import LoadingScreen from './components/LoadingScreen.jsx';
import Callback from './components/Callback.jsx'; // The Callback Page component
import AnalysisHistory from './pages/AnalysisHistory.jsx';
import AboutWiki from './pages/AboutWiki.jsx';
import ComparitiveDashboard from './pages/ComparitiveDashboard.jsx';
import APITokenPage from './pages/APITokenPage.jsx';

import myLogo from './assets/logo.png';
import MyLogoName from './assets/logo-name.png';

import userpool from './handlers/userpool';
import { logout } from './handlers/auth.js';

const { Header, Sider, Content, Footer } = Layout;
const { Title } = Typography;

import './App.css';

const App = () => {
  const [collapsed, setCollapsed] = useState(true);
  const [user, setUser] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);


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
          window.location.href = '/login';
        } catch (error) {
          console.log('Error signing out: ', error);
        }
      }
    });
  };


  return (
    <Router>

      <FloatButton
        icon={<QuestionCircleOutlined />}
        type="default"
        onClick={() => setDrawerOpen(true)}
        style={{
          insetInlineEnd: 68,
        }}
      />

      <Drawer
       title="Help" 
       onClose={() => setDrawerOpen(false)} 
       open={drawerOpen}
       width={1000}
       >
        <AboutWiki />
      </Drawer>


      <Layout style={{ minHeight: '100vh', backgroundColor: '#f0f2f5' }}>

        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={(value) => setCollapsed(value)}
          style={{
            position: 'fixed',
            height: '100vh',
            left: 0,
            top: 0,
            bottom: 0,
            zIndex: 1000,
          }}
        >
          <div style={{ height: '32px', margin: '16px', textAlign: 'center', color: 'white' }}>
          {/*<div id='logo' className="logo, zoom" style={{ height: '31px', background: '#333', borderRadius: '6px', margin: '8px 12px 8px 12px'}}></div>*/}
          <img id='logo' onClick={() => window.location.href = "/"} className="zoom" style={{width: '90%', maxWidth: '55px'}} src={myLogo}/>
          </div>
          <MenuComponent user={user} handleLogout={handleLogout} collapsed />
        </Sider>

        <Layout 
          style={{ 
            marginLeft: collapsed ? 80 : 200 ,
            transition: 'margin-left 0.3s ease',
            }}
          >

          <Header style={{ background: '#fff', padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
            <div style={{display: 'flex', alignItems: 'center', width: '20%'}}>
            <img className='zoom' style={{width: '100%', maxWidth: '100px'}} src={MyLogoName}/>
            <Tag style={{height:'50%', marginLeft: '5%'}} color="green">logman v2</Tag>
            <Tag style={{height:'50%', marginLeft: '5%'}} color="yellow">beta</Tag>
            </div>
            { user && 
                <Button onClick={handleLogout} type="dashed" id="userAvatar" style={{ padding: '20px', display: 'flex', alignItems: 'center' }}>
                  <Avatar size="medium" icon={<UserOutlined />} />
                  <span>{ user.split('@')[0].split('.')[0] }</span>
                </Button>
            }
          </Header>

          <Content style={{ margin: '24px 16px 0', padding: '24px', transition: 'all 0.3s', backgroundColor: '#fff', borderRadius: '8px' }}>
            <Routes>

              <Route path='/verify' element={<VerificationPage />} />
              <Route path='/callback' element={<Callback />} />

              {/* Public routes (accesed only if user is not authenticated) */}
              <Route path="/login" element={<LoginPage onLoginSuccess={handleAuthenticated} />} />
              {/*<Route path="/signup" element={<SignUpPage />} />*/}

              {/* Hidden routes */}
              <Route path="/login-hidden-manual" element={<LoginPageHidden onLoginSuccess={handleAuthenticated} />} />
              

              {/* Private routes */}
              <Route path="/" element={<PrivateRoute element={Dashboard} />} />
              <Route path="/compare" element={<PrivateRoute element={ComparitiveDashboard} />} />
              <Route path="/history" element={<PrivateRoute element={AnalysisHistory} />} />
              <Route path="/api-token" element={<PrivateRoute element={APITokenPage} />} />
              <Route path="/about" element={<PrivateRoute element={AboutWiki} />} />

              <Route path='/loading' element={<LoadingScreen />} />

              {/* 404 Route */}
              <Route path="*" element={<NotFoundPage />} />

            </Routes>
          </Content>

          <Footer style={{ textAlign: 'center', background: '#fff', borderTop: '1px solid #e8e8e8', marginTop: '2%' }}>
          <img className='zoom' style={{width: '100%', maxWidth: '82px'}} src={MyLogoName}/>
          {/*<Tag style={{marginLeft: '10px'}} color="purple">v0.6</Tag>*/}
            </Footer>
        </Layout>

      </Layout>
    </Router>
  );
};

export default App;
