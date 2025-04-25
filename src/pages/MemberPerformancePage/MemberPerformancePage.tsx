import React, { useState } from 'react';
import SprintSelector from '../../components/SprintSelector/SprintSelector';
import MemberSelector from '../../components/MemberSelector/MemberSelector';
import { Empty, Tabs } from 'antd';
import { Sprint, TeamMember } from '../../models/JiraData';
import { jiraConvert } from '../../service/JIRA/JiraDataConvertService';
import MemberInfo from '../../components/Data/Member/MemberInfo';
import MemberSprints from '../../components/Data/Member/MemberSprints';
import { MemberMetric } from '../../models/PerformanceMetric';
import MemberMetrics from '../../components/Data/Member/MemberMetrics';

const MemberPerformance: React.FC = () => {
    const [member, setMember] = useState<TeamMember>();
    const [sprintMetricDicts, setSprintMetricDicts] = useState<Map<string, MemberMetric>[]>([]);

    const tabItems = [
        {
            key: '1',
            label: 'Info',
            children: member ? <MemberInfo member={member} /> : <Empty />,
        },
        {
            key: '2',
            label: 'Sprints',
            children: (member && sprintMetricDicts.length > 0) ? <MemberSprints sprintMetrics={sprintMetricDicts.map((dict) => dict.get(member.name)).filter((metric) => metric !== undefined) as MemberMetric[]} /> : <Empty />,
        },
        {
            key: '3',
            label: 'Issues',
            children: <div>Issues</div>,
        },
        {
            key: '4',
            label: 'Metrics',
            children: (member && sprintMetricDicts.length > 0) ? <MemberMetrics sprintMetrics={sprintMetricDicts.map((dict) => dict.get(member.name)).filter((metric) => metric !== undefined) as MemberMetric[]} /> : <Empty />,
        }
    ];

    async function handleSprintSelect(boardId: number, sprints: Sprint[]) {
        const sprintMetrics = await jiraConvert.getSprintsMetrics(boardId, sprints);
        setSprintMetricDicts(sprintMetrics);
    }

    function handleMemberSelect(members: TeamMember[]) {
        setMember(members[0]);
    }

    return (
        <div className='page-container'>
            <div className='control-container'>
                <MemberSelector onMemberSelect={handleMemberSelect} enableMultiple={false} />
                <SprintSelector onSprintSelect={handleSprintSelect} enableMultiple={true} />
            </div>
            <div className='content-container'>
                <Tabs items={tabItems} />
            </div>
        </div>
    );
};

export default MemberPerformance;