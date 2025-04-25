import React from 'react';
import { Table } from 'antd';
import { MemberMetric } from '../../../models/PerformanceMetric';

interface MemberSprintsProps {
    sprintMetrics: MemberMetric[];
}

const MemberSprints: React.FC<MemberSprintsProps> = ({ sprintMetrics }) => {

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