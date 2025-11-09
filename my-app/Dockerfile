FROM node:18-alpine

WORKDIR /app

# package.jsonとpackage-lock.jsonを先にコピーして依存関係をインストール
COPY package*.json ./
RUN npm install

# 残りのファイルをコピー
COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]