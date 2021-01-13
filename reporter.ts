/**
 * External dependencies
 */
import { Client, MessageEmbed, TextChannel } from "discord.js";

/**
 * Internal dependencies
 */
import { StatusData } from "./status-parser";
import { isLocalhost, log } from "./utils";

const MSG_FIELD_LABEL_USER_ID = "👤 아이디 ";
const MSG_FIELD_LABEL_PROBLEM_NUM = "🔢 문제 번호 ";
const MSG_FIELD_LABEL_PROBLEM_NAME = "📝 문제 이름 ";
const MSG_FIELD_LABEL_RESULT = "✅ 결과 ";
const MSG_FIELD_LABEL_URL = "🔗 문제 URL ";

const getUrl = (problemNum: string) => `https://www.acmicpc.net/problem/${problemNum}`;

export class Reporter {

    client: Client;
    token: string;
    channelId: string;

    constructor(token: string, channelId: string) {
        this.token = token;
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
            .addField(MSG_FIELD_LABEL_URL, getUrl(data.problem.num))
            .setTimestamp(data.timestamp);
    }

    async notify(statusData: StatusData[]) {
        return new Promise<StatusData[]>((resolve, reject) => {
            //  fetch target information
            const channel = this.client.channels.resolve(this.channelId) as TextChannel;
            channel.messages.fetch({ limit: 1 }).then((msg) => {
                const latestTimestamp = msg.map((m) => m.embeds[0])[0].timestamp;
                statusData = statusData.filter((row) => row.timestamp > latestTimestamp);
                if (!statusData.length) {
                    //  TODO throw error
                    log.error("No status data to send");
                    resolve([]);
                    return;
                }
                if (isLocalhost()) {
                    log.verbose("filtered data:", statusData);
                }
                const queue = statusData.reverse().map((row) => this.generateReportMessage(row));
                return Promise.all([Promise.all(queue.map((message) => channel.send(message))), statusData]);
            }).then((result) => {
                log.verbose("message sent!");
                resolve(result[1]);
            }).catch((err) => reject(err))
            .finally(() => this.cleanup());
        });
    }

    cleanup() {
        if (this.client) {
            this.client.destroy();
        }
    }

}
