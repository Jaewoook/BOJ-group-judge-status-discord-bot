import { Client, MessageEmbed } from "discord.js";
// import { table } from "table";
import { statusParser } from "./status_parser";
import { auth } from "./auth";

const GROUP_CODE = 7101;
const GROUP_URL = `https://www.acmicpc.net/status?group_id=${GROUP_CODE}`;

const client = new Client();

client.on("ready", () => {
    console.log(`Bot ready to run as ${client.user.tag}`);
});

client.on("message", async (message) => {
    if (message.content.startsWith("!")) {
        switch (message.content) {
            case "!set-cookie":
                auth.updateToken(message.content.split(" ")[1]);
                message.reply("Succeeded to set cookie: " + auth.cookie);
                break;
            case "!ping":
                message.reply("pong!");
                break;
            case "!채점현황": {
                const result = await statusParser.parse();
                let content = new MessageEmbed()
                    .setTitle("채점 현황")
                    .setColor(0x0099ff)
                    .setURL(GROUP_URL);
                result.forEach((row) => {
                    if (content.fields.length > 21) {
                        return;
                    }
                    content = content.addField("아이디", row.user_id, true)
                        .addField("문제 번호", row.problem.num, true)
                        .addField("문제 이름", row.problem.name, true)
                        .addField("결과", row.result, true);
                });
                content = content.setTimestamp();
                message.channel.send(content);
                break;
            }
        }
    }
});


client.login(process.env["discord-token"] || "NjgzNTQ2NTUxNDQ4MTA5MTEw.Xltjig.tFP0puGriFIExzC4aVPYeFoeeRc");
