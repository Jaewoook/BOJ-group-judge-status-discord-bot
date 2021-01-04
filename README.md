# BOJ Group Status Discord Bot

## Introduction

This is a API handler performs **Baekjoon Online Judge** group status parse and notify to discord channel.

## Features

- API handler
- CLI command (future)

## API

```
GET /api/group-status
```

### Query parameter

| name | description | required |
|---|---|:---:|
| boj_token | BOJ token (cookie name: OnlineJudge) | Y |
| boj_group_code | BOJ Group ID | Y |
| discord_token | Discord access token | Y |
| discord_guild_id | Discord Server ID | Y |
| discord_channel_id | Discord channel ID | Y |

## Author

- [Jaewook Ahn](https://github.com/Jaewoook)

## License

MIT License
