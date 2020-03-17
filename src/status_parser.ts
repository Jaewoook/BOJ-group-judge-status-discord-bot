import cheerio from "cheerio";
import request from "request-promise";
import { auth } from "./auth";

const DEFAULT_IDS = [
    "ajw4586",
    "jjh63360",
    "soo7652",
    "rnsdls0823",
    "taim1101",
    "98lim51",
    "leey0818",
];

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

class StatusParser {

    async parse() {
        try {
            const res = await request("https://www.acmicpc.net/status?group_id=7101", {
                headers: {
                    cookie: auth.cookie || "OnlineJudge=tin7nd4r64p79emrimcsrkqhto",
                },
            });
            // console.log("result\n\n", res);
            const $ = cheerio.load(res);

            //  check session is valid
            if ($(".page-header").length == 0) {
                console.log("session expired");
                return [];
            }

            const result: StatusData[] = [];
            $("#status-table > tbody > tr").each((idx, row) => {
                const data: StatusData = {};
                row.children.forEach((col, idx) => {
                    switch (idx) {
                        case 0:
                            data.id = $(col).text();
                            break;
                        case 1:
                            data.user_id = $(col).text();
                            break;
                        case 2:
                            data.problem = {
                                num: $(col).children("a").text(),
                                name: $(col).children().attr("title"),
                            };
                            break;
                        case 3:
                            data.result = $(col).children(".result-text").text();
                            break;
                        case 8:
                            data.timestamp = $(col).children().data("timestamp") * 1000;
                            break;
                    }
                });
                result.push(data);
            });
            console.log("parse result: ", JSON.stringify(result));

            if (result.length > 0) {
                return this.validateData(result) > 0 ? result : [];
            } else {
                return [];
            }
        } catch (err) {
            console.error(err);
        }
    }

    validateData(data: StatusData[]) {
        return data.map((row) => row.user_id).filter((id) => DEFAULT_IDS.includes(id)).length;
    }

}

export const statusParser = new StatusParser();
// statusParser.parse();
