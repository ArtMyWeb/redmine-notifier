import { config } from '../config'
import { TelegramHendler } from '../notifier/telegram/telegram'
import { RedmineTS } from '../redmine/redmine'
import { MyError } from '../util/util'
import { RedminesReport } from './redminesReport'

export class IssueReport extends RedminesReport {

    constructor() {
        super()
    }

    private async getIssueList(limit: number, offset: number): Promise<RedmineTS.Issues.Issue[]> {
        let result: RedmineTS.Issues.Issue[] = []
        try {
            const status_id = Number.parseInt(config.issue_status_id || '')
            while (true) {
                const data: RedmineTS.Issues.Issues = await IssueReport.redmine.listIssues({ status_id, limit, offset })
                result = result.concat(data.issues)
                if (data.offset >= data.total_count) {
                    break
                }
                offset += limit
            }
        } catch (err) {
            MyError.showError(err)
        }

        return result
    }

    private fileterIssuesByDoneRatio(list: RedmineTS.Issues.Issue[], ratio: number): RedmineTS.Issues.Issue[] {
        return list.filter((item) => item.done_ratio >= ratio)
    }

    private prepareDataForReport(data: RedmineTS.Issues.Issue[]): IssueReport.ReportData[] {
        const result: IssueReport.ReportData[] = []
        data.forEach((item: RedmineTS.Issues.Issue) => {
            const tmp: IssueReport.ReportData = {
                issue_name: item.subject,
                issue_link: `${config.baseUrl}/issues/${item.id}`,
                project_name: item?.project?.name || '',
                project_link: !!item?.priority?.id ? `${config.baseUrl}/projects/${item.project.id}` : '---',
                message: item.done_ratio < 80 ? 'Time to check Estimation for current Issue' : 'Red Line passed, please pay attention to this task'
            }
            result.push(tmp)
        })
        return result
    }

    public async getReport() {
        let issues = await this.getIssueList(25, 0)
        issues = this.fileterIssuesByDoneRatio(issues, 50)
        const data = this.prepareDataForReport(issues)
        const tBot = new TelegramHendler()
        const promises: Promise<any>[] = []
        for (let i = 0; i < data.length; i++) {
            promises.push(new Promise((resolve, reject) => {
                setTimeout(() => resolve(tBot.sendIssueReport(data[i])), i * 3000)
            }))
        }
        if (promises.length) {
            return Promise.all(promises)
        }
        return null
    }
}

export namespace IssueReport {
    export type ReportData = {
        issue_name: string
        issue_link?: string
        project_name?: string
        project_link?: string
        message: IssueReprotMessage
    }

    export type IssueReprotMessage = 'Time to check Estimation for current Issue' | 'Red Line passed, please pay attention to this task'
}

