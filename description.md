# Kibela API Client - 詳細な使い方ガイド

## 概要

`kibela-api-client` は、Kibela の GraphQL API を簡単に利用できる Node.js ライブラリと CLI ツールです。

## インストール

```bash
npm install -g kibela-api-client
```

## 初期設定

### 方法1: 環境変数（.env ファイル）

プロジェクトのルートディレクトリに `.env` ファイルを作成：

```env
KIBELA_API_KEY=your-api-key-here
KIBELA_TEAM=your-team-name
```

### 方法2: CLI 設定コマンド

```bash
# API キーとチーム名を設定
kibela config set

# 現在の設定を確認
kibela config view

# 設定をクリア
kibela config clear
```

### 方法3: 環境変数を直接設定

```bash
export KIBELA_API_KEY=your-api-key-here
export KIBELA_TEAM=your-team-name
```

## CLI コマンド詳細

### ノート管理

#### ノート一覧の取得

```bash
# 最新のノート一覧（デフォルト10件）
kibela notes list

# 件数を指定
kibela notes list --limit 20

# 特定のグループのノート一覧
kibela notes list --group R3JvdXAvMg

# 特定のフォルダ内のノート一覧
# 注意: --folder は --group と一緒に使用する必要があります
kibela notes list --group R3JvdXAvMg --folder "specs"

# キーワード検索
kibela notes list --search "API設計"
```

#### ノートの作成

```bash
# 基本的な作成（タイトルと内容を直接指定）
kibela notes create --title "会議メモ" --content "本日の議題..." --groups R3JvdXAvMg

# マークダウンファイルから作成
kibela notes create --markdown meeting-notes.md --groups R3JvdXAvMg

# 特定のフォルダに作成
kibela notes create --markdown spec.md --groups R3JvdXAvMg --folder "仕様書"

# 共同編集を有効にして作成
kibela notes create --title "共同作業文書" --content "内容" --groups R3JvdXAvMg --coediting

# 下書きとして保存
kibela notes create --title "下書き" --content "内容" --groups R3JvdXAvMg --draft
```

**マークダウンファイルの仕様:**
- ファイルの最初の `# 見出し` がタイトルとして自動的に使用されます
- `--title` オプションを指定した場合は、そちらが優先されます

#### ノートの取得と保存

```bash
# ノートの内容を表示
kibela notes get QmxvZy8x

# ノートをマークダウンファイルとして保存
kibela notes get QmxvZy8x --output my-note.md

# HTML形式で表示（マークダウンではなく）
kibela notes get QmxvZy8x --html
```

#### ノートの更新

```bash
# タイトルを更新
kibela notes update QmxvZy8x --title "新しいタイトル"

# 内容を更新
kibela notes update QmxvZy8x --content "更新された内容"

# マークダウンファイルから更新
kibela notes update QmxvZy8x --markdown updated-content.md

# タイトルと内容を同時に更新
kibela notes update QmxvZy8x --title "新タイトル" --content "新内容"
```

#### ノートの削除

```bash
# 確認プロンプト付きで削除
kibela notes delete QmxvZy8x

# 確認なしで削除（注意！）
kibela notes delete QmxvZy8x --force
```

### フォルダ管理

```bash
# グループ内のすべてのフォルダを一覧表示
kibela notes folders --group R3JvdXAvMg
```

このコマンドは以下の情報を表示します：
- フォルダ名
- 各フォルダ内のノート数
- ノート数の多い順にソート

### グループ管理

```bash
# グループ一覧（ページネーション付き）
kibela groups

# すべてのグループを表示
kibela groups --all
```

### ユーザー管理

```bash
# ユーザー一覧
kibela users list

# すべてのユーザーを表示
kibela users list --all

# 現在のユーザー情報
kibela users me
```

## プログラマティックな使用方法

### TypeScript/JavaScript での利用

```typescript
import { createClient } from 'kibela-api-client';

// クライアントの作成
const kibela = createClient({
  team: 'your-team-name',
  token: 'your-api-token'
});

// ノートの作成例
async function createNote() {
  const note = await kibela.notes.create({
    title: 'API経由で作成',
    content: '# 見出し\n\n本文...',
    groupIds: ['R3JvdXAvMg'],
    folders: [{
      groupId: 'R3JvdXAvMg',
      folderName: 'API仕様'
    }]
  });
  
  console.log('作成されたノート:', note.url);
}

// フォルダ内のノート取得（ページネーション対応）
async function getNotesInFolder() {
  const result = await kibela.notes.listByGroup('R3JvdXAvMg', {
    first: 10,
    lightweight: true // クエリコストを削減
  });
  
  // フォルダでフィルタリング（クライアント側）
  const specNotes = result.notes.nodes.filter(note =>
    note.folders?.edges.some(edge => edge.node.name === 'specs')
  );
  
  return specNotes;
}

// すべてのフォルダを取得
async function getAllFolders() {
  const folders = await kibela.folders.listAll();
  console.log('フォルダ一覧:', folders);
}
```

## Tips とベストプラクティス

### 1. GraphQL クエリコストの管理

Kibela API には1リクエストあたり最大10,000のコスト制限があります。大量のデータを取得する場合は：

- `lightweight: true` オプションを使用
- ページサイズを小さく（10-20件）設定
- 必要なフィールドのみ取得

### 2. フォルダの使い方

- フォルダはグループに紐づいています
- ノート作成時は `--groups` と `--folder` を一緒に指定
- フォルダによるフィルタリングはクライアント側で実行されます

### 3. Relay ID について

Kibela は GraphQL Relay 仕様の ID を使用しています：
- 例: `R3JvdXAvMg` = Base64エンコードされた `Group/2`
- CLI では自動的に処理されるので意識する必要はありません

### 4. エラーハンドリング

```typescript
try {
  const note = await kibela.notes.get('invalid-id');
} catch (error) {
  if (error.code === 'NOT_FOUND') {
    console.log('ノートが見つかりません');
  } else if (error.code === 'REQUEST_LIMIT_EXCEEDED') {
    console.log('クエリコストが制限を超えました');
  }
}
```

## トラブルシューティング

### よくあるエラーと対処法

1. **認証エラー**
   ```
   ✖ Configuration error: API token is required
   ```
   → `.env` ファイルまたは `kibela config set` で設定を確認

2. **クエリコスト超過**
   ```
   Query has cost of 22904, which exceeds max cost per-request of 10000
   ```
   → より少ないデータを取得するか、`lightweight` オプションを使用

3. **フォルダ指定エラー**
   ```
   The --folder option requires --groups to be specified
   ```
   → `--groups` オプションも一緒に指定

## 更新履歴

最新の更新情報は [CHANGELOG.md](./CHANGELOG.md) を参照してください。

## サポート

問題や質問がある場合は、GitHub の Issue でお知らせください。