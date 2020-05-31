import express, {
  Express,
  IRoute,
  NextFunction,
  Request,
  Response,
  RequestHandler,
  Router,
} from "express";
import morgan from "morgan";
import bodyParser from "body-parser";

export type RouteMap = Record<string, {
  [key in keyof IRoute]?: RequestHandler;
} | RequestHandler>
export type RouterMap = Record<string, Router>;
export type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<AsyncResponse>
export type AsyncResponse = void | {
  status: number;
  body: any;
};

export interface ICreateOptions {
  passportMiddleware: {
    initialize: RequestHandler;
    session: RequestHandler;
    expressSession: RequestHandler;
  };
}

export {
  Request,
  Response,
}

export function create({
  passportMiddleware,
}: ICreateOptions) {
  const app = express();
  app.use(morgan("dev"));
  app.set("x-powered-by", false);

  app.use(passportMiddleware.expressSession);

  app.use(bodyParser.json({
    limit: "100kb",
  }));

  bodyParser.urlencoded({
    extended: true,
    limit: "100kb",
  });

  app.use(passportMiddleware.initialize);
  app.use(passportMiddleware.session);

  return app;
}

export async function listen(app: Express, port: number) {
  app.use(handle404);
  app.use(handleError);

  await new Promise((resolve, reject) => {
    app.listen(port, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    })
  });
}

export function createRouter(routeMap: RouteMap) {
  const router = Router();
  const routes = Object.keys(routeMap);

  for (const route of routes) {
    const handlerMap = routeMap[route];

    if (typeof handlerMap === "function") {
      router.use(route, handlerMap);
    } else {
      const verbs = Object.keys(handlerMap) as Array<keyof IRoute>;
      const routeHandler = router.route(route);


      for (const verb of verbs) {
        const verbHandler = handlerMap[verb];
        routeHandler[verb](verbHandler);
      }
    }
  }

  return router;
}

export function mountRouters(app: Express, routerMap: RouterMap) {
  const routes = Object.keys(routerMap);
  for (const route of routes) {
    app.use(route, routerMap[route]);
  }
}

export function mountMiddlewares(app: Express, middlewares: Array<RequestHandler>) {
  for (const middleware of middlewares) {
    app.use(middleware);
  }
}

export function wrapHandler(handler: AsyncHandler) {
  return (req: Request, res: Response, next: NextFunction) => {
    handler(req, res, next)
      .then(response => {
        // if nothing is returned we assume the response has already been sent
        if (response == null) {
          return;
        }

        res.status(response.status).send(response.body);
      })
      .catch(err => {
        handleError(err, req, res);
      });
  }
}

function handle404(_req: Request, res: Response) {
  res.status(404).send("Not found");
}

function handleError(err: any, _req: Request, res: Response, _next?: NextFunction) {
  console.error("500!");
  console.error(err);

  res.status(500).send("Internal server error");
}
