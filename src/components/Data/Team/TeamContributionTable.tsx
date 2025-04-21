import config from "../../../../config";
import { Issue, IssueExtension, IssueRow } from "../../../models/JiraData";
import { Table, TableColumnsType } from "antd";

interface TeamContributionTableProps {
    issues: Issue[];
}

interface ContributionRow {
    name: string;
    committed: number;
    completed: number;
    completion: number;
    count: number;
    max: number;
    average: number;
    issues: Issue[];
}

function getDataSource(issues: Issue[]): ContributionRow[] {
    const contriDict = issues.reduce((acc, issue) => {
        const mainContributor = issue.contributions[0];
        if (mainContributor) {
            const contributorName = mainContributor.Contributor.name;
            if (!acc.has(contributorName)) {
                acc.set(contributorName, []);
            }

            acc.get(contributorName)?.push(issue);
        }

        return acc;
    }, new Map<string, Issue[]>);

    const dataSource: ContributionRow[] = [];
    for (const [contributorName, issues] of contriDict.entries()) {
        let committed = 0;
        let completed = 0;
        let max = 0;

        for (const issue of issues) {
            committed += issue.storyPoint;

            if (issue.isCompleted) {
                completed += issue.storyPoint;
            }

            if (issue.storyPoint > max) {
                max = issue.storyPoint;
            }
        }

        const completion = completed / committed;
        const average = issues.reduce((acc, issue) => acc + issue.storyPoint, 0) / issues.length;

        const contributionRow: ContributionRow = {
            name: contributorName,
            committed: committed,
            completed: completed,
            completion: completion,
            count: issues.length,
            max: max,
            average: average ?? 0,
            issues: issues,
        };

        dataSource.push(contributionRow);
    }

    dataSource.sort((a, b) => b.completed - a.completed || b.completion - a.completion);

    return dataSource;
}

const TeamContributionTable: React.FC<TeamContributionTableProps> = ({ issues }) => {
    const contributionColumns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            width: 200,
        },
        {
            title: 'Committed',
            dataIndex: 'committed',
            key: 'committed',
            width: 150,
        },
        {
            title: 'Completed',
            dataIndex: 'completed',
            key: 'completed',
            width: 150,
        },
        {
            title: 'Completion',
            dataIndex: 'completion',
            key: 'completion',
            width: 150,
            render: (completion: number = 0) => `${(completion * 100).toFixed(2)}%`,
        },
        {
            title: 'Count',
            dataIndex: 'count',
            key: 'count',
        },
        {
            title: 'Max',
            dataIndex: 'max',
            key: 'max',
        },
        {
            title: 'Average',
            dataIndex: 'average',
            key: 'average',
            render: (average: number = 0) => average.toFixed(2),
        }
    ];

    const expandColumns: TableColumnsType<IssueRow> = [
        {
            title: 'Issue',
            key: 'key',
            dataIndex: 'key',
            width: 120,
            render: (key: string) => <a href={`${config.jiraBaseUrl}/browse/${key}`} target="_blank" rel="noopener noreferrer">{key}</a>,
        },
        {
            title: 'Title',
            dataIndex: 'fields',
            key: 'summary',
            render: (fields: IssueExtension) => <>{fields.summary}</>,
        },
        {
            title: 'Story Point',
            dataIndex: 'storyPoint',
            key: 'storyPoint',
            width: 120,
        },
        {
            title: 'Status',
            dataIndex: 'isCompleted',
            key: 'status',
            width: 150,
            render: (isCompleted: boolean) => isCompleted ? 'Completed' : 'Not Completed',
        },
    ];

    const expandedRowRender = (record: ContributionRow) => {
        return <Table<IssueRow>
            columns={expandColumns}
            dataSource={record.issues}
            pagination={false}
        />;
    };

    return <Table<ContributionRow>
        rowKey={(record) => record.name}
        columns={contributionColumns}
        expandable={{ expandedRowRender, defaultExpandedRowKeys: ['0'] }}
        dataSource={getDataSource(issues)}
        scroll={{y: 400}}
    />;
};

export default TeamContributionTable;