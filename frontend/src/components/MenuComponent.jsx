// MenuComponent.jsx
import React from 'react';
import { Menu, Typography } from 'antd';
import { useLocation } from 'react-router-dom';
import { DashboardOutlined, FileDoneOutlined, SettingOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { LogoutOutlined, UserAddOutlined, LoginOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';


const MenuComponent = ({ user, handleLogout, collapsed }) => {
  const location = useLocation();

  return (
    <Menu
      theme="dark"
      mode="inline"
      selectedKeys={[location.pathname]}
      style={{ height: '100%', marginTop: collapsed ? '25px' : '75px' }}
    >
      {user && (
        <>
          <Menu.Item className='zoom' key="/" icon={<DashboardOutlined />}>
            <Link to="/">Dashboard</Link>
          </Menu.Item>
          <Menu.Item className='zoom' key="/summary-history" icon={<FileDoneOutlined />}>
            <Link to="/summary-history">AI History</Link>
          </Menu.Item>
          <Menu.Item className='zoom' key="/about" icon={<InfoCircleOutlined />}>
            <Link to="/about">About</Link>
          </Menu.Item>
          <Menu.Item className='zoom' key="/settings" icon={<SettingOutlined />}>
            <Link to="/settings">Settings</Link>
          </Menu.Item>
          <Menu.Item className='zoom' key="/logout" icon={<LogoutOutlined />} onClick={handleLogout}>
            Logout
          </Menu.Item>
        </>
      )}
      {!user && (
        <>
          {/*<Menu.Item className='zoom' key="/signup" icon={<UserAddOutlined />}>
            <Link to="/signup">SignUp</Link>
          </Menu.Item>*/}
          <Menu.Item className='zoom' key="/login" icon={<LoginOutlined />}>
            <Link to="/login">Login</Link>
          </Menu.Item>
        </>
      )}
    </Menu>
  );
};

export default MenuComponent;