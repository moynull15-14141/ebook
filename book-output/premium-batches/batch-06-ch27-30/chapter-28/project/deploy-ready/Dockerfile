# syntax=docker/dockerfile:1
# Production-এ Tag-এর বদলে Digest দিয়ে Pin করুন: node:22-alpine@sha256:<digest>
FROM node:22-alpine

ENV NODE_ENV=production
WORKDIR /app

# প্রথমে যা কম বদলায় (package.json), পরে Code: Layer Cache কাজে লাগে।
# এই Project-এ কোনো Runtime Dependency নেই। থাকলে এখানে:
#   COPY package-lock.json ./  এবং  RUN npm ci --omit=dev
COPY --chown=node:node package.json ./
COPY --chown=node:node main.mjs healthcheck.mjs ./
COPY --chown=node:node src ./src

# Root হিসেবে নয়: Image-এ আগে থেকে থাকা 'node' ব্যবহারকারী।
USER node
EXPOSE 3000

HEALTHCHECK --interval=15s --timeout=3s --start-period=5s --retries=3 \
  CMD ["node", "healthcheck.mjs"]

# Exec Form: node নিজেই PID 1, তাই SIGTERM সরাসরি পায়।
# "npm start" ব্যবহার করবেন না; npm Signal ঠিকমতো পৌঁছে দেয় না।
STOPSIGNAL SIGTERM
CMD ["node", "main.mjs"]
