// MenuComponent.jsx
import React from 'react';
import { Menu, Typography } from 'antd';
import { useLocation } from 'react-router-dom';
import { DashboardOutlined, UserOutlined, FileTextOutlined, SettingOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { LogoutOutlined, UserAddOutlined, LoginOutlined, AreaChartOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

const { Title } = Typography;

const MenuComponent = ({ user, handleLogout }) => {
  const location = useLocation();

  return (
    <Menu
      theme="dark"
      mode="inline"
      selectedKeys={[location.pathname]}
      style={{ height: '100%', marginTop: '25px' }}
    >
      {user && (
        <>
          <Menu.Item key="/" icon={<DashboardOutlined />}>
            <Link to="/">Dashboard</Link>
          </Menu.Item>
          <Menu.Item key="/logrctx-ai" icon={<AreaChartOutlined />}>
            <Link to="/logrctx-ai">AI Summarize</Link>
          </Menu.Item>
          <Menu.Item key="/settings" icon={<SettingOutlined />}>
            <Link to="/settings">Settings</Link>
          </Menu.Item>
          <Menu.Item key="/about" icon={<InfoCircleOutlined />}>
            <Link to="/about">About</Link>
          </Menu.Item>
          <Menu.Item key="/logout" icon={<LogoutOutlined />} onClick={handleLogout}>
            Logout
          </Menu.Item>
        </>
      )}
      {!user && (
        <>
          <Menu.Item key="/signup" icon={<UserAddOutlined />}>
            <Link to="/signup">SignUp</Link>
          </Menu.Item>
          <Menu.Item key="/login" icon={<LoginOutlined />}>
            <Link to="/login">Login</Link>
          </Menu.Item>
        </>
      )}
    </Menu>
  );
};

export default MenuComponent;