# BOJ Group Judge Status Discord Bot

A serverless function for fetching, notifying BOJ group judge status

![CircleCI](https://img.shields.io/circleci/build/github/Jaewoook/BOJ-group-judge-status-discord-bot)

## Prerequisite

Before using Discord notify feature, you have to create your own Discord Bot with send message permission and add it to your channel. **[Create Discord bot here](https://discord.com/developers/applications)**

## Usage

There are two methods to use this function. You can choose one of these methods to get started.

### Method 1. Use deployed Vercel function

Simply use deployed Vercel function is the easiest way. It is deployed when this repository is updated. You can use latest version of this API without any manual update.

**API Endpoint:** `https://boj-group-judge-status-discord-bot.vercel.app/api/status`

### Method 2. Manual Configuration

#### Step 1. Deploy to your Vercel

You can customize API behavior and others by modifying and deploying function to your Vercel server. Click on the **Deploy button** to start.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/git/external?repository-url=https%3A%2F%2Fgithub.com%2FJaewoook%2FBOJ-group-judge-status-discord-bot)

### Step 2. Setup the cron job for continous update

By default, This function will quit after response. So, you need setup for continous status update using cron job.

Thankfully, GitHub Actions provides scheduled workflow. Here is example GitHub Actions config.

> NOTE: You need to set repository secrets to protect sensetive information.

```yaml
name: Update group judge status

on:
  workflow_dispatch:
  # Call this function every 5 minutes
  schedule:
    - cron: '*/5 * * * *'

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - name: Update group judge status
        run: |
          curl -G -L https://boj-group-judge-status-discord-bot.vercel.app/api/status \
          -d 'boj_token=${{ secrets.BOJ_TOKEN }}' \
          -d 'boj_group_code=${{ secrets.BOJ_GROUP_CODE }}' \
          -d 'discord_token=${{ secrets.DISCORD_TOKEN }}' \
          -d 'discord_channel_id=${{ secrets.DISCORD_CHANNEL_ID }}'
```

## API

```
ANY /api/status
```

### Query parameter

| name | description | required |
|---|---|:---:|
| boj_token | BOJ token (cookie name: OnlineJudge) | Y |
| boj_group_code | BOJ Group ID | Y |
| discord_token | Discord access token | Y |
| discord_channel_id | Discord channel ID | Y |

### Response

```ts
HTTP 200 OK

{
    "status": "OK",
    "data": {
        "originals": [
            {
                "id": string,
                "user_id": string,
                "problem": {
                    "num": string,
                    "name": string,
                };
                "result": string,
                "timestamp": number,
            },
        ],
        "sent": [
            {
                "id": string,
                "user_id": string,
                "problem": {
                    "num": string,
                    "name": string,
                };
                "result": string,
                "timestamp": number,
            },
        ]
    }
]
```

```ts
HTTP 500 Internal Server Error

{
    "status": "error",
    "error": "error reason",
}
```

## Run on your local machine

You can run and test serverless function using **Vercel CLI**

```sh
# Install Vercel CLI if not installed.
yarn global add vercel

# move to project's root directory
cd BOJ-group-judge-status-discord-bot

# Start vercel dev server with localhost mode
yarn start
```

## Author

- [Jaewook Ahn](https://github.com/Jaewoook)

## License

MIT License
