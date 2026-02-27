# Base App

アイテムの追加と一覧表示ができるシンプルなリストアプリです。
このアプリに機能を追加して、独自のプロダクトに進化させてください。

## セットアップ

```bash
# 依存パッケージのインストール
npm install

# データベースの初期化
npm run db:setup

# サーバー起動
npm start
```

ブラウザで http://localhost:3000 を開いてください。

## 現在の機能

- **Create**: アイテムを追加
- **Read**: アイテム一覧を表示
- **Update**: アイテム名称を編集（一覧に編集ボタンが表示され、変更を行うとDBが更新されます）
- **Delete**: アイテムを削除（チェックボックスで複数選択後、削除ボタンを押すとDBから削除されます）

## ファイル構成

```
team_product/
├── package.json          # プロジェクト設定
├── prisma/
│   └── schema.prisma     # DBスキーマ定義
├── database/             # SQLiteファイル格納
└── src/
    ├── server.js         # サーバー側コード（API）
    └── public/
        ├── index.html    # クライアント側（HTML）
        ├── app.js        # クライアント側（JavaScript）
        └── style.css     # スタイルシート
```

## 3層構造

```
Client (ブラウザ)  →  Server (Node.js)  →  Database (SQLite)
   index.html          server.js             app.db
```

## どこを触る？

| やりたいこと | 触るファイル |
|-------------|-------------|
| 画面の見た目を変える | index.html, style.css |
| ボタンや通信の処理を変える | app.js |
| 新しいAPIを追加する | server.js |
| データの項目を増やす | schema.prisma |
