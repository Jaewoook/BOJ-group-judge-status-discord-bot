import * as Sentry from "@sentry/node";
import { isProduction } from "./utils";

//  Activate Sentry in production
if (isProduction()) {
    Sentry.init({
        dsn: process.env.SENTRY_DSN,

        // We recommend adjusting this value in production, or using tracesSampler
        // for finer control
        tracesSampleRate: 1.0,
      });

      process.on("uncaughtException", (err) => Sentry.captureException(err))
        .on("unhandledRejection", (err) => Sentry.captureException(err));
}
