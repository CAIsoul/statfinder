import React, { useState } from 'react';
import { MemberMetric } from '../../../models/PerformanceMetric';
import { Dropdown, Space } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';

interface MemberMetricsProps {
    sprintMetrics: MemberMetric[];
}

const MemberMetrics: React.FC<MemberMetricsProps> = ({ sprintMetrics }) => {
    const [eChartType, setEChartType] = useState<string>('performance');

    const eChartSelections = [
        {
            key: 'performance',
            label: 'Performance',
        },
        {
            key: 'rating',
            label: 'Rating',
        }
    ];

    function getPerformanceChartOptions() {
        let maxPoint = Math.max(...sprintMetrics.map((metric) => metric.commitedPoints));
        let maxRatio = Math.max(...sprintMetrics.map((metric) => Math.max(metric.commitedRatio, metric.completedRatio)));

        return {
            xAxis: {
                type: 'category',
                data: sprintMetrics.map((metric) => metric.name)
            },
            yAxis: [{
                type: 'value',
                min: 0,
                max: Math.ceil(maxPoint / 10) * 10,
            }, {
                type: 'value',
                min: 0,
                max: 1,
            }],
            series: [
                {
                    type: 'bar',
                    name: 'Completed Points',
                    data: sprintMetrics.map((metric) => metric.completedPoints),
                    stack: 'x',
                },
                {
                    type: 'bar',
                    name: 'Uncompleted Points',
                    data: sprintMetrics.map((metric) => metric.commitedPoints - metric.completedPoints),
                },
                {
                    type: 'line',
                    name: 'Completed Ratio',
                    data: sprintMetrics.map((metric) => metric.completedRatio),
                    yAxisIndex: 1,
                }
            ]
        };
    }

    function getRatingChartOptions() {
        return {
            xAxis: {
                type: 'category',
                data: sprintMetrics.map((metric) => metric.name)
            }
        };
    }
    function handleEChartSelectionChange(event: any) {
        console.log(event);
    }

    function getEChartOptions(eChartType: string) {
        switch (eChartType) {
            case 'performance':
                return getPerformanceChartOptions();
            case 'rating':
                return getRatingChartOptions();
        }
    }

    return (
        <>
            <Dropdown menu={{ items: eChartSelections, onClick: handleEChartSelectionChange }}>
                <a onClick={(e) => e.preventDefault()}>
                    <Space>
                        {(eChartSelections.find((e: any) => e?.key === eChartType))?.label || "Select Chart Type"}
                        <DownOutlined />
                    </Space>
                </a>
            </Dropdown>
            {
                eChartType && <ReactECharts
                    option={getEChartOptions(eChartType)}
                    style={{ height: '500px', width: '800px' }}
                />
            }
        </>
    );
};

export default MemberMetrics;
