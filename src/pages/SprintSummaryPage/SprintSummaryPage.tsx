import React, { useState } from 'react';
import { Descriptions, DescriptionsProps, Table, Tabs, TabsProps } from 'antd';
import dayjs from 'dayjs';

import './SprintSummaryPage.scss';
import SprintSelector from '../../components/SprintSelector/SprintSelector';
import { Issue, IssueRow, IssueTypeEnum, Sprint } from '../../models/JiraData';
import { jiraQuery } from '../../service/JIRA/JiraDataQueryService';
import { jiraConvert } from '../../service/JIRA/JiraDataConvertService';


interface PageProp { };

const SprintSummaryPage: React.FC<PageProp> = () => {
    const [issues, setIssues] = useState<Issue[]>([]);
    const [sprint, setSprint] = useState<Sprint>();

    const dateFormat = "YYYY-MM-DD";
    const displayIssueColumns = [
        { title: 'Issue', dataIndex: 'key', key: 'key', width: 150 },
        { title: 'Title', dataIndex: 'summary', key: 'summary' }
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
            key: '2',
            label: 'Complete Date',
            children: sprint?.completeDate ? dayjs(sprint?.completeDate).format(dateFormat) : 'Not yet completed',
            span: 1
        }
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
            // pagination={false}
            // scroll={{ scrollToFirstRowOnChange: true, x: true, y: 600 }}
            />
        );
    }

    function formatIssueDataSource(issues: Issue[]): any {
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
        const sprintExt = jiraConvert.getSprintSummary(sprint, issues);

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