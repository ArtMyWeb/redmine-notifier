# Redmine Notifier

## Environment Variables

    REDMINE_API_KEY: redmine API key
    REDMINE_BASE_URL: redmine base URL (https://redmine.com)
    REDMINE_GROUPS: {key: value, key1: value1}
    TELEGRAM_BOT_TOKEN: telegram bot token
    TELEGRAM_CHAT_ID: telegram chat id
    TZ: Time Zone (Europe/Kiev)
    SCHEDULE_TEMPLATE: '*/2 * * * *' according to [node-cron](https://www.npmjs.com/package/node-cron)
    ISSUE_STATUS_ID: issue status id   

 ## Deployment
  1. create `.env` file
  2. run `docker-compose up --build`