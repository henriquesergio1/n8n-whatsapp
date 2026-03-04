FROM node:20-bullseye
RUN apt-get update && apt-get install -y --no-install-recommends \
    libnss3 libatk-bridge2.0-0 libdrm2 libxkbcommon0 libgtk-3-0 \
    libgbm1 libasound2 libatspi2.0-0 ca-certificates \
  && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package.json .
RUN npm install --omit=dev
COPY server.js .
RUN mkdir -p /session /data/screenshots
EXPOSE 3001
CMD ["node", "server.js"]
