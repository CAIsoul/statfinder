import React from 'react';
import { useState } from 'react';
import { Routes, Route } from 'react-router';
import { Breadcrumb, Layout, theme } from 'antd';
import { ProjectOutlined, TeamOutlined, UserOutlined } from '@ant-design/icons';
import Header from './components/Header/Header';
import Sider from './components/Sider/Sider';
import './App.scss'
import SprintSummaryPage from './pages/SprintSummaryPage/SprintSummaryPage';
import { NavItem } from './models/NavItem';
import WelcomePage from './pages/WelcomePage/WelcomePage';
import { useLoading } from './components/LoadingIndicator/LoadingContext';
import { jiraQuery } from './service/JIRA/JiraDataQueryService';

const navItems: NavItem[] = [
  {
    Name: "jirastat",
    Label: "Jira Stat",
    SubItems: [
      {
        Name: 'sprint',
        Label: 'Sprint',
        Icon: ProjectOutlined,
        Route: '',
        SubItems: [
          {
            Name: 'summary',
            Label: 'Summary',
            Route: 'sprint-summary',
          }
        ],
      },
      {
        Name: 'member',
        Label: 'Member',
        Icon: UserOutlined,
        Route: '',
        SubItems: [
          {
            Name: 'summary',
            Label: 'Summary',
            Route: 'member-summary',
          }
        ],
      },
      {
        Name: 'team',
        Label: 'Team',
        Icon: TeamOutlined,
        Route: '',
        SubItems: [
          {
            Name: 'summary',
            Label: 'Summary',
            Route: 'team-summary',
          }
        ],
      }]
  }
];

const App: React.FC = () => {
  const [currentTab] = useState<string>(navItems[0]?.Name);
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const activeNavItems = navItems.find(tab => tab.Name === currentTab)?.SubItems ?? [];

  const { showLoading, hideLoading } = useLoading();
  React.useEffect(() => {
    jiraQuery.setup({ showLoading, hideLoading });
  }, [showLoading, hideLoading]);

  return (
    <Layout className='app-container'>
      <Header navItems={navItems}></Header>
      <Layout>
        <Sider colorBgContainer={colorBgContainer} navItems={activeNavItems}></Sider>
        <Layout className='content-container'>
          <Breadcrumb
            items={[{ title: 'Home' }, { title: 'List' }, { title: 'App' }]}
            style={{ margin: '16px 0' }}
          />
          <Routes>
            <Route path="/" element={<WelcomePage />}></Route>
            <Route path="/sprint-summary" element={<SprintSummaryPage />}></Route>
            <Route path="/sprint-compare" element={<div></div>} ></Route>
            <Route path="*" element={<WelcomePage />}></Route>
          </Routes>
        </Layout>
      </Layout>
    </Layout>
  );
}

export default App
