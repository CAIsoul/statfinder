import React, { useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { Empty } from 'antd';

import './SprintComparePage.scss';
import SprintSelector from '../../components/SprintSelector/SprintSelector';
import { Sprint } from '../../models/JiraData';
import { jiraQuery } from '../../service/JIRA/JiraDataQueryService';
const SprintComparePage: React.FC = () => {

    const [sprints, setSprints] = useState<Sprint[]>([]);

    function getEChartOptions() {
        const sprintNames: string[] = [];
        const sprintUncompleted: number[] = [];
        const sprintCompleted: number[] = [];
        const srpintCompletion: number[] = [];
        let maxPoint = 0;

        sprints.forEach((data) => {
            const { name, totalCompleted = 0, totalCommitted = 0 } = data;
            sprintNames.push(name);
            sprintUncompleted.push(totalCommitted - totalCompleted);
            sprintCompleted.push(totalCompleted);
            srpintCompletion.push(totalCompleted / totalCommitted);

            if (totalCommitted > maxPoint) {
                maxPoint = totalCommitted;
            }
        });

        return {
            title: {
                text: 'Sprint Chart'
            },
            tooltip: {},
            legend: {
                data: ['Completed', 'Uncompleted'],
            },
            xAxis: {
                type: 'category',
                data: sprintNames,
            },
            yAxis: {
                type: 'value',
                min: 0,
                max: maxPoint,
            },
            series: [
                {
                    name: 'Uncompleted',
                    type: 'bar',
                    data: sprintUncompleted,
                    stack: 'x',
                },
                {
                    name: 'Completed',
                    type: 'bar',
                    data: sprintCompleted,
                    stack: 'x',
                },
                {
                    name: 'Completion',
                    type: 'line',
                    data: srpintCompletion,
                }
            ],
        };
    }

    async function handleSprintSelect(sprints: Sprint[]) {
        const requestTasks = sprints.map((sprint) => {
            const { originBoardId, id } = sprint;
            return jiraQuery.getSprintReport(originBoardId, id)
                .then((sprintReport) => {

                    sprint.totalCompleted = sprintReport.contents.completedIssuesInitialEstimateSum.value ?? 0;
                    sprint.totalCommitted = sprintReport.contents.allIssuesEstimateSum.value ?? 0;
                });
        });

        Promise.all(requestTasks).then(() => {
            sprints.sort((a, b) => a.startDate > b.startDate ? 1 : -1);
            setSprints(sprints);
        });
    }

    return (
        <div className='page-container'>
            <SprintSelector onSprintSelect={handleSprintSelect} enableMultiple={true} />
            <div className='chart-container'>
                {
                    sprints.length > 0 ? (
                        <ReactECharts
                            option={getEChartOptions()}
                            style={{ height: '500px', width: '800px' }}
                        />
                    ) : (
                        <Empty />
                    )
                }
            </div>
        </div>
    );
};

export default SprintComparePage;