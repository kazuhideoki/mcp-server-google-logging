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
