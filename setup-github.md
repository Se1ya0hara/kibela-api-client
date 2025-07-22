# GitHub リポジトリのセットアップ手順

## 1. GitHub でリポジトリを作成

1. https://github.com/new にアクセス
2. 以下の設定で作成：
   - Repository name: `kibela-api-client`
   - Description: `Kibela API client for Node.js with CLI`
   - Public を選択（npm パッケージとして公開するため）
   - Initialize repository は **チェックしない**

## 2. ローカルリポジトリと接続

```bash
# 現在のディレクトリで実行
cd /Users/a0/dev/kibela-api

# Git リポジトリを初期化（まだの場合）
git init

# リモートリポジトリを追加
git remote add origin https://github.com/Se1ya0hara/kibela-api-client.git

# 最初のコミット
git add .
git commit -m "Initial commit: Kibela API Client v0.1.8"

# main ブランチに切り替え（必要な場合）
git branch -M main

# プッシュ
git push -u origin main
```

## 3. 推奨される追加ファイル

### .gitignore（既にある場合は確認）
```
node_modules/
dist/
.env
.env.local
*.log
.DS_Store
coverage/
.nyc_output/
```

## 4. GitHub Actions の設定（オプション）

`.github/workflows/ci.yml` を作成して自動テストを設定：

```yaml
name: CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [16.x, 18.x, 20.x]
    
    steps:
    - uses: actions/checkout@v3
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v3
      with:
        node-version: ${{ matrix.node-version }}
    - run: npm ci
    - run: npm run build
    - run: npm test
```

## 5. リポジトリの設定

GitHub リポジトリページで：
1. Settings → Options
2. Features で Issues を有効化
3. About セクションに説明とトピックを追加
   - Topics: `kibela`, `api-client`, `typescript`, `cli`, `graphql`

## 6. README にバッジを追加（オプション）

README.md の最初に追加：
```markdown
[![npm version](https://badge.fury.io/js/kibela-api-client.svg)](https://badge.fury.io/js/kibela-api-client)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
```