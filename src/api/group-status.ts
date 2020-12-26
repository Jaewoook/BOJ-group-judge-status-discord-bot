import { NowRequest, NowResponse } from "@vercel/node";
import { Reporter, generateReportMessage } from "../reporter";

const handler = (req: NowRequest, res: NowResponse) =>{
    const { token, boj_group_code, discord_guild_id, discord_channel_id } = req.query;
    const reporter = new Reporter(token as string, );
    reporter.login();
};

export default handler;
