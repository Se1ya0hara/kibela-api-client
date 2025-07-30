# kibela-api-client 使い方ガイド

## 目次
1. [インストール](#インストール)
2. [初期設定](#初期設定)
3. [基本コマンド](#基本コマンド)
4. [プログラマティックな使用](#プログラマティックな使用)

## インストール

```bash
# npm を使用
npm install -g kibela-api-client

# yarn を使用
yarn global add kibela-api-client

# ローカルプロジェクトでの使用
npm install kibela-api-client
```

## 初期設定

### 対話的セットアップ
```bash
kibela config
```
プロンプトに従って、チーム名とAPIトークンを入力します。

### コマンドラインでの設定
```bash
kibela config --team your-team-name --token your-api-token
```

### 環境変数での設定
```bash
export KIBELA_TEAM=your-team-name
export KIBELA_TOKEN=your-api-token
```

### .envファイルでの設定
プロジェクトルートに`.env`ファイルを作成：
```
KIBELA_TEAM=your-team-name
KIBELA_TOKEN=your-api-token
```

## 基本コマンド

### 全ノートの取得 (`all`)

```bash
# 全ノートを一覧表示（ダウンロードなし）
kibela all --list

# 20件のみ表示
kibela all --list -l 20

# 全ノートをローカルにダウンロード（デフォルト）
kibela all

# カスタムディレクトリにダウンロード
kibela all -d ./my-notes

# 特定グループのノートのみダウンロード
kibela all --group <グループID>

# 特定グループのノートを一覧表示
kibela all --group <グループID> --list
```

### 特定ノートの取得 (`get`)

```bash
# IDでノートを取得
kibela get --id <ノートID>
kibela get <ノートID>  # IDを引数で直接指定も可

# ファイルに保存（タイトルがファイル名になります）
kibela get <ノートID> -d ./notes
kibela get <ノートID> --output custom-name.md

# フロントマター付きで保存
kibela get <ノートID> -d ./notes --frontmatter

# HTML形式で取得
kibela get <ノートID> --html

# 特定グループのノートを取得
kibela get --group <グループID>
kibela get --group <グループID> -d ./group-notes
kibela get --group <グループID> -d ./notes --frontmatter

# 検索機能について
# 注意: Kibela APIの制限により検索機能は現在利用できません
# 代替方法:
# - kibela all --list | grep "検索語"
# - kibela get --group <グループID> でグループ内のノートを取得
```

### ノートの更新 (`set`)

```bash
# フロントマター付きファイルから更新
kibela set notes/123.md

# ID指定で更新
kibela set --id <ノートID> --title "新タイトル"
kibela set --id <ノートID> --content "新しい内容"

# 下書きに設定
kibela set notes/123.md --draft

# 公開設定
kibela set --id <ノートID> --publish
```

### 新規ノートの作成 (`new`)

```bash
# インタラクティブに作成
kibela new

# コマンドラインから作成
kibela new --title "タイトル" --content "内容"

# Markdownファイルから作成
kibela new --file note.md

# グループとフォルダを指定
kibela new --file note.md --groups <グループID> --folder "企画書"

# 作成後ローカルに保存
kibela new --title "タイトル" --content "内容" --dir ./notes

# 下書きとして作成
kibela new --file note.md --draft
```

### ユーティリティコマンド

```bash
# グループ一覧
kibela groups
kibela groups --all  # 全グループ表示

# ユーザー一覧
kibela users
kibela users --all  # 全ユーザー表示

# 現在のユーザー情報
kibela users me
```

## フロントマター形式

### 保存時のフロントマター（`--frontmatter`オプション）

`get`コマンドで`--frontmatter`オプションを使用すると、ノートの先頭に以下のようなメタデータが付加されます：

```yaml
---
id: "QmxvZy8x"
title: "ノートのタイトル"
coediting: true
published: true
groups:
  - グループID1
  - グループID2
folders:
  - groupId: グループID1, folderName: フォルダ名
author: "username"
createdAt: "2024-01-01T00:00:00Z"
updatedAt: "2024-01-02T00:00:00Z"
url: "https://your-team.kibe.la/notes/12345"
---
```

### 更新時のフロントマター

`set`コマンドでファイルから更新する場合、以下のようなYAMLフロントマターが必要です：

```markdown
---
id: Note/12345
title: ノートのタイトル
coediting: true
published: true
groups:
  - グループID1
  - グループID2
folders:
  - groupId: グループID1
    folderName: フォルダ名
author: username
createdAt: 2024-01-01T00:00:00Z
updatedAt: 2024-01-02T00:00:00Z
url: https://your-team.kibe.la/notes/12345
---

# ノートの内容

ここに本文を記述します。
```

## プログラマティックな使用

### TypeScript/JavaScript

```typescript
import { createClient } from 'kibela-api-client';

// クライアントの初期化
const kibela = createClient({
  team: 'your-team',
  token: process.env.KIBELA_TOKEN
});

// ノートの作成
const note = await kibela.notes.create({
  title: '会議メモ',
  content: '# 議題\n\n- 進捗確認\n- 次のステップ',
  coediting: true,
  groupIds: ['グループID']
});

// ノートの検索
const results = await kibela.notes.search('重要');

// ユーザー情報の取得
const user = await kibela.users.getCurrentUser();
```

### エラーハンドリング

```typescript
try {
  await kibela.notes.create({ title: '', content: '' });
} catch (error) {
  if (error.code === 'VALIDATION_ERROR') {
    console.error('入力値が不正です');
  }
}
```

## 設定ファイルの場所

設定は以下の優先順位で読み込まれます：

1. `~/.kibela/config.json` - ユーザー設定ファイル
2. 環境変数 (`KIBELA_TEAM`, `KIBELA_TOKEN`)
3. カレントディレクトリの `.env` ファイル

## トラブルシューティング

### 認証エラーが発生する場合
```bash
# 設定を確認
kibela config --show

# 設定をやり直す
kibela config
```

### ネットワークエラーが発生する場合
- インターネット接続を確認
- チーム名が正しいか確認（`https://<team-name>.kibe.la`）
- プロキシ環境の場合は適切な環境変数を設定

## ファイル保存について

### ファイル名の自動生成
`get`コマンドでノートを保存する際、デフォルトではノートのタイトルがファイル名になります：
- スペースは`_`に変換
- 特殊文字（`/`, `:`, `*`など）は`-`に変換
- `.md`拡張子が既にタイトルに含まれている場合は重複しません
- 最大200文字に制限されます

例：
- タイトル「プロジェクト計画書」→ `プロジェクト計画書.md`
- タイトル「2024/01/01 議事録」→ `2024-01-01_議事録.md`
- タイトル「README.md」→ `README.md`（重複しない）

## セキュリティに関する注意

- APIトークンは安全に管理してください
- `.env`ファイルは`.gitignore`に追加することを推奨
- トークンは出力時にマスクされます（最初と最後の4文字のみ表示）

## 外部依存ゼロの特徴

このツールは外部のnpmパッケージに依存せず、Node.js標準モジュールのみで実装されています。これにより：
- セキュリティリスクの最小化
- 依存関係の更新に伴う問題の回避
- より高速なインストール
- より小さなパッケージサイズ

を実現しています。