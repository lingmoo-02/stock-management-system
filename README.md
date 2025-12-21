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

---

## 📦 プロジェクト概要 - 備品管理システム

本テンプレートを使用して、社内PC・モニター・備品などの貸出状況を可視化し、紛失防止と在庫管理を行うシステムを構築しています。

### 🎯 プロジェクト目標

社内備品の効率的な管理と、ユーザーの利便性を両立したシステムの実現

### 👥 ターゲットユーザー

1. **一般社員**
   - 備品を検索し、借用・返却の手続きを行う
   - 自分の借用状況を確認する

2. **管理者**
   - 備品の登録・削除・更新
   - 貸出申請の承認・却下
   - 全体の貸出状況を把握

### ✨ 主要機能一覧

| 機能 | 説明 |
| :--- | :--- |
| **認証機能** | Supabase Auth（メール・パスワード） |
| **備品一覧・検索** | カテゴリ別、ステータス別（利用可能、申請中、貸出中、修理中）の絞り込み |
| **貸出フロー** | 「借用申請」→「管理者承認」→「貸出中」→「返却申請」→「返却完了」 |
| **画像アップロード** | 備品の外観画像を登録（Supabase Storage） |
| **ダッシュボード** | 現在の借用状況、返却期限が近いものの表示 |
| **貸出履歴** | 備品ごとの過去の借用状況をタイムライン表示 |

### 🗄️ データベース設計

```
Profile（ユーザープロフィール）
├── id: UUID（Supabase Auth user.id）
├── name: 名前
├── email: メール（unique）
├── role: ユーザー役割（USER | ADMIN）
└── transactions: 貸出履歴（リレーション）

Asset（備品）
├── id: CUID（プライマリキー）
├── name: 備品名
├── category: カテゴリ
├── description: 説明
├── serialNumber: シリアルナンバー
├── imageUrl: 画像URL
├── status: ステータス（AVAILABLE | REQUESTED | ON_LOAN | MAINTENANCE）
└── transactions: 貸出履歴（リレーション）

Transaction（貸出履歴）
├── id: CUID（プライマリキー）
├── assetId: 備品ID（FK）
├── userId: ユーザーID（FK）
├── requestDate: 申請日時
├── loanStartDate: 貸出開始日時
├── returnDate: 返却日時
└── status: ステータス（PENDING | APPROVED | REJECTED | ON_LOAN | RETURNED）
```

### 📄 画面構成

| 画面 | 対象 | 説明 |
| :--- | :--- | :--- |
| ログイン | 全員 | メール・パスワードでログイン |
| 新規登録 | 全員 | 新規ユーザー登録 |
| ダッシュボード | 全員 | ホーム画面 |
| 備品一覧 | 全員 | 備品検索・閲覧（カテゴリ・キーワード検索対応） |
| 備品詳細 | 全員 | 備品情報・貸出履歴・借用ボタン |
| 借用状況 | 全員 | 自分の借用中・申請中の備品一覧 |
| 貸出管理（管理者） | 管理者 | 承認待ち一覧・承認・却下操作 |

### 🚀 実装ロードマップ

- [x] **Phase 1**: データベース設計・認証機能
- [ ] **Phase 2**: 備品一覧・詳細ページ（API/Service層）
- [ ] **Phase 3**: 貸出・返却フロー（Server Actions）
- [ ] **Phase 4**: 管理者画面・申請管理
- [ ] **Phase 5**: 画像アップロード機能（Supabase Storage）
- [ ] **Phase 6**: 通知・メール機能
- [ ] **Phase 7**: テストコード・デプロイ
