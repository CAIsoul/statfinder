import { Dropdown, Empty, Space } from "antd";
import { DownOutlined } from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import { Sprint } from "../../../models/JiraData";
import { useState } from "react";

interface SprintCompareChartProps {
    sprints: Sprint[];
}

const SprintCompareChart: React.FC<SprintCompareChartProps> = ({ sprints }) => {
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
        let maxPointPerDay = 0;

        sprints.forEach((data) => {
            const { name, totalCompleted = 0, totalCommitted = 0 } = data;
            const completionPerDay = data.duration ? totalCompleted / data.duration : 0;

            sprintNames.push(name);
            sprintUncompleted.push(totalCommitted - totalCompleted);
            sprintCompleted.push(totalCompleted);
            srpintCompletion.push(completionPerDay);

            if (totalCommitted > maxPoint) {
                maxPoint = totalCommitted;
            }

            if (completionPerDay > maxPointPerDay) {
                maxPointPerDay = completionPerDay;
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
                max: Math.ceil(maxPointPerDay * 10) / 10,
                interval: 1
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
                    name: 'Completion per day',
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

    function handleEChartSelectionChange(event: any) {
        const { key: eChartKey } = event;
        setEChartType(eChartKey);
    }

    return <div className='chart-container'>
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
};

export default SprintCompareChart;