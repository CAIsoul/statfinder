import { Issue, IssueRow, Sprint } from "../../models/JiraData";

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

    getSprintSummary(sprint: Sprint, issues: Issue[]): Sprint {
        // TBD: analyse sprint stat

        return sprint;
    }
}

export const jiraConvert = new JiraDataConvertService();
