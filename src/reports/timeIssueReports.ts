import { config } from '../config'
import { TelegramHendler } from '../notifier/telegram/telegram'
import { RedmineTS } from '../redmine/redmine'
import { MyError } from '../util/util'
import { RedminesReport } from './redminesReport'


/**
 * TimeIssueReports
 */
export class TimeIssueReports extends RedminesReport {

    constructor() {
        super()
    }

    /**
     * getUserList
     * 
     * @param groupId 
     * @returns 
     */
    private async getUsersList(group_id: number): Promise<Report.User[]> {
        const users: Report.User[] = []
        try {
            const list = await TimeIssueReports.redmine.listUsers({ group_id })
            list.users.forEach((item: any) => {
                const user: Report.User = {
                    id: item.id,
                    firstname: item.firstname,
                    lastname: item.lastname
                }
                users.push(user)
            })
            return users
        }
        catch (err) {
            console.log('Get User List Error: ', err)
            throw new Error(`Get User List Error: ${err}`)
        }
    }

    /**
     * Get time_entries list
     * 
     * @param user_id 
     * @param from 
     * @param to 
     * @returns 
     */
    private async getTimeEntriesList(user_id: number, from: string, to?: string): Promise<RedmineTS.TimeEntries.TimeEntries> {
        try {
            const options: RedmineTS.TimeEntries.ListParams = {
                user_id,
                from
            }
            options.to = !!to ? to : from
            return await TimeIssueReports.redmine.listTimeEntries(options)
        }
        catch (err) {
            MyError.showError(err)
            throw new Error(`Get User List Error: ${err}`)
        }
    }

    /**
     * Prepare Report Data by User
     * 
     * @param list 
     * @param user 
     * @returns 
     */
    private prepareReportDatByUser(list: RedmineTS.TimeEntries.TimeEntries, user: Report.User): Report.ReportData {
        let totalHours = 0
        const activity: Report.Activity[] = this.getActivity(list)
        activity.forEach((item: Report.Activity) => totalHours += item.spent_hours)
        const fullname: string = `${user.firstname} ${user.lastname}`
        const result: Report.ReportData = {
            user: fullname,
            totalHours,
            activity
        }
        return result
    }

    /**
     * Convert Activity
     * 
     * @param list 
     * @returns 
     */
    private getActivity(list: RedmineTS.TimeEntries.TimeEntries): Report.Activity[] {
        let data: Report.Activity[] = []
        list.time_entries.forEach((item: RedmineTS.TimeEntries.TimeEntry) => {
            const tmp: Report.Activity = {
                activity: item.activity?.name || '',
                project_id: item.project.id,
                project_name: item.project?.name || '',
                issue_id: item?.issue?.id,
                project_link: `${config.baseUrl}/projects/${item.project.id}`,
                issue_link: !!item?.issue?.id ? `${config.baseUrl}/issues/${item.issue.id}` : '---',
                comment: item.comments,
                spent_hours: item.hours,
            }
            data.push(tmp)
        })
        return data
    }

    /**
     * Get Report
     * 
     * @returns 
     */
    public async getReport() {
        try {
            if (typeof config.group !== 'object') return null
            console.log()

            const date = new Date().toISOString().slice(0, 10)

            for (const value of Object.values(config.group)) {
                return await this.prepareAndSend(value, date)
            }

        }
        catch (err) {
            MyError.showError(err)
        }
        return null
    }

    /**
     * 
     * @param group_id 
     * @param date 
     * @returns 
     */
    private async prepareAndSend(group_id: number, date: string): Promise<any> {

        const users: Report.User[] = await this.getUsersList(group_id)
        const tBot = new TelegramHendler()
        const promises: Promise<any>[] = []

        for (let i = 0; i < users.length; i++) {
            const data: RedmineTS.TimeEntries.TimeEntries = await this.getTimeEntriesList(users[i].id, date)
            const item: Report.ReportData = this.prepareReportDatByUser(data, users[i])
            if (item.totalHours < 8) {
                try {
                    promises.push(new Promise((resolve, reject) => {
                        setTimeout(() => resolve(tBot.sendActivityNotification(item)), i * 3000)
                    }))
                } catch (err) {
                    MyError.showError(err)
                }
            }
        }

        if (promises.length) return Promise.all(promises)

        return Promise.all([])
    }
}

export namespace Report {
    export type ReportData = {
        user: string
        totalHours: number
        activity: Activity[]
    }

    export type Activity = {
        activity: string
        project_id: number
        project_name: string
        issue_id: number
        project_link: string
        issue_link: string
        comment: string
        spent_hours: number
    }

    export type User = {
        id: number
        firstname: string
        lastname: string
    }
}