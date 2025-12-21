# Full-stack Web App Template (Admin Focus)

管理画面系アプリケーションの爆速開発を目的とした、モダンでスケーラブルな個人開発用テンプレートです。
Next.js (App Router) をベースに、関心の分離と開発効率を両立した設計を採用しています。

## 🚀 技術スタック

| カテゴリ | 選定技術 | 理由 |
| :--- | :--- | :--- |
| **Framework** | **Next.js (App Router)** | SSR/Server Actionsによる高速開発と高いパフォーマンス。 |
| **Language** | **TypeScript** | 型安全によるバグ防止と高い保守性。 |
| **UI Library** | **shadcn/ui** | カスタマイズ性の高い高品質なコンポーネント群。 |
| **Styling** | **Tailwind CSS** | ユーティリティファーストな迅速なスタイリング。 |
| **ORM** | **Prisma** | 直感的なスキーマ定義と型安全なDB操作。 |
| **BaaS** | **Supabase** | DB, Auth, Storageの一括管理と強力なエコシステム。 |
| **Infrastructure** | **Vercel** | Next.jsに最適化されたデプロイ・運用環境。 |

---

## 🏗 アーキテクチャ

本プロジェクトでは、Next.jsの機能を最大限に活かしつつ、保守性を高めるために**フィーチャーベースド・レイヤードアーキテクチャ**を採用しています。

### 📂 ディレクトリ構造

```text
src/
├── app/                 # ルーティング定義、各ページのレイアウト配置
│   ├── (dashboard)/     # 認証後のメイン画面ルート
│   ├── (auth)/          # 認証関連（ログイン・登録）のルート
│   └── layout.tsx       # アプリケーション全体の共通レイアウト
│
├── features/            # ドメイン（機能）単位のロジックとコンポーネント
│   ├── [feature_name]/  # 特定機能（例: users, posts）
│   │   ├── components/  # その機能でのみ使用するUIパーツ
│   │   ├── actions.ts   # データ更新処理 (Server Actions / Use Cases)
│   │   ├── services/    # データ取得処理 (Prisma Query / Repositories)
│   │   ├── types.ts     # ドメイン固有の型定義
│   │   └── schema.ts    # Zod等によるバリデーションルール
│
├── components/          # アプリケーション共通のUIコンポーネント
│   ├── ui/              # shadcn/uiから導入した基本パーツ
│   └── shared/          # プロジェクト固有の汎用コンポーネント（Sidebar等）
│
├── lib/                 # 外部ライブラリの初期化設定（Prisma, Supabase等）
├── hooks/               # 汎用的なカスタムフック
└── types/               # プロジェクト全体の共通型定義

prisma/                  # データベーススキーマとマイグレーションファイル
```

## 🛠 開発ワークフロー

### 1. セットアップ

1. `npm install` で依存関係をインストールします。
2. `.env.example` をコピーして `.env` を作成し、環境変数を設定します。
3. `npx prisma db push` を実行し、データベースにスキーマを反映させます。

### 2. 主要コマンド

- **開発サーバー起動**: `npm run dev`
- **DBスキーマ同期**: `npx prisma db push`
- **DB管理ツール起動**: `npx prisma studio` （ブラウザでデータを確認・操作できます）
- **UIパーツ追加**: `npx shadcn-ui@latest add [component]`

### 3. 機能追加の標準手順

1. **DB定義**: `prisma/schema.prisma` にモデルを追加し、`npx prisma db push` を実行します。
2. **Feature作成**: `src/features/` 配下に新機能ディレクトリを作成します。
3. **ロジック実装**: `services/` に取得処理を、`actions.ts` に更新処理（作成・編集・削除）を記述します。
4. **ページ配置**: `src/app/` 配下にページファイルを作成し、`features` 内のコンポーネントを配置します。

---

## ⚠️ 設計ルール

- **依存の方向**: app/ は features/ を参照できますが、features/ が app/ のコードに依存することは避けてください。
- **UIコンポーネントの責務**: components/ui/ の部品にはビジネスロジックを持たせず、見た目の制御に専念させます。
- **データ更新の集約**: 破壊的な変更（Create, Update, Delete）は、必ず features 内の actions.ts （Server Actions）を経由して実行します。
