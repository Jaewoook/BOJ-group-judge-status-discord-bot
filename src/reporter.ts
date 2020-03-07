import { Client, MessageEmbed, TextChannel } from "discord.js";
import { statusParser } from "./status_parser";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

const REPORTING_CHANNEL_ID = "683591350767452190";
const GUILD_ID = "662479388775809050";
const GROUP_CODE = 7101;
const GROUP_URL = `https://www.acmicpc.net/status?group_id=${GROUP_CODE}`;

const client = new Client();

client.on("ready", async () => {
    const guild = await client.guilds.resolve(GUILD_ID).fetch();
    const channel = guild.channels.resolve(REPORTING_CHANNEL_ID) as TextChannel;
    const msg = await channel.messages.fetch({ limit: 1 });
    const latestTimestamp = new Date (msg.map((m) => m.embeds[0])[0].timestamp).getTime();
    let result = await statusParser.parse();
    result = result.filter((row) => row.timestamp > latestTimestamp);

    const queue = [];

    result.reverse().forEach((row, i) => {
        queue.push(new MessageEmbed()
            .setColor(0x0099ff)
            .setURL(GROUP_URL)
            .addField("👤아이디 ", row.user_id)
            .addField("🔢 문제 번호 ", row.problem.num, true)
            .addField("📝 문제 이름 ", row.problem.name, true)
            .addField("✅ 결과 ", row.result)
            .addField("🕐 채점 시간", format(row.timestamp, "HH시 mm분", { locale: ko }))
            .setTimestamp()
        );
    });
    console.log("computed result\n", result);
    queue.forEach(async (message) => {
        await channel.send(message);
        console.log("message sent!");
    });
});

client.login(process.env["discord-token"] || "NjgzNTQ2NTUxNDQ4MTA5MTEw.Xltjig.tFP0puGriFIExzC4aVPYeFoeeRc");
