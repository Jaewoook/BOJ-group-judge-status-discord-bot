import request from "request-promise";

class Auth {
    cookie = "";

    /**
     * currently login method not working because of google recaptcha
     * set OnlineJudge cookie manually using bot's !cookie-set command.
     */
    async login() {
        const login_user_id = process.env.BAEKJOON_ID;
        const login_password = process.env.BAEKJOON_PW;

        const data = {
            login_user_id,
            login_password,
            next: "/",
        };

        try {
            const res = await request.post("https://www.acmicpc.net/signin", {
                simple: false,
                form: data,
                resolveWithFullResponse: true,
            });
            console.log(res);
        } catch (err) {
            console.error(err);
        }
    }

    updateToken(value: string) {
        this.setCookie(`OnlineJudge=${value}`);
    }

    private setCookie(cookie: string) {
        this.cookie = cookie;
    }

}

export const auth = new Auth();
