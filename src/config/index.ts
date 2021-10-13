
export const config = {
    redmineApiKey: process.env.REDMINE_API_KEY,
    group: { wp: 241, react: 246 },
    baseUrl: process.env.REDMINE_BASE_URL,
    botToken: process.env.TELEGRAM_BOT_TOKEN,
    chatId: process.env.TELEGRAM_CHAT_ID,
    schedule: process.env.SCHEDULE_TEMPLATE,
    issue_status_id: process.env.ISSUE_STATUS_ID
}