import React, { useState } from 'react';
import { Descriptions, DescriptionsProps, Table, Tabs, TabsProps, Tag } from 'antd';
import dayjs from 'dayjs';

import './SprintSummaryPage.scss';
import SprintSelector from '../../components/SprintSelector/SprintSelector';
import { Issue, IssueRow, IssueStatusEnum, IssueTypeEnum, Sprint } from '../../models/JiraData';
import { jiraQuery } from '../../service/JIRA/JiraDataQueryService';
import { jiraConvert } from '../../service/JIRA/JiraDataConvertService';


interface PageProp { };

const SprintSummaryPage: React.FC<PageProp> = () => {
    const [issues, setIssues] = useState<Issue[]>([]);
    const [sprint, setSprint] = useState<Sprint>();

    const dateFormat = "YYYY-MM-DD";
    const displayIssueColumns = [
        { title: 'Issue', dataIndex: 'key', key: 'key', width: 150 },
        { title: 'Type', dataIndex: 'issuetype', key: 'type', width: 120 },
        { title: 'Title', dataIndex: 'summary', key: 'summary' },
        { title: 'Status', dataIndex: 'status', key: 'status', width: 200, render: (text: string) => renderIssusState(text as IssueStatusEnum) },
        { title: 'Story Point', dataIndex: 'storyPoint', key: 'storyPoint', width: 120 },
    ];

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
        // {
        //     key: '12',
        //     label: 'Total Issues',
        //     children: issues.length,
        //     span: 2
        // },
        // {
        //     key: '13',
        //     label: 'Issues Completed',
        //     children: issues.filter(issue => issue.fields.status.name === 'Done').length,
        //     span: 2
        // },
        // {
        //     key: '14',
        //     label: 'Issues In Progress',
        //     children: issues.filter(issue => issue.fields.status.name === 'In Progress').length,
        //     span: 2
        // }
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
            children: renderIssuesTab()
        }
    ];

    function renderIssusState(issueState: IssueStatusEnum) {
        switch (issueState) {
            case IssueStatusEnum.DONE:
                return <Tag color="green">Done</Tag>;
            case IssueStatusEnum.IN_PROGRESS:
                return <Tag color="yellow">In Progress</Tag>;
            case IssueStatusEnum.IN_REVIEW:
                return <Tag color="blue">In Review</Tag>;
            case IssueStatusEnum.ACCEPTANCE:
                return <Tag color="purple">Acceptance</Tag>;
            case IssueStatusEnum.FINAL_REVIEW:
                return <Tag color="lime">Final Review</Tag>;
            case IssueStatusEnum.FIXED:
                return <Tag color="green">Fixed</Tag>;
            case IssueStatusEnum.CLOSED:
                return <Tag color="orange">Closed</Tag>;
            case IssueStatusEnum.IN_BACKLOG:
            default:
                return <Tag color="default">{issueState}</Tag>;
        }
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
            <Table<IssueRow>
                columns={displayIssueColumns}
                dataSource={formatIssueDataSource(issues)}
            />
        );
    }

    function formatIssueDataSource(issues: Issue[]): IssueRow[] {
        const datasource = issues
            .filter((issue: Issue) => [IssueTypeEnum.STORY, IssueTypeEnum.BUG].includes(issue.fields.issuetype.name))
            .map((issue: Issue) => jiraConvert.ConvertToIssueRow(issue));
        return datasource;
    }

    async function handleSprintSelect(sprints: Sprint[]) {
        const sprint = sprints[0];

        if (!sprint) {
            return;
        }

        const issues: Issue[] = await jiraQuery.getIssuesBySprintId(sprint.id);
        const sprintExt = await jiraConvert.getSprintSummary(sprint);

        setSprint(sprintExt);
        setIssues(issues);
    }

    function onTabChange(value: any) {
        console.log(value);
    }


    return (<div className='page-container'>
        <SprintSelector onSprintSelect={handleSprintSelect} enableMultiple={false}></SprintSelector>
        <Tabs defaultActiveKey='1' items={tabItems} onChange={onTabChange} />
    </div>);
};

export default SprintSummaryPage;