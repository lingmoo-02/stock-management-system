# CLAUDE.md - プロジェクト開発ガイド

このファイルは、Claude AI を使用してこのプロジェクトを開発する際のガイドラインを記載しています。

## 📋 プロジェクト概要

このプロジェクトは、**管理画面系アプリケーションの爆速開発**を目的とした、モダンでスケーラブルなテンプレートです。

### 主な特徴
- **Next.js App Router** による最新の開発体験
- **フィーチャーベースド・レイヤードアーキテクチャ** による保守性の高い設計
- **TypeScript** による型安全な開発
- **Server Actions** による安全なサーバー側処理
- **Prisma ORM** による直感的なデータベース操作
- **Supabase** による統合バックエンド環境

## 🏗️ アーキテクチャ

### フィーチャーベースド・レイヤードアーキテクチャ

```
src/
├── app/              # ルーティング定義とページレイアウト
├── features/         # ドメイン単位の機能実装（ビジネスロジック中心）
├── components/       # 再利用可能なUIコンポーネント
├── lib/              # ライブラリの初期化設定
├── hooks/            # 再利用可能なカスタムフック
└── types/            # グローバル型定義
```

### 責任の分離

#### `app/` ディレクトリ
- **責務**: ルーティング、ページレイアウト、UI組成
- **参照可能**: features/ のコンポーネントを使用
- **参照禁止**: features/ のビジネスロジックに直接依存してはいけない

#### `features/` ディレクトリ（フィーチャー単位）
- **責務**: ビジネスロジック、データ取得・更新処理
- **構成**:
  - `components/` - その機能専用のUIパーツ
  - `services/` - データ取得処理（Repositoryパターン）
  - `actions.ts` - データ更新処理（Server Actions）
  - `types.ts` - 型定義
  - `schema.ts` - バリデーションスキーマ

#### `components/` ディレクトリ
- **責務**: 複数の機能で再利用されるUIコンポーネント
- **制約**: ビジネスロジックを持たせない（見た目制御のみ）

## 💻 コーディング規約

### TypeScript

```typescript
// ✅ 良い例：型注釈が明確
export async function getUserById(id: string): Promise<User | null> {
  return await prisma.user.findUnique({ where: { id } })
}

// ❌ 悪い例：型推論に頼りすぎている
export async function getUser(id: string) {
  return await prisma.user.findUnique({ where: { id } })
}
```

### ファイル命名規則

| ファイルタイプ | 命名規則 | 例 |
|---|---|---|
| コンポーネント（パスカルケース） | PascalCase | `UserProfileCard.tsx` |
| ユーティリティ関数 | camelCase | `formatDate.ts` |
| 型定義ファイル | types または Type | `user.types.ts` |
| スキーマ定義 | schema | `user.schema.ts` |
| Server Actions | actions | `actions.ts` |
| サービス/Repo | service または Service | `userService.ts` |

### コンポーネント設計パターン

```typescript
// ✅ 推奨：責務を分離したコンポーネント
interface UserCardProps {
  user: User
  onEdit?: (user: User) => void
}

export function UserCard({ user, onEdit }: UserCardProps) {
  return (
    <div>
      <h2>{user.name}</h2>
      {onEdit && (
        <button onClick={() => onEdit(user)}>編集</button>
      )}
    </div>
  )
}

// ❌ 非推奨：プロップドリリングが多すぎる
export function UserCard(props: any) {
  // ...
}
```

## 🚀 Claudeを使った開発ワークフロー

### 新機能追加の手順

1. **要件定義**
   - Claude に「~という機能を追加したい」と説明
   - データモデル、UI、データフロー確認

2. **実装計画**
   - Claude に実装計画を作成してもらう
   - 確認してから実装を開始

3. **実装**
   - DB定義 → サービス層 → Server Actions → UI の順序で実装
   - 各ステップで Claude に相談可能

4. **テスト & リファクタ**
   - Claude に テストコードや型チェック の実施を依頼

### リファクタリングの方法

```typescript
// リファクタリング前の確認：
// "このコンポーネントのロジックが複雑になってきました。
// リファクタリングのアドバイスをもらえますか？"

// Claude が提案 → 確認 → 実装 の流れ
```

### テスト作成のガイド

```typescript
// Server Actions のテスト例
describe('createUser', () => {
  it('valid input でユーザーを作成できる', async () => {
    const result = await createUser({
      name: 'John',
      email: 'john@example.com',
    })
    expect(result.success).toBe(true)
  })

  it('invalid input でエラーを返す', async () => {
    const result = await createUser({ name: '' })
    expect(result.success).toBe(false)
  })
})
```

## ⚙️ 設計ルール

### Server Actions の使用

```typescript
// ✅ 推奨：バリデーション → ビジネスロジック → DB操作
'use server'

export async function createUser(input: unknown) {
  // 1. バリデーション
  const validated = createUserSchema.parse(input)

  // 2. ビジネスロジック
  const userExists = await getUserByEmail(validated.email)
  if (userExists) {
    throw new Error('Email already exists')
  }

  // 3. DB操作
  const user = await prisma.user.create({ data: validated })
  return user
}
```

### データフェッチのパターン

```typescript
// services/userService.ts
export async function getUserById(id: string): Promise<User | null> {
  return await prisma.user.findUnique({ where: { id } })
}

export async function getUserList(
  limit: number = 10,
  offset: number = 0
): Promise<User[]> {
  return await prisma.user.findMany({
    take: limit,
    skip: offset,
    orderBy: { createdAt: 'desc' },
  })
}
```

### エラーハンドリング

```typescript
// ✅ 推奨：予測可能なエラー構造
export async function deleteUser(id: string) {
  try {
    const user = await prisma.user.delete({ where: { id } })
    return {
      success: true,
      data: user,
    }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return {
          success: false,
          error: 'User not found',
        }
      }
    }
    throw error
  }
}
```

## 📚 便利なコマンド

```bash
# 開発サーバーの起動
npm run dev

# データベーススキーマを確認
npx prisma studio

# 型チェック
npm run type-check

# ESLintでコード品質チェック
npm run lint

# Prisma スキーマを更新
npx prisma db push

# マイグレーション
npx prisma migrate dev --name feature_name
```

## 🔗 関連資料

- [README.md](./README.md) - プロジェクト概要
- [AGENTS.md](./AGENTS.md) - エージェント開発ガイド
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Zod Documentation](https://zod.dev)
