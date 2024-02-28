// const Sentry = require("@sentry/node");
// const { ProfilingIntegration } = require("@sentry/profiling-node");

// Sentry.init({
//   dsn: "https://2f3a6a8492c960ac39228b737fa19ff1@o4505935640395776.ingest.sentry.io/4505935646097408",
//   integrations: [new Sentry.Integrations.Http({ tracing: true }), new Sentry.Integrations.Express({ app }), new ProfilingIntegration()],
//   tracesSampleRate: 1.0,
//   profilesSampleRate: 1.0,
// });

// app.use(Sentry.Handlers.requestHandler());
// app.use(Sentry.Handlers.tracingHandler());

// app.use(Sentry.Handlers.errorHandler());
