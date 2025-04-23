import { Descriptions, DescriptionsProps } from "antd";
import { Sprint } from "../../../models/JiraData";
import dayjs from "dayjs";

interface SprintInfoProps {
    sprint: Sprint;
}

const SprintInfo: React.FC<SprintInfoProps> = ({ sprint }) => {
    const dateFormat = "YYYY-MM-DD";

    const descpItems: DescriptionsProps['items'] = [
        {
            key: 'startdate',
            label: 'Start Date',
            children: dayjs(sprint?.startDate).format(dateFormat),
            span: 2
        },
        {
            key: 'enddate',
            label: 'End Date',
            children: dayjs(sprint?.endDate).format(dateFormat),
            span: 2
        },
        {
            key: 'sprintstatus',
            label: 'Sprint Status',
            children: sprint?.state ?? 'Unknown',
            span: 2
        },
        {
            key: 'completedate',
            label: 'Complete Date',
            children: sprint?.completeDate ? dayjs(sprint?.completeDate).format(dateFormat) : 'Not yet completed',
            span: 2
        },
        {
            key: 'sprintgoal',
            label: 'Sprint Goal',
            children: sprint?.goal ?? 'No goal set',
            span: 3
        },
        {
            key: 'originalcommitted',
            label: 'Original Committed',
            children: sprint?.originalCommitted ?? 0,
            span: 2
        },
        {
            key: 'originalcompleted',
            label: 'Original Completed',
            children: sprint?.originalCompleted ?? 0,
            span: 2
        },
        {
            key: 'completionrate',
            label: 'Completion Rate',
            children: `${sprint?.originalCommitted ? ((sprint?.originalCompleted ?? 0) / sprint?.originalCommitted * 100).toFixed(1) : 0}%`,
            span: 4
        },
        {
            key: 'newlyadded',
            label: 'Newly Added',
            children: sprint?.newlyAdded ?? 0,
            span: 2,
        },
        {
            key: 'newlyaddedcompleted',
            label: 'Newly Added Completed',
            children: sprint?.newlyCompleted ?? 0,
            span: 2,
        },
        {
            key: 'totalcompleted',
            label: 'Total Completed',
            children: sprint.totalCommitted ?? 0,
            span: 3,
        },
        {
            key: 'numberofdays',
            label: 'Number of Days',
            children: sprint.duration ?? 'N/A',
            span: 2,
        },
        {
            key: 'completedperday',
            label: 'Completed Per Day',
            children: sprint.storyPointPerDay?.toFixed(2) ?? 'N/A',
            span: 2,
        }
    ];

    return <Descriptions
        title={sprint.name}
        column={3}
        items={descpItems}
        bordered
    />
};

export default SprintInfo;