import { IssueReport } from '../reports/issueReport'
import { Report } from '../reports/timeIssueReports'

export interface Notifier {
    sendActivityReport(item: Report.ReportData): void
    sendIssueReport(item: IssueReport.ReportData): void
}

export abstract class NotifierHandler {
    public abstract createNotifer(): Notifier

    public sendActivityNotification(item: Report.ReportData): void {
        const notifier = this.createNotifer()
        notifier.sendActivityReport(item)
    }

    public sendIssueReport(item: IssueReport.ReportData): void {
        const notifier = this.createNotifer()
        notifier.sendIssueReport(item)
    }
}