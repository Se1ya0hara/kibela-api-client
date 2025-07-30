# kibela-api-client

[![npm version](https://img.shields.io/npm/v/kibela-api-client.svg)](https://www.npmjs.com/package/kibela-api-client)
[![npm downloads](https://img.shields.io/npm/dm/kibela-api-client.svg)](https://www.npmjs.com/package/kibela-api-client)
[![npm downloads total](https://img.shields.io/npm/dt/kibela-api-client.svg)](https://www.npmjs.com/package/kibela-api-client)
[![Zero Dependencies](https://img.shields.io/badge/dependencies-0-brightgreen.svg)](https://www.npmjs.com/package/kibela-api-client?activeTab=dependencies)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![Node version](https://img.shields.io/node/v/kibela-api-client.svg)](https://nodejs.org)

Kibela API用の非公式TypeScriptクライアントライブラリ - ゼロ依存、フル機能CLI付き

**注意**: これはKibelaの非公式クライアントライブラリです。Kibelaのサービス提供者による公式サポートはありません。

[English Version](./README_EN.md)

## 特徴

- 🚀 **型安全**: 完全なTypeScriptサポートと型定義
- 🔧 **CLIツール**: 一般的な操作のための強力なコマンドラインインターフェース
- 🔐 **セキュア**: 環境変数対応のAPIキー管理
- 📝 **完全なAPIカバレッジ**: ノート、ユーザー、グループなど
- ⚡ **外部依存ゼロ**: Node.js標準モジュールのみを使用
- 🌐 **GraphQL**: 直接的なGraphQL API統合
- 🔄 **ローカル管理**: ローカルファイルとKibelaの効率的な同期
- 📄 **Frontmatter対応**: YAMLメタデータ付きMarkdownファイルの完全サポート

## インストール

```bash
# npm
npm install -g kibela-api-client

# yarn
yarn global add kibela-api-client

# pnpm
pnpm add -g kibela-api-client

# ローカルプロジェクト
npm install kibela-api-client
```

## クイックスタート

### ライブラリとして使用

```typescript
import { createClient } from 'kibela-api-client';

// クライアントインスタンスの作成
const kibela = createClient({
  team: 'your-team-name',
  token: process.env.KIBELA_TOKEN
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

```bash
# 対話的セットアップ
kibela config

# 直接設定
kibela config --team your-team --token your-api-token

# 環境変数で設定
export KIBELA_TEAM=your-team
export KIBELA_TOKEN=your-api-token
```

#### 基本コマンド

```bash
# 全ノートの取得
kibela all                    # ローカルにダウンロード
kibela all --list             # 一覧表示のみ
kibela all -l 20              # 20件のみ

# 特定ノートの取得
kibela get <ノートID>         # ID指定（タイトルがファイル名に）
kibela get <ID> --frontmatter # フロントマター付きで保存
kibela get --group <ID>       # グループ指定

# ノートの更新
kibela set notes/123.md       # ファイルから更新
kibela set --id <ID> --title "新タイトル"

# ノートの新規作成  
kibela new                    # 対話的に作成
kibela new --file note.md     # ファイルから作成
kibela new --title "タイトル" --content "内容"
```

# シンプルなコマンド体系
kibela all                    # 全ノートをローカルにダウンロード
kibela get --search "検索"   # ノートを検索・取得
kibela set notes/123.md       # 既存ノートを更新
kibela new --file note.md     # 新規ノートを作成

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
- `KIBELA_TOKEN`: あなたのAPIトークン

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

## 制限事項

- **検索機能**: Kibela APIの制限により、検索機能（`--search`）は現在利用できません
  - 代替方法: `kibela all --list | grep "検索語"` または グループ指定での取得

## 外部依存ゼロの実装

このライブラリは外部依存を一切使用せず、Node.js標準モジュールのみで実装されています：

- HTTPクライアント: Node.js標準の`https`モジュール
- CLIフレームワーク: 自前実装
- ターミナル装飾: ANSIエスケープコード直接使用
- バリデーション: 軽量な自前実装
- 環境変数: `process.env`直接使用

これにより、セキュリティリスクを最小化し、バンドルサイズを削減しています。

## シンプルなコマンド体系

直感的な4つのコマンドでKibelaを操作：

- **all**: 全ノートの一括取得・ダウンロード
- **get**: 特定ノートの取得・検索
- **set**: 既存ノートの更新
- **new**: 新規ノートの作成

各コマンドは`--dir`オプションでローカルファイル管理もサポートします。

詳細な使用方法は[USAGE.md](./USAGE.md)をご覧ください。

## コントリビュート

コントリビューションを歓迎します！お気軽にプルリクエストを送信してください。

1. リポジトリをフォーク
2. フィーチャーブランチを作成（`git checkout -b feature/amazing-feature`）
3. 変更をコミット（`git commit -m 'Add some amazing feature'`）
4. ブランチにプッシュ（`git push origin feature/amazing-feature`）
5. プルリクエストを開く

## ライセンス

MIT © [Se1ya0hara](https://github.com/Se1ya0hara)