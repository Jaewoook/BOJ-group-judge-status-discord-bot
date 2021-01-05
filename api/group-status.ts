import { NowRequest, NowResponse } from "@vercel/node";
import { Reporter } from "../reporter";
import { StatusParser } from "../status-parser";

const handler = async (req: NowRequest, res: NowResponse) =>{
    const { boj_token, boj_group_code, discord_webhook_url } = req.query;
    const reporter = new Reporter();
    const statusParser = new StatusParser(boj_token as string);
    try {
        const result = await statusParser.parse(Number.parseInt(boj_group_code as string));
        if (discord_webhook_url) {
            await reporter.notify(discord_webhook_url as string, result, boj_group_code as string);
        }
        res.json({
            status: "OK",
            judgeStatus: result,
            notified: !!discord_webhook_url,
        });
    } catch (err) {
        res.status(500).json({
            status: "error",
            error: err,
        });
        console.error(err);
    }
};

export default handler;
