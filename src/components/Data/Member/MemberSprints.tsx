import React from 'react';
import { Issue, Sprint, TeamMember } from '../../../models/JiraData';
import { Table } from 'antd';
import { MemberMetric } from '../../../models/PerformanceMetric';
import { jiraConvert } from '../../../service/JIRA/JiraDataConvertService';

interface MemberSprintsProps {
    member: TeamMember;
    sprintData: [Sprint, Issue[]][];
}

const MemberSprints: React.FC<MemberSprintsProps> = ({ member, sprintData }) => {
    const sprintMetrics: MemberMetric[] = sprintData.map(([sprint, issues]) => {
        const metricDict: Map<string, MemberMetric> = jiraConvert.calculateSprintMemberMetrics(sprint, issues);
        const metric = metricDict.get(member.name);
        if (metric) {
            metric.name = sprint.name;
        }
        return metric;
    }).filter((metric) => metric !== undefined);

    const memberSprintColumns = [
        { title: 'Sprint', dataIndex: 'name', key: 'name' },
        { title: 'Commited', dataIndex: 'commitedPoints', key: 'commitedPoints' },
        { title: 'Completed', dataIndex: 'completedPoints', key: 'completedPoints' },
        { title: 'New Feature', dataIndex: 'newFeaturePoints', key: 'newFeaturePoints' },
        { title: 'Backlog Bug', dataIndex: 'backlogBugPoints', key: 'backlogBugPoints' },
        { title: 'Max Task Point', dataIndex: 'maxTaskPoint', key: 'maxTaskPoint' },
        { title: 'Avg Task Point', dataIndex: 'avgTaskPoint', key: 'avgTaskPoint', render: (value: number) => value.toFixed(2) },
        { title: 'New Bug Count', dataIndex: 'newBugCount', key: 'newBugCount' },
        { title: 'New Bug Count Per Point', dataIndex: 'newBugCountPerPoint', key: 'newBugCountPerPoint', render: (value: number) => value.toFixed(2) },
    ];

    return <Table dataSource={sprintMetrics} columns={memberSprintColumns} />;
};

export default MemberSprints;