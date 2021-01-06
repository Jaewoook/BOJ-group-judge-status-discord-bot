# BOJ Group Judge Status Discord Bot

A serverless function for fetching, notifying BOJ group judge status

![CircleCI](https://img.shields.io/circleci/build/github/Jaewoook/BOJ-group-judge-status-discord-bot)

## Prerequisite

Before using Discord notify feature, you have to create your own Discord Bot with send message permission and add it to your channel. **[Create Discord bot here](https://discord.com/developers/applications)**

## Usage

There are two methods to use API. You can follow one of these following methods.

### Method 1. Use deployed vercel function

Simply use deployed Vercel function is the easiest way. It is deployed when this repository is updated. You can use latest version of this API without any manual update.

**API Endpoint:** `https://boj-group-judge-status-discord-bot.vercel.app/api/status`

### Method 2. Manual Configuration

#### Deploy to your Vercel

You can customize API behavior and others by deploying this to your Vercel server. Click on the Deploy button to start.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/git/external?repository-url=https%3A%2F%2Fgithub.com%2FJaewoook%2FBOJ-group-judge-status-discord-bot)

### Setup the cron job for continous update

By defaukt, This function will quit after response. So, you need setup for continous status update using cron job.

Thankfully, GitHub Actions provides scheduled workflow. Here is example GitHub Actions config.

> NOTE: You need to set repository secrets to get sensetive information.

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
          curl --request POST \
          --url 'https://boj-group-judge-status-discord-bot.vercel.app/api/status?boj_token=$BOJ_TOKEN&boj_group_code=$BOJ_GROUP_CODE&discord_token=$DISCORD_TOKEN&discord_guild_id=$DISCORD_GUILD_ID&discord_channel_id=$DISCORD_CHANNEL_IDt'
        env:
          BOJ_TOKEN: ${{ secrets.BOJ_TOKEN }}
          BOJ_GROUP_CODE: ${{ secrets.BOJ_GROUP_CODE }}
          DISCORD_TOKEN: ${{ secrets.DISCORD_TOKEN }}
          DISCORD_GUILD_ID: ${{ secrets.DISCORD_GUILD_ID }}
          DISCORD_CHANNEL_ID: ${{ secrets.DISCORD_CHANNEL_ID }}
```

## API

```
ANY /api/group-status
```

### Query parameter

| name | description | required |
|---|---|:---:|
| boj_token | BOJ token (cookie name: OnlineJudge) | Y |
| boj_group_code | BOJ Group ID | Y |
| discord_token | Discord access token | Y |
| discord_guild_id | Discord Server ID | Y |
| discord_channel_id | Discord channel ID | Y |

## Run on your local machine

You can run and test serverless function using **Vercel CLI**

```sh
# Install Vercel CLI if not installed.
yarn global add vercel

# move to project's root directory
cd BOJ-group-judge-status-discord-bot

vercel dev
```

## Author

- [Jaewook Ahn](https://github.com/Jaewoook)

## License

MIT License
