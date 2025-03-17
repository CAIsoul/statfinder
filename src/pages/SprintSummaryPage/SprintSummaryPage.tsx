import React, { useState } from 'react';

import './SprintSummaryPage.scss';
import SprintSelector from '../../components/SprintSelector/SprintSelector';
import { Table } from 'antd';
import { ConvertToIssueRow, Issue, IssueRow, IssueTypeEnum } from '../../models/JiraData';
import { jira } from '../../service/JIRA/JiraDataService';


interface PageProp { };

const SprintSummaryPage: React.FC<PageProp> = () => {
    const displayIssueColumns = [
        { title: 'Issue', dataIndex: 'key', key: 'key', width: 150 },
        { title: 'Title', dataIndex: 'summary', key: 'summary' }
    ];

    const [issues, setIssues] = useState<Issue[]>([]);

    function formatIssueDataSource(issues: Issue[]): any {
        const datasource = issues
            .filter((issue: Issue) => [IssueTypeEnum.STORY, IssueTypeEnum.BUG].includes(issue.fields.issuetype.name))
            .map((issue: Issue) => ConvertToIssueRow(issue));
        return datasource;
    }

    function handleSprintSelect(sprintIds: number[]) {
        const sprintId = sprintIds[0];
        jira.getIssuesBySprintId(sprintId)
            .then((issues: Issue[]) => {
                setIssues(issues);
            });
    }


    return (<div className='page-container'>
        <SprintSelector onSprintSelect={handleSprintSelect} singleSelect={false}></SprintSelector>
        <Table<IssueRow> columns={displayIssueColumns} dataSource={formatIssueDataSource(issues)}></Table>
    </div>);
};

export default SprintSummaryPage;