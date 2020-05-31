import convict from "convict";
convict.addFormats(require('convict-format-with-validator'));

export type Settings = ReturnType<typeof getSettings>;

export function getSettings() {
  const config = convict({
    oidc: {
      clientId: {
        doc: "OIDC Client ID",
        default: "test",
        format: String,
        arg: "oidc-client-id",
        env: "OIDC_CLIENT_ID",
      },
      clientSecret: {
        doc: "OIDC Client Secret",
        default: "",
        format: String,
        arg: "oidc-client-secret",
        env: "OIDC_CLIENT_SECRET",
        sensitive: true,
      },
      issuerUrl: {
        doc: "OIDC Issuer URL",
        default: "https://keycloak.workslave.hq.erdii.online/auth/realms/werise-sandbox",
        format: "url",
        arg: "oidc-issuer-url",
        env: "OIDC_ISSUER_URL",

      },
      redirectUri: {
        doc: "OIDC Redirect Uri",
        default: "http://localhost:3000/auth/cb",
        format: "url",
        arg: "oidc-redirect-uri",
        env: "OIDC_REDIRECT_URI",
      },
      postLogoutRedirectUri: {
        doc: "OIDC Post Logout Redirect Uri",
        default: "http://localhost:3000/",
        format: "url",
        arg: "oidc-post-logout-redirect-uri",
        env: "OIDC_POST_LOGOUT_REDIRECT_URI",
      },
    },
    sessionCookieSecret: {
      doc: "Secret used for signing cookies",
      default: "null",
      format: String,
      sensitive: true,
      arg: "session-cookie-secret",
      env: "SESSION_COOKIE_SECRET",
    },
    port: {
      doc: "http server port",
      default: 3000,
      format: "port",
      arg: "port",
      env: "PORT",
    },
    additionalLinks: {
      doc: "additional links in landing page",
      default: [
        "https://riot.k8s.erdii.online/",
        "https://keycloak.workslave.hq.erdii.online/auth/realms/werise-sandbox/account",
      ],
    }
  });

  console.log(config.toString());

  return config.get();
}
