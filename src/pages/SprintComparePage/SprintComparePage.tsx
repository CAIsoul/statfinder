import React, { useState } from 'react';

import './SprintComparePage.scss';
import SprintSelector from '../../components/SprintSelector/SprintSelector';
import { Sprint } from '../../models/JiraData';
import { jiraConvert } from '../../service/JIRA/JiraDataConvertService';
import SprintCompareChart from '../../components/Data/Sprint/SprintCompareChart';

const SprintComparePage: React.FC = () => {

    const [sprints, setSprints] = useState<Sprint[]>([]);

    async function handleSprintSelect(sprints: Sprint[]) {
        const requestTasks = sprints.map((sprint) => jiraConvert.getSprintSummary(sprint));
        Promise.allSettled(requestTasks).then((results) => {
            const sprintSummaries = results.filter((res) => res.status === 'fulfilled').map((res) => res.value);

            sprintSummaries.sort((a, b) => a.startDate > b.startDate ? 1 : -1);
            setSprints(sprintSummaries);
        });
    }

    return (
        <div className='page-container'>
            <SprintSelector onSprintSelect={handleSprintSelect} enableMultiple={true} />
            <SprintCompareChart sprints={sprints} />
        </div>
    );
};

export default SprintComparePage;