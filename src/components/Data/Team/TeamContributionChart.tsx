import { Issue } from "../../../models/JiraData";
import ReactECharts from 'echarts-for-react';

interface TeamContributionChartProps {
    issues: Issue[];
}

const TeamContributionChart: React.FC<TeamContributionChartProps> = ({ issues }) => {
    const contributionData = issues.reduce((acc: { [key: string]: number }, cur) => {
        const mainContributor = cur.contributions[0];
        if (cur.isCompleted && mainContributor) {
            acc[mainContributor.Contributor.name] = (acc[mainContributor.Contributor.name] ?? 0) + cur.storyPoint;
        }
        return acc;
    }, {});

    const eChartOptions = {
        series: [{
            type: 'pie',
            data: Object.entries(contributionData).map(([name, value]) => ({ name, value }))
        }]
    };

    return <ReactECharts
        option={eChartOptions}
        style={{ height: '300px', width: '800px' }}
    />;
};

export default TeamContributionChart;