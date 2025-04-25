import dayjs from "dayjs";
import config from "../../../config";
import { Contribution, Issue, IssueStatusEnum, IssueTypeEnum, RoleEnum, Sprint, TeamMember } from "../../models/JiraData";
import { jiraQuery } from "./JiraDataQueryService";
import { MemberMetric } from "../../models/PerformanceMetric";

const PRIMARY_ISSUE_TYPES = [
    IssueTypeEnum.STORY,
    IssueTypeEnum.BUG,
    IssueTypeEnum.CHANGE_REQUEST,
];

const COMPLETE_STATES = [
    IssueStatusEnum.CLOSED,
    IssueStatusEnum.DONE,
    IssueStatusEnum.FIXED,
];

const TEAM_MEMBERS: TeamMember[] = config.teamMembers['TFSH3'];

class JiraDataConvertService {
    formatIssue(issue: Issue): Issue {
        issue.storyPoint = issue.fields.customfield_10026 ?? 0;
        issue.isCompleted = COMPLETE_STATES.includes(issue.fields.status.name);
        issue.storyBugCount = 0;
        issue.timeSpentOnImplementation = 0;
        issue.timeSpentOnVerification = 0;
        issue.timeSpentOnDevTest = 0;
        issue.timeSpentOnBugFixing = 0;
        issue.timeSpentTotal = issue.fields.timespent ?? 0;
        issue.isRollOvered = issue.fields.closedSprints?.length > 1;

        return issue;
    }

    /**
     * Get sprint summary with statistics
     *
     * @param {Sprint} sprint
     * @param {Issue[]} issues
     * @return {*}  {Sprint}
     * @memberof JiraDataConvertService
     */
    async getSprintSummary(boardId: number, sprint: Sprint): Promise<Sprint> {
        const duration = dayjs(sprint.endDate).add(1, 'day').diff(dayjs(sprint.startDate), 'day');
        const sprintReport = await jiraQuery.getSprintReport(boardId, sprint.id);

        if (!sprintReport.contents) {
            return sprint;
        }

        const {
            completedIssues, issuesNotCompletedInCurrentSprint,
            puntedIssues, issueKeysAddedDuringSprint
        } = sprintReport.contents;

        let totalCommitted = 0;
        let originalCompleted = 0;
        let originalNotCompleted = 0;
        let newlyCompleted = 0;
        let newlyNotCompleted = 0;

        completedIssues.forEach(issue => {
            const point = issue.estimateStatistic.statFieldValue.value ?? 0;
            if (issueKeysAddedDuringSprint[issue.key]) {
                newlyCompleted += point;
            } else {
                originalCompleted += point;
            }
        });

        issuesNotCompletedInCurrentSprint.forEach(issue => {
            const point = issue.estimateStatistic.statFieldValue.value ?? 0;
            if (issueKeysAddedDuringSprint[issue.key]) {
                newlyNotCompleted += point;
            } else {
                originalNotCompleted += point;
            }
        });

        puntedIssues.forEach(issue => {
            const point = issue.estimateStatistic.statFieldValue.value ?? 0;
            if (!issueKeysAddedDuringSprint[issue.key]) {
                totalCommitted += point;
            }
        });

        sprint.originalCompleted = originalCompleted;
        sprint.originalNotCompleted = originalNotCompleted;
        sprint.originalCommitted = originalCompleted + originalNotCompleted;
        sprint.newlyCompleted = newlyCompleted;
        sprint.newlyNotCompleted = newlyNotCompleted;
        sprint.newlyAdded = newlyCompleted + newlyNotCompleted;
        sprint.totalCommitted = totalCommitted + originalCompleted + originalNotCompleted;
        sprint.totalCompleted = originalCompleted + newlyCompleted;

        if (duration > 0) {
            sprint.duration = duration;
            sprint.storyPointPerDay = sprint.totalCompleted / duration;
        }

        return sprint;
    }

    analyzeSprintIssues(sprint: Sprint, issues: Issue[]) {
        const primaryIssueDict = new Map<string, Issue>();

        // Iterate through all primary issues first
        issues.forEach(issue => {
            if (PRIMARY_ISSUE_TYPES.includes(issue.fields.issuetype.name)) {
                if (COMPLETE_STATES.includes(issue.fields.status.name)) {
                    const matchedClosedSprint = issue.fields.closedSprints.find(s => s.id === sprint.id);
                    issue.isCompletedInCurrentSprint = matchedClosedSprint
                        && issue.fields.closedSprints.every(s => s.startDate <= matchedClosedSprint.startDate);
                }

                primaryIssueDict.set(issue.key, issue);
            }
        });

        // Iterate through non-primary issues
        issues.forEach(issue => {
            const parent = issue.fields.parent?.key && primaryIssueDict.get(issue.fields.parent.key);
            if (!parent) {
                return;
            }

            parent.timeSpentTotal = (parent.timeSpentTotal ?? 0) + (issue.fields.timespent ?? 0);

            switch (issue.fields.issuetype.name) {
                case IssueTypeEnum.SPRINT_TASK:
                    if (issue.fields.summary.toLowerCase().includes('dev test')) {
                        parent.timeSpentOnDevTest = (parent.timeSpentOnDevTest ?? 0) + (issue.fields.timespent ?? 0);
                    } else {
                        parent.timeSpentOnImplementation = (parent.timeSpentOnImplementation ?? 0) + (issue.fields.timespent ?? 0);
                    }
                    break;
                case IssueTypeEnum.SPRINT_BUG:
                    parent.storyBugCount = (parent.storyBugCount ?? 0) + 1;
                    parent.timeSpentOnBugFixing = (parent.timeSpentOnBugFixing ?? 0) + (issue.fields.timespent ?? 0);
                    break;
                case IssueTypeEnum.SUB_TEST_EXECUTION:
                    parent.timeSpentOnVerification = (parent.timeSpentOnVerification ?? 0) + (issue.fields.timespent ?? 0);
                    break;
                default:
                    break;
            }

            const match = parent.fields.subtasks.find(t => t.id === issue.id);
            if (match) {
                Object.assign(match, issue)
            } else {
                parent.fields.subtasks.push(issue);
            }
        });

        // Calculate worklogs for each primary issue
        for (const issue of primaryIssueDict.values()) {
            issue.contributions = this.calculateIssueWorkLogs(issue);
        }

        return [...primaryIssueDict.values()];
    }

    private calculateIssueWorkLogs(issue: Issue) {
        // Initialize worklog map for this issue
        const worklogsByPerson: { [key: string]: number } = {};
        const memberDict = TEAM_MEMBERS.reduce((acc, cur) => acc.set(cur.name, cur), new Map<string, TeamMember>())

        // Helper function to add worklogs to the map
        const addWorklogs = (issue: Issue) => {
            if (!issue) return;

            issue.fields.customfield_10042?.forEach(developer => {
                const name = developer.displayName;
                if (!worklogsByPerson[name] && memberDict.has(name)) {
                    worklogsByPerson[name] = 0;
                }
            });

            issue.fields.worklog?.worklogs.forEach(log => {
                const author = log.author.displayName;
                const timeSpentSeconds = log.timeSpentSeconds || 0;
                worklogsByPerson[author] = (worklogsByPerson[author] || 0) + timeSpentSeconds;
            });
        };

        // Add worklogs from the main issue
        addWorklogs(issue);

        // Add worklogs from subtasks
        if (issue.fields.subtasks) {
            issue.fields.subtasks.forEach(subtask => {
                addWorklogs(subtask);
            });
        }

        const contributions: Contribution[] = [];

        // Convert seconds to hours and round to 1 decimal place
        Object.keys(worklogsByPerson).forEach(memberName => {
            const member = memberDict.get(memberName);
            if (member) {
                contributions.push({
                    Contributor: member,
                    TimeInSeconds: worklogsByPerson[memberName],
                });
            }
        });

        contributions.sort((a, b) => {
            if (a.Contributor.role !== b.Contributor.role) {
                return a.Contributor.role === RoleEnum.DEVELOPER ? -1 : 1;
            }

            return a.TimeInSeconds
        });

        return contributions;
    }

    calculateSprintMemberMetrics(sprint: Sprint, issues: Issue[]): Map<string, MemberMetric> {
        const primaryIssues = this.analyzeSprintIssues(sprint, issues);
        const memberMetricDict: Map<string, MemberMetric> = new Map();
        const { duration, totalCommitted = 0, totalCompleted = 0 } = sprint;

        primaryIssues.forEach(issue => {
            const member = issue.contributions[0]?.Contributor;
            if (!member) {
                return;
            }

            let metric = memberMetricDict.get(member.name);
            if (!metric) {
                metric = {
                    name: member.name,
                    issueCount: 0,
                    commitedPoints: 0,
                    completedPoints: 0,
                    commitedPointsPerDay: 0,
                    completedPointsPerDay: 0,
                    newFeaturePoints: 0,
                    backlogBugPoints: 0,
                    maxTaskPoint: 0,
                    avgTaskPoint: 0,
                    newFeatureActualSum: 0,
                    newFeatureEstimateSum: 0,
                    backlogBugActualSum: 0,
                    backlogBugEstimateSum: 0,
                    newBugCount: 0,
                    newBugCountPerPoint: 0,
                    newFeatureActEst: 0,
                    backlogBugActEst: 0,
                    commitedRatio: 0,
                    completedRatio: 0
                };

                memberMetricDict.set(member.name, metric);
            }

            metric.issueCount++;
            metric.commitedPoints += issue.storyPoint;

            if (issue.storyPoint > metric.maxTaskPoint) {
                metric.maxTaskPoint = issue.storyPoint;
            }

            if (issue.isCompletedInCurrentSprint) {
                metric.completedPoints += issue.storyPoint;
            }

            switch (issue.fields.issuetype.name) {
                case IssueTypeEnum.STORY:
                case IssueTypeEnum.CHANGE_REQUEST:
                    metric.newFeaturePoints += issue.storyPoint;
                    metric.newFeatureActualSum += issue.fields.aggregatetimespent ?? 0;
                    metric.newFeatureEstimateSum += issue.fields.aggregatetimeoriginalestimate ?? 0;
                    metric.newBugCount += issue.storyBugCount ?? 0;
                    break;
                case IssueTypeEnum.BUG:
                    metric.backlogBugPoints += issue.storyPoint;
                    metric.backlogBugActualSum += issue.fields.aggregatetimespent ?? 0;
                    metric.backlogBugEstimateSum += issue.fields.aggregatetimeoriginalestimate ?? 0;
                    break;
                default:
                    break;
            }
        });

        for (const metric of memberMetricDict.values()) {
            metric.avgTaskPoint = metric.commitedPoints / metric.issueCount;
            metric.newFeatureActEst = metric.newFeatureActualSum / metric.newFeatureEstimateSum;
            metric.backlogBugActEst = metric.backlogBugActualSum / metric.backlogBugEstimateSum;
            metric.newBugCountPerPoint = metric.newBugCount / metric.newFeaturePoints;
            metric.commitedPointsPerDay = metric.commitedPoints / duration;
            metric.completedPointsPerDay = metric.completedPoints / duration;
            metric.commitedRatio = totalCommitted ? metric.commitedPoints / totalCommitted : 0;
            metric.completedRatio = totalCompleted ? metric.completedPoints / totalCompleted : 0;
        }

        return memberMetricDict;
    }

    async getSprintsMetrics(boardId: number, sprints: Sprint[]): Promise<Map<string, MemberMetric>[]> {
        const requestTasks = sprints.map(s => {
            return Promise.all([
                jiraConvert.getSprintSummary(boardId, s),
                jiraQuery.getIssuesBySprintId(s.id)
            ]);
        });

        return Promise.allSettled(requestTasks).then((results) => {
            const sprintDataList = results.filter((res) => res.status === 'fulfilled').map((res) => res.value);

            sprintDataList.sort((a, b) => a[0].startDate > b[0].startDate ? 1 : -1);

            return sprintDataList.map(([sprint, issues]) => jiraConvert.calculateSprintMemberMetrics(sprint, issues));
        });
    }
}

export const jiraConvert = new JiraDataConvertService();
