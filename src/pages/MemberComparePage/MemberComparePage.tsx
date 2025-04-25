import React, { useState } from 'react';
import MemberSelector from '../../components/MemberSelector/MemberSelector';
import SprintSelector from '../../components/SprintSelector/SprintSelector';
import { Sprint, TeamMember } from '../../models/JiraData';
import { jiraConvert } from '../../service/JIRA/JiraDataConvertService';
import { MemberMetric } from '../../models/PerformanceMetric';
import MemberCompare from '../../components/Data/Member/MemberCompare';

const MemberComparePage: React.FC = () => {
    const [memberList, setMemberList] = useState<TeamMember[]>([]);
    const [sprintList, setSprintList] = useState<Sprint[]>([]);
    const [sprintMetricDicts, setSprintMetricDicts] = useState<Map<string, MemberMetric>[]>([]);

    function handleMemberSelect(members: TeamMember[]) {
        setMemberList(members);
    }

    async function handleSprintSelect(boardId: number, sprints: Sprint[]) {
        const sprintMetrics = await jiraConvert.getSprintsMetrics(boardId, sprints);
        setSprintMetricDicts(sprintMetrics);
    }

    return (
        <div className='page-container'>
            <div className='control-container'>
                <MemberSelector onMemberSelect={handleMemberSelect} enableMultiple={true} />
                <SprintSelector onSprintSelect={handleSprintSelect} enableMultiple={true} />
            </div>
            <div className='content-container'>
                <MemberCompare sprintMetricDicts={sprintMetricDicts} members={memberList} />
            </div>
        </div>
    );
};

export default MemberComparePage;