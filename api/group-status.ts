import { NowRequest, NowResponse } from "@vercel/node";
import { Reporter } from "../reporter";
import { StatusData, StatusParser } from "../status-parser";

const handler = async (req: NowRequest, res: NowResponse) =>{
    const { discord_token, boj_token, boj_group_code, discord_guild_id, discord_channel_id } = req.query;
    const reporter = new Reporter(discord_token as string, discord_guild_id as string, discord_channel_id as string);
    const statusParser = new StatusParser(boj_token as string);
    try {
        const result = await Promise.all<StatusData[], void>([
            statusParser.parse(Number.parseInt(boj_group_code as string)),
            reporter.login()
        ]);
        await reporter.notify(result[0], boj_group_code as string);
        res.json(result[0]);
    } catch (err) {
        res.status(500).json({
            status: "error",
            error: err,
        });
        throw err;
    }
};

export default handler;
