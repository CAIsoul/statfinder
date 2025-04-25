import { Select } from 'antd';
import React, { useState } from 'react';
import config from '../../../config';
import { TeamMember } from '../../models/JiraData';

import './MemberSelector.scss';

export interface MemberSelectItem {
    team: string;
    member: TeamMember;
}

interface MemberSelectorProps {
    onMemberSelect: (members: TeamMember[]) => void;
    enableMultiple: boolean;
}

const MemberSelector: React.FC<MemberSelectorProps> = ({ onMemberSelect, enableMultiple = false }) => {
    const teamOptions = Object.keys(config.teamMembers).map((team) => ({
        value: team,
        label: team,
    }));
    const [memberOptions, setMemberOptions] = useState<TeamMember[]>([]);

    const [selectedTeam, setSelectedTeam] = useState<string>('');
    const [selectedMember, setSelectedMember] = useState<string>('');

    const handleTeamChange = (value: string) => {
        setSelectedTeam(value);
        setMemberOptions(config.teamMembers[value] ?? []);
    };

    const handleMemberChange = (value: string) => {
        setSelectedMember(value);
        onMemberSelect(memberOptions.filter(m => m.name === value));
    };


    return (
        <div className='member-selector'>
            <Select className='team-select'
                showSearch
                allowClear
                placeholder="Select team"
                options={teamOptions}
                onChange={handleTeamChange}
            />
            {
                enableMultiple ? <Select
                    className='member-select-multiple'
                    mode={'multiple'}
                    showSearch
                    allowClear
                    placeholder="Select member"
                    options={memberOptions.map(m => ({ value: m.name, label: m.name }))}
                    onChange={handleMemberChange}
                /> :
                    <Select
                        className='member-select'
                        allowClear
                        showSearch
                        placeholder="Select member"
                        options={memberOptions.map(m => ({ value: m.name, label: m.name }))}
                        onChange={handleMemberChange}
                    />
            }
        </div>
    );
};

export default MemberSelector;