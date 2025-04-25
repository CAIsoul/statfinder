import { Dropdown, Space } from "antd";
import { DownOutlined } from '@ant-design/icons';
import { useState } from "react";

import ReactECharts from 'echarts-for-react';
import { MemberMetric } from "../../../models/PerformanceMetric";
import { TeamMember } from "../../../models/JiraData";

interface MemberCompareProps {
    sprintMetricDicts: Map<string, MemberMetric>[];
    members: TeamMember[];
}

const MemberCompare: React.FC<MemberCompareProps> = ({ sprintMetricDicts, members }) => {
    const [compareMetric, setCompareMetric] = useState<string>('');
    const compareChartSelections = [
        {
            key: 'issueCount',
            label: 'Issue Count',
        },
        {
            key: 'commitedPoints',
            label: 'Commited Points',
        },
        {
            key: 'completedPoints',
            label: 'Completed Points',
        },
        {
            key: 'commitedRatio',
            label: 'Commited Ratio',
        },
        {
            key: 'completedRatio',
            label: 'Completed Ratio',
        },
        {
            key: 'newFeaturePoints',
            label: 'New Feature Points',
        },
        {
            key: 'backlogBugPoints',
            label: 'Backlog Bug Points',
        },
        {
            key: 'maxTaskPoint',
            label: 'Max Task Point',
        },
        {
            key: 'avgTaskPoint',
            label: 'Avg Task Point',
        },
        {
            key: 'newBugCount',
            label: 'New Bug Count',
        },
        {
            key: 'newBugCountPerPoint',
            label: 'New Bug Count Per Point',
        },
        {
            key: 'newFeatureActualSum',
            label: 'New Feature Actual Sum',
        },
        {
            key: 'newFeatureEstimateSum',
            label: 'New Feature Estimate Sum',
        },

    ];

    function handleCompareChartSelectionChange(event: any) {
        setCompareMetric(event.key);
    }

    function getValueFromMetric(metric: MemberMetric, key: string) {
        let value = 0;
        switch (key) {
            case 'issueCount':
                value = metric.issueCount;
                break;
            case 'commitedPoints':
                value = metric.commitedPoints;
                break;
            case 'completedPoints':
                value = metric.completedPoints;
                break;
            case 'commitedRatio':
                value = metric.commitedRatio;
                break;
            case 'completedRatio':
                value = metric.completedRatio;
                break;
            case 'newFeaturePoints':
                value = metric.newFeaturePoints;
                break;
            case 'backlogBugPoints':
                value = metric.backlogBugPoints;
                break;
            case 'maxTaskPoint':
                value = metric.maxTaskPoint;
                break;
            case 'avgTaskPoint':
                value = metric.avgTaskPoint;
                break;
            case 'newBugCount':
                value = metric.newBugCount;
                break;
            case 'newBugCountPerPoint':
                value = metric.newBugCountPerPoint;
                break;
            case 'newFeatureActualSum':
                value = metric.newFeatureActualSum;
                break;
            default:
                break;
        }

        return value;
    }

    function getEChartOptions(compareMetric: string = '') {
        let maxValue = 0;

        const memberMetrics = new Map<string, number[]>();
        sprintMetricDicts.forEach((metric) => {
            for (const [name, member] of metric.entries()) {
                if (!members.find((m) => m.name === name)) {
                    continue;
                }

                let value = getValueFromMetric(member, compareMetric);
                if (value > maxValue) {
                    maxValue = value;
                }

                if (!memberMetrics.has(name)) {
                    memberMetrics.set(name, [value]);
                } else {
                    memberMetrics.get(name)?.push(value);
                }
            }
        });

        const memberData = Array.from(memberMetrics.entries()).map(([name, value]) => ({
            name,
            type: 'line',
            data: value,
        }));

        return {
            xAxis: {
                type: 'category',
                data: Array.from(sprintMetricDicts.keys())
            },
            yAxis: {
                type: 'value',
                min: 0,
                max: Math.ceil(maxValue / 10) * 10,
            },
            series: memberData
        };
    }

    return <div className="chart-container">
        <div className="chart-controls">
            <Dropdown
                menu={{
                    items: compareChartSelections,
                    onClick: handleCompareChartSelectionChange
                }}
            >
                <a onClick={(e) => e.preventDefault()}>
                    <Space>
                        {(compareChartSelections.find((e: any) => e?.key === compareMetric))?.label || "Select Chart Type"}
                        <DownOutlined />
                    </Space>
                </a>
            </Dropdown>
        </div>
        {
            compareMetric && <ReactECharts
                option={getEChartOptions(compareMetric)}
                style={{ height: '500px', width: '800px' }}
            />
        }
    </div>;
};

export default MemberCompare;