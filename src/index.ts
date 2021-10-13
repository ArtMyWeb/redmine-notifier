import dotenv from 'dotenv'
import crone from 'node-cron'
import { config } from './config'
import { IssueReport } from './reports/issueReport'
import { TimeIssueReports } from './reports/timeIssueReports'

class App {
    public static async init() {
        dotenv.config()
        console.log(config)
        crone.schedule(config.schedule || '* 22 1,2,3,4,5 * *', async () => {
            const activity = new TimeIssueReports()
            await activity.getReport()

            const issues = new IssueReport()
            await issues.getReport()
        })

    }
}
App.init()


