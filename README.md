# kibela-api-client

[![npm version](https://img.shields.io/npm/v/kibela-api-client.svg)](https://www.npmjs.com/package/kibela-api-client)
[![npm downloads](https://img.shields.io/npm/dm/kibela-api-client.svg)](https://www.npmjs.com/package/kibela-api-client)
[![npm downloads total](https://img.shields.io/npm/dt/kibela-api-client.svg)](https://www.npmjs.com/package/kibela-api-client)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/kibela-api-client)](https://bundlephobia.com/package/kibela-api-client)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![Node version](https://img.shields.io/node/v/kibela-api-client.svg)](https://nodejs.org)

Kibela API用の非公式TypeScriptクライアントライブラリ（CLI対応）

**注意**: これはKibelaの非公式クライアントライブラリです。Kibela社による公式サポートはありません。

[English Version](./README_EN.md)

## 特徴

- 🚀 **型安全**: 完全なTypeScriptサポートと型定義
- 🔧 **CLIツール**: 一般的な操作のための強力なコマンドラインインターフェース
- 🔐 **セキュア**: 環境変数対応のAPIキー管理
- 📝 **完全なAPIカバレッジ**: ノート、ユーザー、グループなど
- ⚡ **軽量**: 最小限の依存関係、最適化されたバンドルサイズ
- 🌐 **GraphQL**: 直接的なGraphQL API統合

## インストール

```bash
# npm
npm install kibela-api-client

# yarn
yarn add kibela-api-client

# pnpm
pnpm add kibela-api-client

# グローバルCLIインストール
npm install -g kibela-api-client
```

## クイックスタート

### ライブラリとして使用

```typescript
import { createClient } from 'kibela-api-client';

// クライアントインスタンスの作成
const kibela = createClient({
  team: 'your-team-name',
  token: process.env.KIBELA_API_KEY
});

// ノートの作成
const note = await kibela.notes.create({
  title: 'ミーティングノート',
  content: '# 今日のトピック\n\n- プロジェクトの更新\n- 次のステップ',
  coediting: true,
  groupIds: ['<グループID>']
});

// ノートの検索
const results = await kibela.notes.search('プロジェクト更新');

// 現在のユーザー情報の取得
const user = await kibela.users.getCurrentUser();
```

### CLI使用方法

#### 設定

CLIは以下の優先順位で複数の設定方法をサポートしています：

1. 設定ファイル（`~/.kibela/config.json`）
2. 環境変数
3. 現在のディレクトリの`.env`ファイル

```bash
# 対話的セットアップ
kibela config

# 認証情報を直接設定
kibela config --team your-team --token your-api-token

# 環境変数を使用
export KIBELA_TEAM=your-team
export KIBELA_API_KEY=your-api-token

# または.envファイルを使用
echo "KIBELA_TEAM=your-team" >> .env
echo "KIBELA_API_KEY=your-api-token" >> .env
```

#### コマンド

##### ノート管理

```bash
# 最近のノート一覧
kibela notes list

# 特定のグループのノート一覧
kibela notes list --group <グループID>

# グループ内の特定のフォルダのノート一覧
kibela notes list --group <グループID> --folder "<フォルダ名>"

# ノートの検索
kibela notes list --search "キーワード" --limit 20

# グループ内の全フォルダ一覧
kibela notes folders --group <グループID>

# 新規ノートの作成
kibela notes create --title "タイトル" --content "内容" --groups <グループID>

# Markdownファイルからノートを作成
kibela notes create --markdown note.md --groups <グループID>

# 特定のフォルダにノートを作成
kibela notes create --markdown note.md --groups <グループID> --folder "<フォルダ名>"

# 特定のノートを取得
kibela notes get <ノートID>

# ノートの内容をファイルに保存
kibela notes get <ノートID> --output output.md

# Markdownの代わりにHTML内容を表示
kibela notes get <ノートID> --html

# ノートの更新
kibela notes update <ノートID> --title "新しいタイトル" --content "新しい内容"

# Markdownファイルからノートを更新
kibela notes update <ノートID> --markdown updated.md

# ノートの削除
kibela notes delete <ノートID>
```

##### ワークスペース情報

```bash
# 全グループ一覧
kibela groups
kibela groups --all  # ページネーションなしで全グループを表示

# ユーザー一覧
kibela users list
kibela users list --all  # 全ユーザーを表示

# 現在のユーザー情報を取得
kibela users me
```

## APIリファレンス

### クライアント作成

```typescript
const kibela = createClient({
  team: string,    // あなたのKibelaチーム名
  token: string    // あなたのAPIトークン
});
```

### Notes API

```typescript
// ノートの作成
kibela.notes.create({
  title: string,
  content: string,
  coediting?: boolean,
  groupIds?: string[],
  draft?: boolean,
  folders?: Array<{
    groupId: string,
    folderName: string
  }>
})

// ノートの更新
kibela.notes.update(id: string, {
  title?: string,
  content?: string,
  coediting?: boolean,
  groupIds?: string[],
  draft?: boolean
})

// ノートの削除
kibela.notes.delete(id: string)

// IDでノートを取得
kibela.notes.get(id: string)

// ページネーション付きノート一覧
kibela.notes.list({
  first?: number,
  after?: string,
  orderBy?: {
    field: 'CONTENT_UPDATED_AT' | 'PUBLISHED_AT',
    direction: 'ASC' | 'DESC'
  }
})

// ノートの検索
kibela.notes.search(query: string, {
  first?: number,
  after?: string
})
```

### Groups API

```typescript
// グループ一覧
kibela.groups.list({
  first?: number,
  after?: string
})

// IDでグループを取得
kibela.groups.get(id: string)

// 全グループを取得（ページネーションなし）
kibela.groups.getAll()
```

### Users API

```typescript
// ユーザー一覧
kibela.users.list({
  first?: number,
  after?: string
})

// 現在のユーザーを取得
kibela.users.getCurrentUser()

// 全ユーザーを取得（ページネーションなし）
kibela.users.getAll()
```

## 環境変数

- `KIBELA_TEAM`: あなたのKibelaチーム名
- `KIBELA_API_KEY` または `KIBELA_TOKEN`: あなたのAPIトークン

## セキュリティ

- APIトークンはログに記録されたり、完全に表示されることはありません
- トークンはCLI出力でマスクされます（最初の4文字と最後の4文字のみ表示）
- ローカル開発用の`.env`ファイルをサポート
- CLI設定用にユーザーホームディレクトリに安全に保存

## エラーハンドリング

ライブラリは特定のエラーコードと共に詳細なエラーメッセージを提供します：

```typescript
try {
  await kibela.notes.create({ title: '', content: '' });
} catch (error) {
  if (error.code === 'AUTH_ERROR') {
    // 認証エラーの処理
  } else if (error.code === 'VALIDATION_ERROR') {
    // バリデーションエラーの処理
  }
}
```

## 開発

```bash
# 依存関係のインストール
npm install

# プロジェクトのビルド
npm run build

# 開発モードでCLIを実行
npm run dev

# テストの実行
npm test
```

## コントリビュート

コントリビューションを歓迎します！お気軽にプルリクエストを送信してください。

1. リポジトリをフォーク
2. フィーチャーブランチを作成（`git checkout -b feature/amazing-feature`）
3. 変更をコミット（`git commit -m 'Add some amazing feature'`）
4. ブランチにプッシュ（`git push origin feature/amazing-feature`）
5. プルリクエストを開く

## ライセンス

MIT © [Se1ya0hara](https://github.com/Se1ya0hara)