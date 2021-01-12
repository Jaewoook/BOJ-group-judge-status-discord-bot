/**
 * External dependencies
 */
import { Client, MessageEmbed, TextChannel } from "discord.js";
import { format } from "date-fns-tz";
import { parse } from "date-fns";

/**
 * Internal dependencies
 */
import { StatusData } from "./status-parser";
import { isLocalhost, log } from "./utils";

const MSG_FIELD_LABEL_USER_ID = "👤 아이디 ";
const MSG_FIELD_LABEL_PROBLEM_NUM = "🔢 문제 번호 ";
const MSG_FIELD_LABEL_PROBLEM_NAME = "📝 문제 이름 ";
const MSG_FIELD_LABEL_RESULT = "✅ 결과 ";
const MSG_FIELD_LABEL_TIMESTAMP = "🕐 채점 시간 ";
const MSG_FIELD_LABEL_URL = "🔗 문제 URL ";
const TIMESTAMP_FORMAT = "yyyy년 MM월 dd일 HH시 mm분";

const getUrl = (problemNum: string) => `https://www.acmicpc.net/problem/${problemNum}`;

export class Reporter {

    client: Client;
    token: string;
    guildId: string;
    channelId: string;

    constructor(token: string, guildId: string, channelId: string) {
        this.token = token;
        this.guildId = guildId;
        this.channelId = channelId;
        this.client = new Client();
    }

    login() {
        if (!this.token) {
            throw new Error("No Access Token provided");
        }
        return new Promise<void>((resolve) => {
            this.client.once("ready", this.handleClicentReady(resolve));
            this.client.login(this.token);
        });
    }

    handleClicentReady(resolve: () => void) {
        return () => {
            this.client.user.setActivity("채점 기록 확인");
            resolve();
        };
    }

    generateReportMessage(data: StatusData) {
        return new MessageEmbed()
            .setColor(0x0099ff)
            .addField(MSG_FIELD_LABEL_USER_ID, data.user_id, true)
            .addField(MSG_FIELD_LABEL_PROBLEM_NUM, data.problem.num, true)
            .addField(MSG_FIELD_LABEL_PROBLEM_NAME, data.problem.name, true)
            .addField(MSG_FIELD_LABEL_RESULT, data.result, true)
            .addField(MSG_FIELD_LABEL_TIMESTAMP, format(data.timestamp, TIMESTAMP_FORMAT, { timeZone: "Asia/Seoul" }), true)
            .addField(MSG_FIELD_LABEL_URL, getUrl(data.problem.num))
            .setTimestamp();
    }

    async notify(statusData: StatusData[]) {
        try {
            //  fetch target information
            const guild = await this.client.guilds.resolve(this.guildId).fetch();
            const channel = guild.channels.resolve(this.channelId) as TextChannel;
            const msg = await channel.messages.fetch({ limit: 1 });
            const latestTimestamp = parse(
                                        msg.map((m) => m.embeds[0])[0].fields.find((f) => MSG_FIELD_LABEL_TIMESTAMP.startsWith(f.name)).value,
                                        TIMESTAMP_FORMAT,
                                        new Date(),
                                    ).getTime() + 1000 * 59;
            statusData = statusData.filter((row) => row.timestamp > latestTimestamp);
            if (!statusData.length) {
                //  TODO throw error
                log.error("No status data to send");
                return;
            }
            if (isLocalhost()) {
                log.verbose("filtered data:", statusData);
            }

            const queue = statusData.reverse().map((row) => this.generateReportMessage(row));
            await Promise.all(queue.map(async (message) => {
                return channel.send(message);
            }));
            log.verbose("message sent!");
        } finally {
            this.cleanup();
        }
    }

    cleanup() {
        if (this.client) {
            this.client.destroy();
        }
    }

}
