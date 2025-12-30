# 備品貸出・返却システム実装ドキュメント

## 概要

ユーザーが利用可能な備品を即座に借りて、いつでも返却できるシステムを実装しました。管理者による承認フローは不要で、シンプルで使いやすい設計になっています。

---

## 🎯 実装概要

### 主な特徴

#### 1. **即時貸出機能** (`/dashboard/borrow`)
- 利用可能な備品の一覧表示
- **リアルタイム検索機能**
  - 備品名、カテゴリ、説明で検索可能
  - 入力時に自動フィルタリング
- **2ステップの確認フロー**
  - ステップ1: 備品選択
  - ステップ2: 確認・実行
- 承認不要の即座な貸出処理
- エラー・成功メッセージ表示

#### 2. **借用状況管理** (`/dashboard/my-loans`)
- **統計表示**
  - 借用中の件数
  - 返却済みの件数
- **借用中の備品一覧**
  - 備品コード、カテゴリ、貸出開始日を表示
  - 「返却する」ボタンで即座に返却可能
- **返却済み履歴**
  - すべての返却済み備品を表示
  - 貸出開始日と返却日を記録

#### 3. **備品一覧** (`/dashboard/assets`)
- 読み取り専用の備品一覧表示
- 貸出アクションはこのページからは不可
- 責務の明確な分離

---

## 📊 データベース設計

### TransactionStatus フロー

```
AVAILABLE
    ↓ (borrowAsset)
ON_LOAN
    ↓ (returnAsset)
RETURNED
```

### Transaction モデル

```typescript
{
  id: string                // トランザクションID
  assetId: string          // 備品ID
  asset: Asset             // 関連する備品
  userId: string           // ユーザーID
  user: Profile            // 関連するユーザー
  requestDate: DateTime    // 申請（借用）日時
  loanStartDate: DateTime  // 貸出開始日時
  returnDate?: DateTime    // 返却日時（返却前はnull）
  status: TransactionStatus
  createdAt: DateTime
  updatedAt: DateTime
}
```

---

## 🔧 技術実装

### 新規作成ファイル

#### 1. `src/features/transactions/services/transactionService.ts`
```typescript
// ユーザーの貸出履歴取得
export async function getTransactionsByUserId(userId: string): Promise<Transaction[]>

// TransactionをID検索
export async function getTransactionById(transactionId: string): Promise<Transaction | null>
```

#### 2. `src/features/transactions/actions.ts`
```typescript
// 即時貸出処理
export async function borrowAsset(userId: string, assetId: string)
// - ユーザー・備品存在確認
// - ステータスチェック（AVAILABLE のみ）
// - 重複借用防止
// - Transactionレコード作成
// - 備品ステータス更新（AVAILABLE → ON_LOAN）

// 返却処理
export async function returnAsset(userId: string, transactionId: string)
// - ユーザー・トランザクション存在確認
// - ステータスチェック（ON_LOAN のみ）
// - 権限チェック（自分の貸出記録のみ）
// - ステータス更新（ON_LOAN → RETURNED）
// - 備品ステータス復帰（ON_LOAN → AVAILABLE）
```

### 修正したファイル

#### 1. `src/app/dashboard/borrow/page.tsx`
- Server Action（`getAllAssetsAction`）で備品一覧取得
- 検索フィルタリング機能実装
- 2ステップフロー実装
- エラー・成功メッセージ表示

#### 2. `src/app/dashboard/my-loans/page.tsx`
- ユーザーの貸出履歴取得
- 借用中・返却済みで区分表示
- 返却ボタン実装
- 統計表示実装

#### 3. `src/features/assets/components/AssetList.tsx`
- 「借りる」ボタンを削除
- 検索機能を削除
- 読み取り専用コンポーネント化

---

## 🔐 セキュリティ・検証

### 実装されている検証

| 項目 | 実装内容 |
|------|--------|
| **認証チェック** | すべてのServer Actionでユーザー確認 |
| **存在確認** | ユーザー・備品・トランザクションの存在を検証 |
| **ステータス検証** | 適切なステータスのみ処理を許可 |
| **重複防止** | 同一ユーザーの同一備品への重複借用を防止 |
| **権限確認** | ユーザーは自分の記録のみ返却可能 |
| **自動更新** | 備品ステータスを自動的に同期 |

---

## 🚀 ユーザーフロー

### 貸出フロー

```
ユーザーがdashboard/borrowにアクセス
    ↓
利用可能な備品一覧が表示される
（読み込み中は「読み込み中...」表示）
    ↓
[検索ボックスで絞り込み可能]
    ↓
備品をクリック（ステップ1: 備品選択）
    ↓
確認画面が表示される（ステップ2: 確認）
    ↓
「今すぐ借りる」ボタンをクリック
    ↓
borrowAsset() Server Action実行
    ↓
成功 → 「備品を借りました」メッセージ表示
    ↓
1.5秒後にページリロード
    ↓
一覧に戻り、その備品は表示されなくなる
    ↓
マイページで「借用中」に表示される
```

### 返却フロー

```
ユーザーがdashboard/my-loansにアクセス
    ↓
「借用中の備品」セクションで借りた備品を確認
    ↓
対象の備品の「返却する」ボタンをクリック
    ↓
returnAsset() Server Action実行
    ↓
成功 → リスト更新
    ↓
「返却済みの備品」セクションに移動
    ↓
備品が返却可能になる（別のユーザーが借用可能）
```

---

## 📋 実装チェックリスト

- [x] Transaction サービス層実装
- [x] 貸出 Server Action 実装
- [x] 返却 Server Action 実装
- [x] 貸出ページUI実装
- [x] 検索機能実装
- [x] マイページUI実装
- [x] エラーハンドリング実装
- [x] 権限チェック実装
- [x] ビルドエラーなし
- [x] TypeScript 型チェック完了

---

## 🔄 関連するページ・機能

| ページ | URL | 責務 |
|------|-----|------|
| **備品一覧** | `/dashboard/assets` | 全備品の確認（読み取り専用） |
| **備品を借りる** | `/dashboard/borrow` | 備品の検索と貸出処理 |
| **借用状況** | `/dashboard/my-loans` | 貸出履歴・返却管理 |

---

## ⚙️ API 詳細

### borrowAsset

```typescript
borrowAsset(userId: string, assetId: string)
// リターン: { success: boolean; data?: Transaction; error?: string }

// 処理フロー:
// 1. ユーザー存在確認
// 2. 備品存在確認
// 3. 備品ステータスチェック（AVAILABLE のみ）
// 4. 重複借用チェック
// 5. Transaction レコード作成（status: ON_LOAN）
// 6. 備品ステータス更新（AVAILABLE → ON_LOAN）
```

**成功時:**
```typescript
{
  success: true,
  data: {
    id: "txn_123",
    assetId: "asset_456",
    userId: "user_789",
    status: "ON_LOAN",
    requestDate: "2025-12-30T10:00:00Z",
    loanStartDate: "2025-12-30T10:00:00Z",
    returnDate: null,
    ...
  }
}
```

**エラー時:**
```typescript
{
  success: false,
  error: "この備品は貸出中です" // または他のエラーメッセージ
}
```

### returnAsset

```typescript
returnAsset(userId: string, transactionId: string)
// リターン: { success: boolean; data?: Transaction; error?: string }

// 処理フロー:
// 1. ユーザー存在確認
// 2. Transaction 存在確認
// 3. ステータスチェック（ON_LOAN のみ）
// 4. 権限チェック（userId 一致確認）
// 5. Transaction ステータス更新（ON_LOAN → RETURNED）
// 6. returnDate 設定
// 7. 備品ステータス復帰（ON_LOAN → AVAILABLE）
```

---

## 🧪 テスト済みシナリオ

### ✅ 正常系

- [x] ユーザーが備品を借りられる
- [x] 借りた備品がマイページに表示される
- [x] ユーザーが自分の備品を返却できる
- [x] 返却後、備品が再び借りられる
- [x] 検索で備品をフィルタリングできる
- [x] 確認画面で正確な情報が表示される

### ✅ エラー処理

- [x] 利用不可な備品は借りられない
- [x] 既に借りている備品は重複借用できない
- [x] 他人の貸出記録は返却できない
- [x] 存在しない備品は処理されない
- [x] ログイン前のアクセスはログインページにリダイレクト

---

## 📝 今後の拡張機能（オプション）

以下は将来的な実装を想定した機能です：

- 貸出期限管理と延滞通知
- 返却予定日の設定
- 貸出理由・コメント機能
- 返却時の備品状態レポート
- 借用の一時中断機能
- 貸出統計・レポート機能
- メール通知機能

---

## 📞 サポート

問題が発生した場合は、各ページのエラーメッセージを確認してください。詳細なエラーログはブラウザの開発者ツール（Console）で確認できます。

---

**実装完了日**: 2025年12月30日
**実装者**: Claude Code
**ステータス**: ✅ 本番環境対応完了
