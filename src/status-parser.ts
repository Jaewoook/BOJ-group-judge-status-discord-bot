import cheerio from "cheerio";
import request from "request-promise";
import { log } from "./utils";

export interface StatusData {
    id?: string;
    user_id?: string;
    problem?: {
        num?: string;
        name?: string;
    };
    result?: string;
    timestamp?: number;
}

const PROCESSING_STATE = ["기다리는 중", "재채점을 기다리는 중", "채점 준비 중", "채점 중"];

const getGroupURL = (groupCode: number) => `https://www.acmicpc.net/status?group_id=${groupCode}`;

export class StatusParser {

    private token: string;

    constructor(token: string) {
        this.token = token;
    }

    parse(groupCode: number) {
        return new Promise<StatusData[]>((resolve, reject) => {
            request(getGroupURL(groupCode), {
                headers: { cookie: `OnlineJudge=${this.token}` },
            }).then((response) => {
                const $ = cheerio.load(response);
                //  check session is valid
                if ($(".page-header").length === 0 || $(".loginbar .username").length === 0) {
                    reject(new Error("Invalid token"));
                }

                const result: StatusData[] = [];
                $("#status-table > tbody > tr").each((idx, row) => {
                    const data: StatusData = {};
                    $("td", row).each((idx, col) => {
                        switch (idx) {
                            case 0:
                                data.id = $(col).text();
                                break;
                            case 1:
                                data.user_id = $(col).text();
                                break;
                            case 2:
                                data.problem = {
                                    num: $("a", col).text(),
                                    name: $("a", col).attr("title") || "",
                                };
                                break;
                            case 3:
                                data.result = $(".result-text > span", col).text();
                                break;
                            case 8:
                                data.timestamp = $(col).children().data("timestamp") * 1000;
                                break;
                        }
                    });
                    if (this.validate(data)) {
                        reject(new Error("Status data validation failed"));
                        return;
                    }
                    result.push(data);
                });
                log.verbose("parse result:", JSON.stringify(result, null, 2));

                if (this.hasProcessing(result)) {
                    reject(new Error("Processing submit exists. Try next time."));
                }
                resolve(result);
            }).catch((err) => reject(err));
        });
    }

    validate(data: Object) {
        return !Object.values(data).some((val) => {
            // log.verbose("val: ", val, !!val);
            if (typeof val == "object") {
                return this.validate(val);
            }
            return !val;
        });
    }

    hasProcessing(data: StatusData[]) {
        return data.some((row) => PROCESSING_STATE.includes(row.result));
    }

}
