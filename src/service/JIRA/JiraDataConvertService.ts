import { Issue, IssueRow, IssueStatusEnum, IssueTypeEnum, Sprint, SprintReport, Worklog } from "../../models/JiraData";
import { jiraQuery } from "./JiraDataQueryService";

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

class JiraDataConvertService {
    ConvertToIssueRow(issue: Issue): IssueRow {
        return {
            id: issue.id,
            key: issue.key,
            url: issue.self,

            summary: issue.fields.summary,
            issuetype: issue.fields.issuetype?.name,
            status: issue.fields.status?.name,
            priority: issue.fields.priority?.name,
            storyPoint: issue.fields.customfield_10026 ?? 0,

            description: issue.fields.description,
            updated: issue.fields.updated,
            duedate: issue.fields.duedate,
            resolutiondate: issue.fields.resolutiondate,
            reporter: issue.fields.reporter?.displayName,
            children: issue.fields.subtasks?.length > 0 ? issue.fields.subtasks.map(s => this.ConvertToIssueRow(s)) : undefined,
        }
    }

    /**
     * Get sprint summary with statistics
     *
     * @param {Sprint} sprint
     * @param {Issue[]} issues
     * @return {*}  {Sprint}
     * @memberof JiraDataConvertService
     */
    async getSprintSummary(sprint: Sprint): Promise<Sprint> {
        // TBD: analyse sprint stat
        const sprintReport = await jiraQuery.getSprintReport(sprint.originBoardId, sprint.id);
        const { allIssuesEstimateSum, completedIssues, issuesNotCompletedInCurrentSprint, puntedIssues,
            issuesCompletedInAnotherSprint, issueKeysAddedDuringSprint,
            completedIssuesEstimateSum, completedIssuesInitialEstimateSum,
            issuesCompletedInAnotherSprintEstimateSum, issuesCompletedInAnotherSprintInitialEstimateSum,
            issuesNotCompletedEstimateSum, issuesNotCompletedInitialEstimateSum,
            puntedIssuesEstimateSum, puntedIssuesInitialEstimateSum
        } = sprintReport.contents;

        // const primaryIssueDict = new Map<string, Issue>();

        // // Iterate through all primary issues first
        // issues.forEach(issue => {
        //     if (PRIMARY_ISSUE_TYPES.includes(issue.fields.issuetype.name)) {
        //         primaryIssueDict.set(issue.key, issue);
        //     }
        // });

        // // Iterate through non-primary issues
        // issues.forEach(issue => {
        //     const parent = issue.fields.parent?.key && primaryIssueDict.get(issue.fields.parent.key);
        //     if (!parent) {
        //         return;
        //     }

        //     const match = parent.fields.subtasks.find(t => t.id === issue.id);
        //     if (match) {
        //         Object.assign(match, issue)
        //     } else {
        //         parent.fields.subtasks.push(issue);
        //     }
        // });

        let totalCommitted = 0;
        let originalCompleted = 0;
        let originalNotCompleted = 0;
        let originalRemoved = 0;
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

        return sprint;
    }

    private calculateIssueWorkLogs(issue: Issue) {
        // Initialize worklog map for this issue
        const worklogsByPerson: { [key: string]: number } = {};

        // Helper function to add worklogs to the map
        const addWorklogs = (logs: Worklog[]) => {
            if (!logs) return;

            logs.forEach(log => {
                const author = log.author.displayName;
                const timeSpentSeconds = log.timeSpendSeconds || 0;
                worklogsByPerson[author] = (worklogsByPerson[author] || 0) + timeSpentSeconds;
            });
        };

        // Add worklogs from the main issue
        addWorklogs(issue.fields.worklog?.worklogs || []);

        // Add worklogs from subtasks
        if (issue.fields.subtasks) {
            issue.fields.subtasks.forEach(subtask => {
                addWorklogs(subtask.fields.worklog?.worklogs || []);
            });
        }

        // Convert seconds to hours and round to 1 decimal place
        Object.keys(worklogsByPerson).forEach(person => {
            worklogsByPerson[person] = Math.round(worklogsByPerson[person] / 3600 * 10) / 10;
        });

        return worklogsByPerson;
    }
}

export const jiraConvert = new JiraDataConvertService();
