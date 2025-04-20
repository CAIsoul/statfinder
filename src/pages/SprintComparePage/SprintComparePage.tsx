import React, { useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { Empty, Dropdown, Space } from 'antd';
import { DownOutlined } from '@ant-design/icons';

import './SprintComparePage.scss';
import SprintSelector from '../../components/SprintSelector/SprintSelector';
import { Sprint } from '../../models/JiraData';
import { jiraConvert } from '../../service/JIRA/JiraDataConvertService';

const SprintComparePage: React.FC = () => {

    const [sprints, setSprints] = useState<Sprint[]>([]);
    const [eChartType, setEChartType] = useState<string>('1');

    const eChartSelections: any[] = [
        {
            key: '1',
            label: 'Sprint Completion',
        },
        {
            key: '2',
            label: 'Sprint Effort Contributions',
        }
    ];

    function getEChartSprintCompletionOptions() {
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
                data: ['Uncompleted', 'Completed'],
            },
            xAxis: {
                type: 'category',
                data: sprintNames,
            },
            yAxis: [{
                type: 'value',
                min: 0,
                max: Math.ceil(maxPoint / 10) * 10,
            }, {
                type: 'value',
                min: 0,
                max: 1.2,
                interval: 0.1,
            }],
            series: [
                {
                    name: 'Completed',
                    type: 'bar',
                    yAxisIndex: 0,
                    data: sprintCompleted,
                    stack: 'x',
                },
                {
                    name: 'Uncompleted',
                    type: 'bar',
                    yAxisIndex: 0,
                    data: sprintUncompleted,
                    stack: 'x',
                },
                {
                    name: 'Completion',
                    type: 'line',
                    smooth: true,
                    yAxisIndex: 1,
                    data: srpintCompletion,
                }
            ],
        };
    }

    function getEChartOptions(eChartKey: string) {
        let eChartOptions = null;

        if (eChartKey === '1') {
            eChartOptions = getEChartSprintCompletionOptions();
        } else if (eChartKey === '2') {
            eChartOptions = getEChartSprintCompletionOptions();
        }

        return eChartOptions;
    }

    async function handleSprintSelect(sprints: Sprint[]) {
        const requestTasks = sprints.map((sprint) => jiraConvert.getSprintSummary(sprint));
        Promise.all(requestTasks).then((sprintSummaries) => {
            sprintSummaries.sort((a, b) => a.startDate > b.startDate ? 1 : -1);
            setSprints(sprintSummaries);
        });
    }

    function handleEChartSelectionChange(event: any) {
        const { key: eChartKey } = event;
        setEChartType(eChartKey);
    }

    return (
        <div className='page-container'>
            <SprintSelector onSprintSelect={handleSprintSelect} enableMultiple={true} />
            <div className='chart-container'>
                {
                    sprints.length > 0 ? (
                        <>
                            <div className='chart-controls'>
                                <Dropdown menu={{ items: eChartSelections, onClick: handleEChartSelectionChange }}>
                                    <a onClick={(e) => e.preventDefault()}>
                                        <Space>
                                            {(eChartSelections.find((e: any) => e?.key === eChartType))?.label || "Select Chart Type"}
                                            <DownOutlined />
                                        </Space>
                                    </a>
                                </Dropdown>
                            </div>
                            {
                                eChartType && <ReactECharts
                                    option={getEChartOptions(eChartType)}
                                    style={{ height: '500px', width: '800px' }}
                                />
                            }
                        </>
                    ) : (
                        <Empty />
                    )
                }
            </div>
        </div>
    );
};

export default SprintComparePage;