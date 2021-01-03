/**
 * External dependencies
 */
import { Client, MessageEmbed, TextChannel } from "discord.js";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { EventEmitter } from "events";

/**
 * Internal dependencies
 */
import { StatusData } from "./status_parser";
import { log } from "./utils";

const getUrl = (groupCode: string) => `https://www.acmicpc.net/status?group_id=${groupCode}`;

export class Reporter extends EventEmitter {

    client: Client;
    token: string;
    guildId: string;
    channelId: string;

    constructor(token: string, guildId: string, channelId: string) {
        super();
        this.token = token;
        this.guildId = guildId;
        this.channelId = channelId;
        this.client = new Client();
        this.client.on("ready", this.handleClicentReady);
    }

    async handleClicentReady() {
        this.emit("onLoginSuccess");
        this.client.user.setActivity("채점 기록 확인");
    }

    login() {
        if (!this.token) {
            throw new Error("No Access Token provided");
        }
        this.client.login(this.token);
    }

    generateReportMessage(data: StatusData, groupCode: string) {
        return new MessageEmbed()
            .setColor(0x0099ff)
            .setURL(getUrl(getUrl(groupCode)))
            .addField("👤아이디 ", data.user_id)
            .addField("🔢 문제 번호 ", data.problem.num, true)
            .addField("📝 문제 이름 ", data.problem.name, true)
            .addField("✅ 결과 ", data.result)
            .addField("🕐 채점 시간", format(data.timestamp, "HH시 mm분", { locale: ko }))
            .setTimestamp();
    }

    async notify(statusData: StatusData[], groupCode: string) {
        //  fetch target information
        const guild = await this.client.guilds.resolve(this.guildId).fetch();
        const channel = guild.channels.resolve(this.channelId) as TextChannel;
        const msg = await channel.messages.fetch({ limit: 1 });
        const latestTimestamp = new Date (msg.map((m) => m.embeds[0])[0].timestamp).getTime();

        statusData = statusData.filter((row) => row.timestamp > latestTimestamp);
        if (!statusData.length) {
            //  TODO throw error
            log.error("No status data to send");
            return;
        }
        log.verbose("status data\n", statusData);

        const queue = statusData.reverse().map((row) => this.generateReportMessage(row, groupCode));
        queue.forEach(async (message) => {
            await channel.send(message);
            log.verbose("message sent!");
        });
    }

}
