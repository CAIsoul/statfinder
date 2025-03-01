import React from 'react';
import { Layout, Menu, } from 'antd';
import type { MenuProps } from 'antd';
import { NavItem } from '../../models/NavItem';
import { useNavigate } from 'react-router-dom';

interface SiderProp {
    colorBgContainer: string;
    navItems: NavItem[];
}

const Sider: React.FC<SiderProp> = ({ colorBgContainer, navItems }) => {
    const navigate = useNavigate();
    const menuItems: MenuProps["items"] = navItems.map(
        (navItem) => {
            const { Name, Label, Icon, SubItems } = navItem;

            return {
                key: Name,
                icon: React.createElement(Icon),
                label: Label,
                children: SubItems?.map((subItem) => {
                    const { Label, Route } = subItem;
                    return {
                        key: Route,
                        label: Label,
                    };
                }),
            };
        });

    return (
        <Layout.Sider width={200} style={{ background: colorBgContainer }}>
            <Menu
                mode="inline"
                defaultSelectedKeys={['1']}
                defaultOpenKeys={['sub1']}
                style={{ height: '100%', borderRight: 0 }}
                items={menuItems}
                onClick={({ key, keyPath }) => {
                    console.log(key);
                    console.log(keyPath);
                    navigate(`/${key}`);
                }}
            />
        </Layout.Sider>
    );
};

export default Sider;