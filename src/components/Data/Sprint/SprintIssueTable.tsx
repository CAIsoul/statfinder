import { Table, Tag } from "antd";
import { Contribution, Issue, IssueRow, IssueStatusEnum } from "../../../models/JiraData";

interface SprintIssueTableProps {
    issues: Issue[];
}

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

function convertToIssueRow(issue: Issue): IssueRow {
    return {
        ...issue,

        summary: issue.fields.summary,
        issuetype: issue.fields.issuetype?.name,
        status: issue.fields.status?.name,
        priority: issue.fields.priority?.name,
        storyPoint: issue.fields.customfield_10026 ?? 0,

        description: issue.fields.description,
        updated: issue.fields.updated,
        duedate: issue.fields.duedate,
        resolutiondate: issue.fields.resolutiondate,
        reporter: issue.fields.reporter?.displayName,
        children: issue.fields.subtasks?.length > 0 ? issue.fields.subtasks.map(s => convertToIssueRow(s)) : undefined,
    }
}

const SprintIssueTable: React.FC<SprintIssueTableProps> = ({ issues }) => {
    const displayIssueColumns = [
        { title: 'Issue', dataIndex: 'key', key: 'key', width: 150 },
        { title: 'Type', dataIndex: 'issuetype', key: 'type', width: 120 },
        { title: 'Title', dataIndex: 'summary', key: 'summary' },
        { title: 'Status', dataIndex: 'status', key: 'status', width: 200, render: (text: string) => renderIssusState(text as IssueStatusEnum) },
        { title: 'Story Point', dataIndex: 'storyPoint', key: 'storyPoint', width: 120 },
        {
            title: 'Contributions',
            dataIndex: 'contributions',
            key: 'contributions',
            width: 200,
            render: (contributors: Contribution[]) => Array.isArray(contributors) && contributors.length > 0 ? <>{contributors[0]?.Contributor.name}</> : null
        },
    ];

    const dataSource = issues.map((issue: Issue) => convertToIssueRow(issue));

    return <Table<IssueRow>
        rowKey={(record) => record.key}
        columns={displayIssueColumns}
        dataSource={dataSource}
    />;
};

export default SprintIssueTable;