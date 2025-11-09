FROM node:18-alpine

WORKDIR /app

# package.jsonとpackage-lock.jsonを先にコピーして依存関係をインストール
COPY my-app/package*.json ./
RUN npm install

# Prismaスキーマと設定ファイルをコピー
COPY prisma ./prisma
COPY prisma.config.ts ./

# Prisma Clientを生成（DATABASE_URLはダミー値でOK、実際にはDB接続しない）
RUN DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" npx prisma generate

# アプリケーションのファイルをコピー
COPY my-app/ ./

EXPOSE 3000

CMD ["npm", "run", "dev"]