export const getEnv = () => process.env.NODE_ENV;
export const isProduction = () => getEnv() == "production";

export const log = {
    verbose: (...args) => { if (!isProduction()) console.log(...args); },
    error: (...args) => { if (!isProduction()) console.error(...args); },
};
