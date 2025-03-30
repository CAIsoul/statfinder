import { Issue, IssueRow, Sprint, SprintReport } from "../../models/JiraData";
import { jiraQuery } from "./JiraDataQueryService";

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
    async getSprintSummary(sprint: Sprint, issues: Issue[]): Promise<Sprint> {
        // TBD: analyse sprint stat
        const sprintReport = await jiraQuery.getSprintReport(sprint.originBoardId, sprint.id);
        const { allIssuesEstimateSum, completedIssues, issuesNotCompletedInCurrentSprint, puntedIssues,
            issuesCompletedInAnotherSprint, issueKeysAddedDuringSprint,
            completedIssuesEstimateSum, completedIssuesInitialEstimateSum,
            issuesCompletedInAnotherSprintEstimateSum, issuesCompletedInAnotherSprintInitialEstimateSum,
            issuesNotCompletedEstimateSum, issuesNotCompletedInitialEstimateSum,
            puntedIssuesEstimateSum, puntedIssuesInitialEstimateSum
        } = sprintReport.contents;

        sprint.originalCompleted = completedIssuesEstimateSum.value ?? 0;
        sprint.originalNotCompleted = issuesNotCompletedEstimateSum.value ?? 0;
        sprint.originalCommitted = sprint.originalCompleted + sprint.originalNotCompleted;

        sprint.originalCompleted = 0;
        sprint.originalNotCompleted = 0;
        sprint.newlyCompleted = 0;
        sprint.newlyNotCompleted = 0;

        completedIssues.forEach((issue: any) => {
            const storyPoint = issue.estimateStatistic.statFieldValue.value ?? 0;
            if (issueKeysAddedDuringSprint[issue.key]) {
                sprint.newlyCompleted += storyPoint;
            } else {
                sprint.originalCompleted += storyPoint;
            }
        });

        issuesNotCompletedInCurrentSprint.forEach((issue: any) => {
            const storyPoint = issue.estimateStatistic.statFieldValue.value ?? 0;
            if (issueKeysAddedDuringSprint[issue.key]) {
                sprint.newlyNotCompleted += storyPoint;
            } else {
                sprint.originalNotCompleted += storyPoint;
            }
        });


        sprint.totalCommitted = allIssuesEstimateSum.value;
        sprint.originalCommitted = sprint.originalCompleted + sprint.originalNotCompleted;
        sprint.newlyAdded = sprint.newlyCompleted + sprint.newlyNotCompleted;

        return sprint;
    }
}

export const jiraConvert = new JiraDataConvertService();
