import React, { useState } from 'react';
import SprintSelector from '../../components/SprintSelector/SprintSelector';
import MemberSelector from '../../components/MemberSelector/MemberSelector';
import { Empty, Tabs } from 'antd';
import { Issue, Sprint, TeamMember } from '../../models/JiraData';
import { jiraConvert } from '../../service/JIRA/JiraDataConvertService';
import { jiraQuery } from '../../service/JIRA/JiraDataQueryService';
import MemberInfo from '../../components/Data/Member/MemberInfo';
import MemberSprints from '../../components/Data/Member/MemberSprints';

const MemberPerformance: React.FC = () => {
    const [member, setMember] = useState<TeamMember>();
    const [sprintData, setSprintData] = useState<[Sprint, Issue[]][]>([]);

    const tabItems = [
        {
            key: '1',
            label: 'Info',
            children: member ? <MemberInfo member={member} /> : <Empty />,
        },
        {
            key: '2',
            label: 'Sprints',
            children: (member && Array.isArray(sprintData) && sprintData.length > 0) ? <MemberSprints member={member} sprintData={sprintData} /> : <Empty />,
        },
        {
            key: '3',
            label: 'Issues',
            children: <div>Issues</div>,
        },
        {
            key: '4',
            label: 'Metrics',
            children: <div>Metrics</div>,
        }
    ];

    function handleSprintSelect(sprints: Sprint[]) {
        const requestTasks = sprints.map(s => {
            return Promise.all([
                jiraConvert.getSprintSummary(s),
                jiraQuery.getIssuesBySprintId(s.id)
            ]);
        });

        Promise.allSettled(requestTasks).then((results) => {
            const sprintDataList = results.filter((res) => res.status === 'fulfilled').map((res) => res.value);

            sprintDataList.sort((a, b) => a[0].startDate > b[0].startDate ? 1 : -1);
            setSprintData(sprintDataList);
        });
    }

    function handleMemberSelect(members: TeamMember[]) {
        setMember(members[0]);
    }

    return (
        <div className='page-container'>
            <div className='control-container'>
                <MemberSelector onMemberSelect={handleMemberSelect} enableMultiple={true} />
                <SprintSelector onSprintSelect={handleSprintSelect} enableMultiple={true} />
            </div>
            <div className='content-container'>
                <Tabs items={tabItems} />
            </div>
        </div>
    );
};

export default MemberPerformance;