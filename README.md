# mcp-server-google-logging

## 前提

- gcloud cli を使える
- gcloud にログインしている
- IAM で権限がある

## 要求

- yaml で返す -> `--format yaml`
- ログの内容は基本必要最低限。(クエリで調整可能)
  - 内容, リソース名, タイムスタンプ
- 起動時パラメーター
  - プロジェクトID

## ログを取得するための文脈

### 課題

プロジェクトのログに関する情報をどうやって取得するか？
YS4B, 無印、戸建てで文脈が違う。ログの出力方法やドメイン知識が違う
これをどのように反映させるのか？

アイデア

- a. gcloud logging の MCP Server に resource として取得できるようにする
  - この場合、MCP Server として業務知識も持つ前提となってしまう -> OK
  - 内容: DBスキーマ、ログ、クエリのコツについての知識
- b. 別の業務知識を取得するための MCP Server を作成する
  - 疎結合になって嬉しいが、管理が大変かも？

まず、a でやってみる。resource として取得できるようにする。

### resource

- OCPP関連
  - トランザクション、ステータス、接続状態
- サービス関連
  - 予約
  - 利用ログ
  - 管理者

## 制限

- select みたいにフィルタリングできない

## gcloud でできること

### ログ読み取り・表示

- 🔵 **gcloud logging read** - 指定したフィルタ条件に合うログエントリーを読み取るんよ。- リソースタイプ、タイムスタンプ、ログレベル（severity）などを条件にできるし、複雑な条件も AND, OR で組み合わせられるんよ。- 出力形式は JSON やテーブル形式とか、gcloud の標準オプションで変更できるんよ。

### リアルタイムログ監視

- ❌ **gcloud logging tail** - ログが書き込まれるたびにリアルタイムで追いかけることができるんよ。

### ログ一覧の表示・管理

- **gcloud logging logs list** - プロジェクト内の全ログを一覧表示するんよ。
- ❌ **gcloud logging logs delete** - 不要なログを削除する機能もあるんよ。ただし、削除は取り消せんけぇ注意が必要じゃけぇ。

### ログバケットの管理

- **gcloud logging buckets list** - ログを保存するバケットの一覧を表示するんよ。
- **gcloud logging buckets describe / update** - 各バケットの詳細確認や、保持期間などの設定変更が可能なんよ。

### ログシンクの管理

- **gcloud logging sinks list** - ログを自動で Cloud Storage、BigQuery、Pub/Sub など外部の場所にエクスポートする先（シンク）の一覧を表示するんよ。
- **gcloud logging sinks create / update / delete** - 新しいシンクを作ったり、既存のシンクの設定を変更、不要なシンクを削除するんよ。

### ログベースのメトリクス管理

- **gcloud logging metrics list** - ログから作成したメトリクスの一覧を表示するんよ。
- **gcloud logging metrics create / update / delete** - 特定のログ条件に基づいてメトリクスを作成したり、変更、または削除するんよ。- これにより、モニタリングやアラートのトリガーに使えるんよ。

## How to Use

### Running the Server

You can run the server in two ways:

```sh
node -- /path/to/mcp-server-google-logging/dist/index.js --project=<project-id>
```

## 関連

[gcloud CLI を使用したログエントリの書き込みとクエリ
](https://cloud.google.com/logging/docs/write-query-log-entries-gcloud?utm_source=chatgpt.com&hl=ja)

## サンプルプロンプト、メモ

```
ここ2時間で充電があった 充電器ID(chargePointId) と その充電時間をおしえて。
log_biz_dev をつかってログを調べて。まず docsで"OCPP" を確認してから調査して
充電時間は StatusNotification の status が Charging に切り替わり、次のステータスが切り替わるまで。
```
