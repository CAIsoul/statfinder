import React from 'react';
import { Layout, Menu } from 'antd';

import './Header.scss';
import { NavItem } from '../../models/NavItem';

interface HeaderProp {
    navItems: NavItem[];
}

const Header: React.FC<HeaderProp> = ({ navItems }) => {
    const menuItems = navItems.map(item => ({
        key: item.Name,
        label: item.Label
    }));

    return (
        <Layout.Header className="container">
            <div className="demo-logo" />
            <Menu
                className='menu'
                theme="dark"
                mode="horizontal"
                defaultSelectedKeys={['2']}
                items={menuItems}
            />
        </Layout.Header>
    );
};

export default Header;