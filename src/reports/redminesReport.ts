import { Redmine, RedmineTS } from '../redmine/redmine'
import { config } from '../config'

export class RedminesReport {
    public static redmine: Redmine

    constructor() {
        if (!RedminesReport.redmine) {
            const options: RedmineTS.Config = { apiKey: config.redmineApiKey ?? '' }
            RedminesReport.redmine = new Redmine(config.baseUrl ?? '', options)
        }
    }
}