import React from 'react';
import { TeamMember } from '../../../models/JiraData';
import { Descriptions } from 'antd';

interface MemberInfoProps {
    member: TeamMember;
}

const MemberInfo: React.FC<MemberInfoProps> = ({ member }) => {
    return <Descriptions title="Member Info" bordered>
        <Descriptions.Item label="Name">{member.name}</Descriptions.Item>
        <Descriptions.Item label="Role">{member.role}</Descriptions.Item>
    </Descriptions>;
};

export default MemberInfo;