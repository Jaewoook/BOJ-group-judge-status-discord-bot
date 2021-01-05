/**
 * External dependencies
 */
import request from "request-promise";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

/**
 * Internal dependencies
 */
import { StatusData } from "./status-parser";
import { log } from "./utils";

const getUrl = (groupCode: string) => `https://www.acmicpc.net/status?group_id=${groupCode}`;

export class Reporter {

    generateReportMessage(data: StatusData, groupCode: string) {
        return {
            type: "rich",
            title: "BOJ 채점현황",
            url: getUrl(groupCode),
            timestamp: new Date().toISOString(),
            color: 39423,
            fields: [
                {
                    name: "👤 아이디 ",
                    value: data.user_id,
                },
                {
                    name: "🔢 문제 번호 ",
                    value: data.problem.num,
                    inline: true,
                },
                {
                    name: "📝 문제 이름 ",
                    value: data.problem.name,
                    inline: true,
                },
                {
                    name: "✅ 결과 ",
                    value: data.result,
                },
                {
                    name: "🕐 채점 시간",
                    value: format(data.timestamp, "HH시 mm분", { locale: ko }),
                }
            ],
        };
    }

    async notify(webhookUrl: string, statusData: StatusData[], groupCode: string) {
        if (!statusData.length) {
            log.error("No status data to send");
            throw new Error("No status data to send");
        }
        log.verbose("status data\n", statusData);

        const queue = statusData.reverse().map((row) => this.generateReportMessage(row, groupCode));
        await Promise.all(queue.map(async (message) => {
            return request.post(webhookUrl, {
                json: true,
                body: {
                    embeds: [message],
                }
            });
        }));
        log.verbose("message sent!");
    }

}
