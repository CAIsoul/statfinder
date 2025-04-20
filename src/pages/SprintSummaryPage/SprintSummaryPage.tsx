import React, { useState } from 'react';
import { Descriptions, DescriptionsProps, Tabs, TabsProps } from 'antd';
import dayjs from 'dayjs';


import './SprintSummaryPage.scss';
import SprintSelector from '../../components/SprintSelector/SprintSelector';
import { Issue, Sprint } from '../../models/JiraData';
import { jiraQuery } from '../../service/JIRA/JiraDataQueryService';
import { jiraConvert } from '../../service/JIRA/JiraDataConvertService';
import TeamContributionTable from '../../components/Data/Team/TeamContributionTable';
import SprintIssueTable from '../../components/Data/Sprint/SprintIssueTable';
import TeamContributionChart from '../../components/Data/Team/TeamContributionChart';

interface PageProp { };

const SprintSummaryPage: React.FC<PageProp> = () => {
    const [issues, setIssues] = useState<Issue[]>([]);
    const [sprint, setSprint] = useState<Sprint>();

    const dateFormat = "YYYY-MM-DD";


    const descpItems: DescriptionsProps['items'] = [
        {
            key: '1',
            label: 'Start Date',
            children: dayjs(sprint?.startDate).format(dateFormat),
            span: 2
        },
        {
            key: '2',
            label: 'End Date',
            children: dayjs(sprint?.endDate).format(dateFormat),
            span: 2
        },
        {
            key: '3',
            label: 'Sprint Status',
            children: sprint?.state ?? 'Unknown',
            span: 2
        },
        {
            key: '4',
            label: 'Complete Date',
            children: sprint?.completeDate ? dayjs(sprint?.completeDate).format(dateFormat) : 'Not yet completed',
            span: 2
        },
        {
            key: '5',
            label: 'Sprint Goal',
            children: sprint?.goal ?? 'No goal set',
            span: 3
        },
        {
            key: '6',
            label: 'Original Committed',
            children: sprint?.originalCommitted ?? 0,
            span: 2
        },
        {
            key: '7',
            label: 'Original Completed',
            children: sprint?.originalCompleted ?? 0,
            span: 2
        },
        {
            key: '8',
            label: 'Completion Rate',
            children: `${sprint?.originalCommitted ? ((sprint?.originalCompleted ?? 0) / sprint?.originalCommitted * 100).toFixed(1) : 0}%`,
            span: 4
        },
        {
            key: '9',
            label: 'Newly Added',
            children: sprint?.newlyAdded ?? 0,
            span: 2,
        },
        {
            key: '10',
            label: 'Newly Added Completed',
            children: sprint?.newlyCompleted ?? 0,
            span: 2,
        },
        {
            key: '11',
            label: 'Total Completed',
            children: sprint?.totalCompleted ?? 0,
            span: 2,
        },
    ];

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
            <Descriptions
                title={sprint.name}
                items={descpItems}
                bordered
            />
        );
    }

    function renderIssuesTab() {
        return (
            <SprintIssueTable issues={issues} />
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
        <SprintSelector
            onSprintSelect={handleSprintSelect}
            enableMultiple={false}
        />
        <Tabs
            defaultActiveKey='1'
            items={tabItems}
        />
    </div>);
};

export default SprintSummaryPage;