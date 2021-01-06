# BOJ Group Status Discord Bot

## Introduction

This is an API handler performs **Baekjoon Online Judge** group judge status parse and notify to discord channel.

## Features

- group judge status API
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
