# Kibela API 開発メモ

## Kibela GraphQL API の仕様

### エンドポイント
- URL: `https://{team}.kibe.la/api/v1`
- 認証: `Authorization: Bearer {token}` (大文字小文字が重要)

### 重要な発見事項

#### 1. Folder フィールドについて
- `Note` タイプには `folder`（単数）フィールドは存在しない
- 代わりに `folders`（複数形）フィールドが存在する
- `folders` は GraphQL Connection 型で、`edges`/`node` 構造を持つ
- `folders` フィールドには必ず `first` パラメータが必要

```graphql
folders(first: 10) {
  edges {
    node {
      id
      name
    }
  }
}
```

#### 2. GraphQL フラグメント
- Kibela API は GraphQL フラグメントをサポートしていない
- すべてのフィールドを直接指定する必要がある

#### 3. GraphQL クエリコスト制限
- Kibela APIには1リクエストあたり最大10,000のコスト制限がある
- 多くのフィールドを含むクエリや、大量のデータを取得しようとするとエラーになる
- エラー例: `Query has cost of 22904, which exceeds max cost per-request of 10000`
- 対策:
  - 取得するフィールドを最小限にする（軽量クエリの使用）
  - `first` パラメータを小さくする（10〜20件程度）
  - ページネーションを使用して少しずつ取得する

### 4. Relay ID エンコーディング
- Kibela は GraphQL Relay 仕様に従った ID エンコーディングを使用
- 例: `R3JvdXAvMg` = Base64(`Group/2`)
- 数値 ID を Relay ID に変換する場合: `Buffer.from('Note:1').toString('base64')`

#### 4. フォルダによるフィルタリング
- API レベルでフォルダによるフィルタリングはサポートされていない
- クライアント側でフィルタリングを実装する必要がある

#### 5. CreateNoteInput の folders フィールド
- `folders` フィールドは以下の構造を持つ配列:
```typescript
folders?: Array<{
  groupId: string;
  folderName: string;
}>;
```

## 型定義

### Note タイプの主要フィールド
```typescript
interface Note {
  id: string;
  title: string;
  content: string;
  contentHtml: string;
  contentUpdatedAt: string;
  publishedAt?: string;
  url: string;
  author: User;
  groups: Group[];
  folders?: {
    edges: Array<{
      node: {
        id: string;
        name: string;
      };
    }>;
  };
  coediting: boolean;
  commentsCount?: number;
}
```

### Introspection で確認された Note フィールド一覧
- attachments
- author
- canBeArchived
- canBeCommented
- canBeDestroyed
- canBeLiked
- canBeUpdated
- coediting
- comments
- commentsCount
- content
- contentHtml
- contentSummaryHtml
- contentTocHtml
- contentUpdatedAt
- contributors
- createdAt
- editPath
- folders (複数形！)
- groups
- hasCollabHistory
- id
- inlineComments
- isArchived
- isLikedByCurrentUser
- likers
- path
- publishedAt
- relatedNotes
- reviewableDraft
- selectableGroups
- sharedNote
- title
- trackbackNotes
- updatedAt
- url

## エラーと解決策

### 1. Authorization ヘッダーの大文字小文字
- ❌ `authorization: Bearer ...`
- ✅ `Authorization: Bearer ...`

### 2. API エンドポイント
- ❌ `/api/graphql`
- ✅ `/api/v1`

### 3. Folder フィールドエラー
- ❌ `folder { name }`
- ✅ `folders(first: 10) { edges { node { name } } }`

## フォルダの全件取得について

### 問題点
- `folders(first: 10)` では最大10件しか取得できない
- Kibela APIのGraphQL Connectionは最大100件までしか一度に取得できない

### 解決策

1. **first パラメータを大きくする**
   ```graphql
   folders(first: 100) {  # 最大100件まで取得
     edges {
       node {
         id
         name
       }
     }
   }
   ```

2. **ページネーションを使用する**
   ```typescript
   // 全フォルダを取得する例
   async listAllFolders(): Promise<Folder[]> {
     const allFolders: Folder[] = [];
     let hasNextPage = true;
     let cursor: string | undefined;
     
     while (hasNextPage) {
       const result = await client.folders.list({
         first: 100,
         after: cursor
       });
       
       allFolders.push(...result.nodes);
       hasNextPage = result.pageInfo.hasNextPage;
       cursor = result.pageInfo.endCursor;
     }
     
     return allFolders;
   }
   ```

3. **専用のフォルダリソースを使用**
   ```typescript
   // 新しく追加されたフォルダリソース
   const folders = await kibela.folders.listAll(); // 自動でページネーション
   ```

## 今後の改善点

1. ~~ノート内容取得コマンドの追加~~ ✅ 完了 (v0.1.4)
2. ~~マークダウンファイルからのノート作成機能~~ ✅ 完了 (v0.1.4)
3. ~~フォルダの直接クエリサポート~~ ✅ 完了 (v0.1.4)
4. バッチ処理や差分取得の実装
5. フォルダ作成・更新・削除のサポート
6. タグのサポート
7. 添付ファイルのサポート