import { Issuer, Strategy, Client } from 'openid-client';
import passport from "passport";
import {
  Request,
  Response,
} from "express";
import session from "express-session";

import { Settings } from "./settings";


export async function createOIDCClient(settings: Settings) {
  const oidcIssuer = await Issuer.discover(settings.oidc.issuerUrl);

  const client = new oidcIssuer.Client({
    client_id: settings.oidc.clientId,
    client_secret: settings.oidc.clientSecret,
    redirect_uris: [
      settings.oidc.redirectUri
    ],
    response_types: ["code"],
  });

  return {
    client,
    oidcIssuer,
  }
}

export function configurePassport(client: Client, settings: Settings, verifyCache: Map<string, any>) {
  passport.serializeUser(function(user: any, done: any) {
    done(null, user);
  });

  passport.deserializeUser(function(user: any, done: any) {
    done(null, user);
  });

  passport.use("openid-client", new Strategy({
    client,
  }, (tokenset: any, userinfo: any, done: (err: any, user?: any) => void) => {
    verifyCache.set(userinfo.sub, {
      userinfo,
      tokenset,
    });

    return done(null, {
      provider: "openid-client",
      id: userinfo.sub,
      displayName: userinfo.preferred_username,
    });
  }));

  return {
    loginHandler: passport.authenticate("openid-client"),
    cbHandler: passport.authenticate("openid-client", {
      successRedirect: "/",
      failureRedirect: "/"
    }),
    logoutHandler: (req: Request, res: Response) => {
      req.logout();
      res.redirect(client.endSessionUrl({
        post_logout_redirect_uri: settings.oidc.postLogoutRedirectUri,
      }));
    },
    middleware: {
      initialize: passport.initialize(),
      session: passport.session(),
      expressSession: session({
        secret: settings.sessionCookieSecret,
        resave: false,
        saveUninitialized: true,
        cookie: {
          httpOnly: true,
        },
      }),
    },
  };
}
