import { NowRequest, NowResponse } from "@vercel/node";
import * as Sentry from "@sentry/node";

import { Reporter } from "../reporter";
import { StatusData, StatusParser } from "../status-parser";

/**
 * Initialize Sentry and set error handler
 */
import "../sentry";

const handler = async (req: NowRequest, res: NowResponse) =>{
    const { discord_token, boj_token, boj_group_code, discord_channel_id } = req.query;
    const reporter = new Reporter(discord_token as string, discord_channel_id as string);
    const statusParser = new StatusParser(boj_token as string);
    try {
        const result = await Promise.all<StatusData[], void>([
            statusParser.parse(Number.parseInt(boj_group_code as string)),
            reporter.login()
        ]);
        const sentResult = await reporter.notify(result[0]);
        res.json({
            status: "OK",
            data: {
                originals: result[0],
                sent: sentResult,
            },
        });
    } catch (err) {
        Sentry.captureException(err);
        res.status(err.status || 500).json({
            status: err.name || "error",
            error: err.message,
        });
    }
};

export default handler;
