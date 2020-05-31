import * as Server from "./lib/server";
import * as Auth from "./lib/auth";
import { getSettings } from "./lib/settings";

async function main() {
  const settings = getSettings();

  const { client, oidcIssuer } = await Auth.createOIDCClient(settings);
  const verifyCache = new Map<string, any>();
  const authHandlers = Auth.configurePassport(client, settings, verifyCache);
  const app = Server.create({
    passportMiddleware: authHandlers.middleware
  });

  Server.mountRouters(app, {
    "/": Server.createRouter({
      "/": {
        "get": Server.wrapHandler(async (req, res) => {
          const context = {
            hasUser: req.session?.passport?.user != null,
            userName: req.session?.passport?.user?.displayName,
            id: req.session?.passport?.user?.id,
          }

          res.send(`
            ${context.hasUser ? (
              `Hello ${context.userName}`
            ) : (
              `Not authenticated`
            )}
            <ul>
              ${["login", "logout"].map(path => `<li><a href="/auth/${path}">${path}</a></li>`).join("")}
              ${settings.additionalLinks.map(path => `<li><a href="${path}">${path}</a></li>`).join("")}
            </ul>

            ${context.hasUser ? `
              <h3>Claims etc...</h3>
              <pre>${JSON.stringify(verifyCache.get(context.id), null, 2)}
            ` : ""}

            <h3>session and oidc client / issuer metadata</h3>
            <pre>${JSON.stringify({
              passport: req.session?.passport,
              clientMetadata: client.metadata,
              issuerMetadata: oidcIssuer.metadata,
            }, null, 2)}</pre>
          `);
        }),
      },
    }),
    "/auth": Server.createRouter({
      "/login": authHandlers.loginHandler,
      "/logout": authHandlers.logoutHandler,
      "/cb": authHandlers.cbHandler,
    }),
  });

  await Server.listen(app, settings.port);
  console.log(`Server listening on ${settings.port}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
