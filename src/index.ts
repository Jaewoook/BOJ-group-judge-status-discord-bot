import Discord from "discord.js";
import { statusParser } from "./status_parser";
import { auth } from "./auth";

const client = new Discord.Client();

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
            case "!채점현황":
                const result = await statusParser.parse();
                let msg = "";
                result.map((row) => {
                    msg += "채점번호: " + row.id + " 아이디: " + row.user_id + " 문제: " + row.problem_num + " 결과: " + row.result + "\n";
                })
                message.reply(`채점현황\n${msg}`);
                break;
        }
    }
});

client.login(process.env["discord-token"] || "NjgzNTQ2NTUxNDQ4MTA5MTEw.Xltjig.tFP0puGriFIExzC4aVPYeFoeeRc");
