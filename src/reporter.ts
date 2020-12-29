/**
 * External dependencies
 */
import { Client, MessageEmbed, TextChannel } from "discord.js";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

/**
 * Internal dependencies
 */
import { StatusData, statusParser } from "./status_parser";
import { log } from "./utils";

const REPORTING_CHANNEL_ID = "683591350767452190";
const GUILD_ID = "662479388775809050";
const GROUP_CODE = 7101;

const getUrl = (groupCode: string) => `https://www.acmicpc.net/status?group_id=${groupCode}`;

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
        this.client.on("ready", async () => {
            this.client.user.setActivity("채점 기록 확인");
            const guild = await this.client.guilds.resolve(this.guildId).fetch();
            const channel = guild.channels.resolve(channelId) as TextChannel;
            const msg = await channel.messages.fetch({ limit: 1 });
            const latestTimestamp = new Date (msg.map((m) => m.embeds[0])[0].timestamp).getTime();
            let result = await statusParser.parse();
            result = result.filter((row) => row.timestamp > latestTimestamp);

            const queue = [];

            result.reverse().forEach((row) => {
                queue.push(this.generateReportMessage(row));
            });

            log.verbose("computed result\n", result);
            if (!result.length) {
                process.exit(0);
            }

            queue.forEach(async (message, i) => {
                await channel.send(message);
                log.verbose("message sent!");

                if (i === queue.length - 1) {
                    process.exit(0);
                }
            });
        });

    }

    login() {
        if (!this.token) {
            throw new Error("No Access Token provided");
        }
        this.client.login(this.token);
    }

    generateReportMessage(data: StatusData) {
        return new MessageEmbed()
            .setColor(0x0099ff)
            .setURL(getUrl(this.))
            .addField("👤아이디 ", data.user_id)
            .addField("🔢 문제 번호 ", data.problem.num, true)
            .addField("📝 문제 이름 ", data.problem.name, true)
            .addField("✅ 결과 ", data.result)
            .addField("🕐 채점 시간", format(data.timestamp, "HH시 mm분", { locale: ko }))
            .setTimestamp();
    }

    setStatusData(data: StatusData) {
        this.messages
    }

    notify(groupCode?: string) {

    }

}
