import config from "../../../config";
import { Contribution, Issue, IssueStatusEnum, IssueTypeEnum, RoleEnum, Sprint, TeamMember } from "../../models/JiraData";
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

const TEAM_MEMBERS: TeamMember[] = config.teamMembers['TFSH3'];

class JiraDataConvertService {
    formatIssue(issue: Issue): Issue {
        issue.storyPoint = issue.fields.customfield_10026 ?? 0;
        issue.isCompleted = COMPLETE_STATES.includes(issue.fields.status.name);
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
    async getSprintSummary(sprint: Sprint): Promise<Sprint> {
        // TBD: analyse sprint stat
        const sprintReport = await jiraQuery.getSprintReport(sprint.originBoardId, sprint.id);
        const { completedIssues, issuesNotCompletedInCurrentSprint, puntedIssues, issueKeysAddedDuringSprint } = sprintReport.contents;

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

        return sprint;
    }

    analyzeSprintIssues(issues: Issue[]) {
        const primaryIssueDict = new Map<string, Issue>();

        // Iterate through all primary issues first
        issues.forEach(issue => {
            if (PRIMARY_ISSUE_TYPES.includes(issue.fields.issuetype.name)) {
                primaryIssueDict.set(issue.key, issue);
            }
        });

        // Iterate through non-primary issues
        issues.forEach(issue => {
            const parent = issue.fields.parent?.key && primaryIssueDict.get(issue.fields.parent.key);
            if (!parent) {
                return;
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
}

export const jiraConvert = new JiraDataConvertService();
