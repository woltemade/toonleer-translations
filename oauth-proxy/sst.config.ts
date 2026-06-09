/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "toonleerTranslationsOauth",
      removal: input?.stage === "production" ? "retain" : "remove",
      protect: ["production"].includes(input?.stage),
      home: "aws",
      providers: { aws: { region: "us-east-1" } },
    };
  },
  async run() {
    const ALLOWED_ORIGIN =
      process.env.ALLOWED_ORIGIN || "https://woltemade.github.io";

    const clientId = new sst.Secret("GithubClientId");
    const clientSecret = new sst.Secret("GithubClientSecret");

    const exchange = new sst.aws.Function("Exchange", {
      url: {
        cors: {
          allowOrigins: [ALLOWED_ORIGIN],
          allowMethods: ["POST"],
          allowHeaders: ["content-type"],
        },
      },
      link: [clientId, clientSecret],
      environment: { ALLOWED_ORIGIN },
      handler: "src/exchange.handler",
    });

    return { url: exchange.url };
  },
});
