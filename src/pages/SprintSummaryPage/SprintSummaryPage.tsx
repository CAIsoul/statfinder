import React, { useState } from 'react';
import { Tabs, TabsProps } from 'antd';


import './SprintSummaryPage.scss';
import SprintSelector from '../../components/SprintSelector/SprintSelector';
import { Issue, Sprint } from '../../models/JiraData';
import { jiraQuery } from '../../service/JIRA/JiraDataQueryService';
import { jiraConvert } from '../../service/JIRA/JiraDataConvertService';
import TeamContributionTable from '../../components/Data/Team/TeamContributionTable';
import SprintIssueTable from '../../components/Data/Sprint/SprintIssueTable';
import TeamContributionChart from '../../components/Data/Team/TeamContributionChart';
import SprintInfo from '../../components/Data/Sprint/SprintInfo';

interface PageProp { };

const SprintSummaryPage: React.FC<PageProp> = () => {
    const [issues, setIssues] = useState<Issue[]>([]);
    const [sprint, setSprint] = useState<Sprint>();

    const tabItems: TabsProps['items'] = [
        {
            key: '1',
            label: 'Info',
            children: renderInfoTab(),
        },
        {
            key: '2',
            label: 'Issues',
            children: renderIssuesTab(),
        },
        {
            key: '3',
            label: 'Contribution',
            children: renderContribution(),
        },
    ];

    function renderContribution() {
        return (
            <>
                {
                    Array.isArray(issues) && issues.length > 0 &&
                    <>
                        <TeamContributionChart issues={issues} />
                        <TeamContributionTable issues={issues} />
                    </>
                }
            </>
        );
    }

    function renderInfoTab() {
        if (!sprint) {
            return;
        }

        return (
            <SprintInfo sprint={sprint} />
        );
    }

    function renderIssuesTab() {
        return (
            <>
                {
                    Array.isArray(issues) && issues.length > 0 &&
                    <SprintIssueTable issues={issues} />
                }
            </>
        );
    }

    async function handleSprintSelect(sprints: Sprint[]) {
        const sprint = sprints[0];

        if (!sprint) {
            return;
        }

        const issues: Issue[] = await jiraQuery.getIssuesBySprintId(sprint.id);
        const sprintExt = await jiraConvert.getSprintSummary(sprint);

        setSprint(sprintExt);
        setIssues(jiraConvert.analyzeSprintIssues(issues));
    }

    return (<div className='page-container'>
        <>
            <SprintSelector
                onSprintSelect={handleSprintSelect}
                enableMultiple={false}
            />
        </>
        <Tabs style={{ flex: 1, overflowY: 'auto' }}
            defaultActiveKey='1'
            items={tabItems}
        />
    </div>);
};

export default SprintSummaryPage;