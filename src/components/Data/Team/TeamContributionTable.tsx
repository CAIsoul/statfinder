import config from "../../../../config";
import { Issue, IssueExtension, IssueRow } from "../../../models/JiraData";
import { Table, TableColumnsType } from "antd";
import DistributionBar from "../DistributionBar/DistributionBar";

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

            if (issue.isCompletedInCurrentSprint) {
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
            width: 100,
        },
        {
            title: 'Max',
            dataIndex: 'max',
            key: 'max',
            width: 100,
        },
        {
            title: 'Average',
            dataIndex: 'average',
            key: 'average',
            render: (average: number = 0) => average.toFixed(2),
            width: 100,
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
            width: 300,
        },
        {
            title: 'Story Point',
            dataIndex: 'storyPoint',
            key: 'storyPoint',
            width: 120,
        },
        {
            title: 'Status',
            dataIndex: 'isCompletedInCurrentSprint',
            key: 'status',
            width: 150,
            render: (isCompleted: boolean) => isCompleted ? 'Completed' : 'Not Completed',
        },
        {
            title: 'Bug Count',
            dataIndex: 'storyBugCount',
            key: 'storyBugCount',
            width: 120,
        },
        {
            title: 'Original Estimate',
            dataIndex: 'fields',
            key: 'originalEstimate',
            width: 120,
            render: (fields: IssueExtension) => `${(fields.aggregatetimeoriginalestimate ?? 0) / 60 / 60} hrs`,
        },
        {
            title: 'Time Spent',
            dataIndex: 'timeSpentTotal',
            key: 'timeSpentTotal',
            width: 120,
            render: (val: number) => <>{`${(val / 60 / 60).toFixed(1)} hrs`}</>,
        },
        {
            title: 'Time Distribution',
            key: 'timeDistribution',
            width: 200,
            render: (data: Issue) =>
                <DistributionBar
                    items={[
                        {
                            name: 'Implementation',
                            value: data.timeSpentOnImplementation ?? 0,
                            color: 'green',
                        },
                        {
                            name: 'Dev Test',
                            value: data.timeSpentOnDevTest ?? 0,
                            color: 'lightgreen',
                        },
                        {
                            name: 'Bug Fixing',
                            value: data.timeSpentOnBugFixing ?? 0,
                            color: 'red',
                        },
                        {
                            name: 'QA Verification',
                            value: data.timeSpentOnVerification ?? 0,
                            color: 'blue',
                        }
                    ]}
                />
        },
        {
            title: 'Act. vs Est.',
            dataIndex: 'fields',
            key: 'actualVsEstimate',
            width: 150,
            render: (fields: IssueExtension) => `${!fields.aggregatetimeoriginalestimate ? 'N/A' : `${((fields.aggregatetimespent ?? 0) * 100 / fields.aggregatetimeoriginalestimate).toFixed(2)}%`}`,
        }
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
        expandable={{
            expandedRowRender,
            rowExpandable: (record) => record.issues.length > 0,
        }}
        dataSource={getDataSource(issues)}
        scroll={{ y: 500, x: 800 }}
    />;
};

export default TeamContributionTable;