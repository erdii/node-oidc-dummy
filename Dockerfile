FROM node:12.17-slim as builder
WORKDIR /pkg

ADD package.json package-lock.json tsconfig.json /pkg/
RUN npm ci
ADD ./src /pkg/src
RUN npm run build
RUN rm -rf node_modules
ENV NODE_ENV=production
RUN npm ci --only=production

FROM node:12.17-slim
WORKDIR /pkg

ENV NODE_ENV=production

COPY --from=builder --chown=root:root /pkg/.build /pkg
COPY --from=builder --chown=root:root /pkg/node_modules /pkg/node_modules
ADD package.json package-lock.json tsconfig.json README.md /pkg/

RUN groupadd -g 999 appuser && \
  useradd -r -u 999 -g appuser appuser
USER appuser

ENTRYPOINT [ "/usr/bin/env", "node", "index.js" ]
