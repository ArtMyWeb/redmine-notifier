import path from 'path'
import { Telegraf } from 'telegraf'
import { config } from '../../config'
import { Report } from '../../reports/timeIssueReports'
import { Notifier, NotifierHandler } from '../notifier'
import fs from 'fs'
import Handlebars from 'handlebars'
import { MyError } from '../../util/util'
import { IssueReport } from '../../reports/issueReport'

class Telegram implements Notifier {
    private bot: any
    private chatId: any

    constructor() {
        this.chatId = config.chatId
        if (!this.bot) {
            try {
                this.bot = new Telegraf(config.botToken || '')
            } catch (err) {
                MyError.showError(err)
            }
        }
    }

    /**
     * 
     * @param item 
     */
    public async sendActivityReport(item: Report.ReportData): Promise<void> {

        const filePath = path.join(__dirname, '/templates/activity.html')
        const fileData = await fs.readFileSync(filePath).toString()

        const template = Handlebars.compile(fileData)
        const message = template(item)

        this.SendMessage(message)
    }

    public async sendIssueReport(item: IssueReport.ReportData): Promise<void> {
        const filePath = path.join(__dirname, '/templates/issue.html')
        const fileData = await fs.readFileSync(filePath).toString()

        const template = Handlebars.compile(fileData)
        const message = template(item)

        this.SendMessage(message)
    }

    /**
     * 
     * @param message 
     */
    private SendMessage(message: string) {
        try {
            this.bot.telegram.sendMessage(this.chatId, message, { parse_mode: 'HTML' })
        } catch (err) {
            MyError.showError(err)
        }
    }
}

export class TelegramHendler extends NotifierHandler {
    public createNotifer(): Notifier {
        return new Telegram()
    }
}