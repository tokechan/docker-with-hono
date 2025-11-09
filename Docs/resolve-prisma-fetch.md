# Prisma 導入後に発生した `Failed to fetch` の解消記録

## 1. 何が起きていたか
- ブラウザ（http://localhost:5173）で Todo を取得するたびに `TypeError: Failed to fetch` が表示。
- `docker compose ps` では API コンテナが落ちており、`docker compose logs api` に `sh: prisma: not found` が繰り返し出力されていた。
- その後も Prisma CLI 実行エラー、esbuild のプラットフォーム不一致、`prisma/schema.prisma` を参照できないなど複数の問題が連鎖していた。

## 2. 主な原因
1. **Prisma CLI 未インストール**: `my-app/node_modules` がホスト側と共有されておらず、コンテナ内で `prisma` コマンドが見つからない。
2. **`.env` が自動読込されていなかった**: `prisma.config.ts` で `env("DATABASE_URL")` を参照しているが、`dotenv` を読み込んでいなかったため CLI 実行時に環境変数エラー。
3. **ボリュームの競合**: `./prisma` を `/prisma` にマウントした結果、Dockerfile で生成した Prisma Client が起動時に見失われた。
4. **プラットフォーム違いの node_modules**: macOS で生成した `node_modules` をそのまま Linux コンテナにマウントし、`esbuild` バイナリが動作しない。
5. **Prisma スキーマパスの不一致**: スクリプトが絶対パス `/prisma/...` を参照しており、ホスト/コンテナで整合が取れていなかった。

## 3. 実際に行った修正
- `prisma.config.ts` に `import "dotenv/config";` を追加し、CLI 実行時に `.env` が読み込まれるように変更。
- `my-app/package.json` の `prisma:generate` を `prisma generate --schema=./prisma/schema.prisma` に変更し、ホストでもコンテナでも同じ相対パスを参照。
- `docker-compose.yml`
  - `client`/`api` に `- /app/node_modules` の匿名ボリュームを付与し、各コンテナが自前で依存を持つ構成に戻した。
  - `./prisma` を `/app/prisma` にマウントし、アプリケーションパスと揃えた。
  - `api` サービスの起動コマンドを `sh -c "npm install && npm run dev"` に変更し、マウントによって空になった `node_modules` に対して起動時に依存を再インストールするようにした。
- `docker compose up -d --build` で再ビルドし、`docker compose logs -f api` で `Server is running on http://localhost:3000` を確認。

## 4. Prisma 導入時の注意点・原理
1. **環境変数の読み込み**: Prisma CLI は自動で `.env` を読まない場合がある。`dotenv/config` を明示的に読み込むか、コマンド前に `DATABASE_URL=...` を渡す。
2. **パスの一貫性**: Prisma スキーマや設定ファイルへのパスはホストとコンテナ両方で解決できる相対パスを用いる。絶対パスはコンテナ構成変更に弱い。
3. **node_modules の扱い**: プラットフォームをまたぐ場合は `node_modules` をコピーせず、各環境で `npm install`/`npm ci` を実行。Docker では `anonymous volume` を使うか、`RUN npm install` でイメージ内に閉じ込める。
4. **Docker + Prisma の連携**: Prisma Client を Dockerfile の build 時に生成する場合でも、起動後にマウントで上書きしないよう注意。どうしてもマウントが必要なときは起動時に `prisma generate` を再実行するフローを組み込む。
5. **DB 初期化と待機**: Postgres など外部 DB を `depends_on` + healthcheck で待ち、起動直後に `initializeDatabase()` でテーブル作成を行うと、フロントの `fetch` 失敗を未然に防げる。

## 5. 再発防止チェックリスト
- [ ] `docker compose logs api` で Prisma/依存関連のエラーがないことを確認。
- [ ] `npx prisma generate` が単体で成功する。
- [ ] `curl http://localhost:3000/todos` で JSON が返る。
- [ ] `npm install` を行った後は、必ず Docker イメージを再ビルドする。
- [ ] 新たにライブラリを追加したら、`node_modules` をコンテナ内で再インストールする仕組みがあるか確認する。

この記録を参考に Prisma 導入時のセットアップ手順を標準化すると、同種のトラブルを避けられます。
