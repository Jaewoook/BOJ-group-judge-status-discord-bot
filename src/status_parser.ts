import cheerio from "cheerio";
import request from "request-promise";
import { auth } from "./auth";

const DEFAULT_IDS = [
    "ajw4586",
    "jjh63360",
    "soo7652",
    "rnsdls0823",
];

interface StatusData {
    id?: string;
    user_id?: string;
    problem_num?: string;
    result?: string;
}

class StatusParser {

    async parse() {
        try {
            const res = await request("https://www.acmicpc.net/status?group_id=7101", {
                headers: {
                    cookie: auth.cookie || "OnlineJudge=smsgmds0esh52l206p7r5fkh0q",
                },
            });
            // console.log("result\n\n", res);
            const $ = cheerio.load(res);
            const result: StatusData[] = [];
            $("#status-table > tbody > tr").each((_, row) => {
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
                            data.problem_num = $(col).children("a").text();
                            break;
                        case 3:
                            data.result = $(col).children(".result-text").text();
                            break;
                        case 4:
                            break;
                    }
                });
                result.push(data);
            });
            console.log(result);
            if (result.length !== 0) {
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
