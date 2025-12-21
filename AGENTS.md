# AGENTS.md - Claude Agent SDK 開発ガイド

このファイルは、Claude Agent SDK を使用してカスタムエージェントを開発する際のガイドラインを記載しています。

## 📚 Claude Agent SDK 概要

### Agent SDK とは

Claude Agent SDK は、Claude AI を活用したカスタムエージェント開発を容易にするSDKです。

**主な機能**:
- Agent の定義と実行
- ツール（Tool）の登録と実行
- マルチターン会話の管理
- エラーハンドリングと再試行

### 主要な概念

#### Agent
AI エージェントの実行エンジン。ユーザーの指示を受けて、複数の処理（ツール呼び出し）を順序立てて実行します。

#### Tool
エージェントが実行可能なアクション。データベース操作、API呼び出し、ファイル操作など。

#### Prompt
エージェントの行動を制御する指示。エージェントの役割、背景、期待される行動を定義します。

## 🔧 環境セットアップ

### SDKのインストール

```bash
# npm を使う場合
npm install @anthropic-sdk/sdk

# または yarn
yarn add @anthropic-sdk/sdk
```

### 環境変数の設定

```bash
# .env.local に以下を追加
ANTHROPIC_API_KEY=your_api_key_here
```

### 初期設定

```typescript
import { Anthropic } from '@anthropic-sdk/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})
```

## 🛠️ カスタムエージェント開発

### 基本的なエージェント構造

```typescript
// agents/basicAgent.ts
import { Anthropic } from '@anthropic-sdk/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function basicAgent(userMessage: string) {
  const response = await anthropic.messages.create({
    model: 'claude-opus-4-5-20251101',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: userMessage,
      },
    ],
  })

  return response
}
```

### ツール（Tool）の定義

```typescript
// agents/tools/userTools.ts
import { Tool } from '@anthropic-sdk/sdk/resources'

export const userTools: Tool[] = [
  {
    name: 'get_user',
    description: 'ユーザー情報を取得します',
    input_schema: {
      type: 'object',
      properties: {
        user_id: {
          type: 'string',
          description: 'ユーザーID',
        },
      },
      required: ['user_id'],
    },
  },
  {
    name: 'create_user',
    description: 'ユーザーを作成します',
    input_schema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'ユーザー名',
        },
        email: {
          type: 'string',
          description: 'メールアドレス',
        },
      },
      required: ['name', 'email'],
    },
  },
]
```

### ツール実行ハンドラの実装

```typescript
// agents/handlers/userToolHandler.ts
import { getUserById, createUser } from '@/src/features/users/services'

export async function handleUserTool(
  toolName: string,
  toolInput: Record<string, string>
): Promise<string> {
  try {
    switch (toolName) {
      case 'get_user': {
        const user = await getUserById(toolInput.user_id)
        if (!user) {
          return JSON.stringify({ error: 'User not found' })
        }
        return JSON.stringify(user)
      }

      case 'create_user': {
        const user = await createUser({
          name: toolInput.name,
          email: toolInput.email,
        })
        return JSON.stringify({ success: true, user })
      }

      default:
        return JSON.stringify({ error: `Unknown tool: ${toolName}` })
    }
  } catch (error) {
    return JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}
```

### エージェントの実装（ツール統合）

```typescript
// agents/userManagementAgent.ts
import { Anthropic } from '@anthropic-sdk/sdk'
import { userTools } from './tools/userTools'
import { handleUserTool } from './handlers/userToolHandler'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const SYSTEM_PROMPT = `
You are a helpful user management assistant.
You can help users perform user management operations like:
- Retrieving user information
- Creating new users

Always be clear and concise in your responses.
When working with user data, validate inputs appropriately.
`

export async function userManagementAgent(userMessage: string) {
  const messages: Array<{
    role: 'user' | 'assistant'
    content:
      | string
      | Array<{ type: string; tool_use_id?: string; content: string }>
  }> = [
    {
      role: 'user',
      content: userMessage,
    },
  ]

  let continueLoop = true

  while (continueLoop) {
    const response = await anthropic.messages.create({
      model: 'claude-opus-4-5-20251101',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      tools: userTools,
      messages: messages,
    })

    // ツール呼び出しがない場合は終了
    if (response.stop_reason === 'end_turn') {
      continueLoop = false
      return response
    }

    // メッセージに新しいレスポンスを追加
    messages.push({
      role: 'assistant',
      content: response.content,
    })

    // ツール呼び出しの処理
    const toolResults = []

    for (const block of response.content) {
      if (block.type === 'tool_use') {
        const toolResult = await handleUserTool(block.name, block.input)
        toolResults.push({
          type: 'tool_result',
          tool_use_id: block.id,
          content: toolResult,
        })
      }
    }

    // ツール結果をメッセージに追加
    if (toolResults.length > 0) {
      messages.push({
        role: 'user',
        content: toolResults,
      })
    } else {
      continueLoop = false
    }
  }
}
```

### プロンプトの設計

```typescript
// agents/prompts/expertSystemPrompt.ts

export const dataAnalystPrompt = `
You are an expert data analyst with deep knowledge of database queries,
data visualization, and business intelligence.

Your responsibilities:
1. Analyze data queries provided by users
2. Suggest optimizations for database queries
3. Create relevant visualizations
4. Provide insights from the data

Always prioritize:
- Accuracy in data analysis
- Clear explanations for non-technical users
- Best practices in database optimization
`

export const codeReviewPrompt = `
You are an experienced software engineer and code reviewer.

Your role:
1. Review code for quality, security, and performance
2. Suggest improvements and best practices
3. Identify potential bugs and edge cases
4. Help refactor code for better maintainability

When reviewing, consider:
- Code readability and maintainability
- Security vulnerabilities
- Performance optimization
- Test coverage
- Documentation
`
```

## ✨ ベストプラクティス

### 1. エージェント設計パターン

```typescript
// ✅ 推奨：責務を明確にしたエージェント
export async function specificAgent(input: UserInput) {
  // 特定の領域に特化した処理
  const context = prepareContext(input)
  return await executeSpecificTask(context)
}

// ❌ 非推奨：何でもできるジェネラルエージェント
export async function superAgent(input: any) {
  // 多くの異なるタスクを処理
}
```

### 2. ツール設計のベストプラクティス

```typescript
// ✅ 推奨：明確な入出力仕様
export const calculateToolkit: Tool[] = [
  {
    name: 'add_numbers',
    description: '2つの数値を加算します',
    input_schema: {
      type: 'object',
      properties: {
        a: { type: 'number', description: '最初の数値' },
        b: { type: 'number', description: '2番目の数値' },
      },
      required: ['a', 'b'],
    },
  },
]

// ❌ 非推奨：不明確な説明
export const tools: Tool[] = [
  {
    name: 'do_math',
    description: '計算します',
    input_schema: { type: 'object', properties: {} },
  },
]
```

### 3. エラーハンドリング

```typescript
// ✅ 推奨：適切なエラーハンドリング
try {
  const result = await toolHandler(toolName, toolInput)
  return {
    success: true,
    data: result,
  }
} catch (error) {
  console.error(`Tool execution failed: ${toolName}`, error)
  return {
    success: false,
    error:
      error instanceof Error ? error.message : 'Unknown error occurred',
  }
}

// ❌ 非推奨：エラーを隠す
try {
  return await toolHandler(toolName, toolInput)
} catch {
  return null
}
```

### 4. テストとデバッグ

```typescript
// agents/__tests__/userAgent.test.ts
import { userManagementAgent } from '../userManagementAgent'

describe('userManagementAgent', () => {
  it('ユーザー情報取得リクエストに応答する', async () => {
    const result = await userManagementAgent('user 123 の情報を取得してください')
    expect(result.content).toBeDefined()
  })

  it('ユーザー作成リクエストに応答する', async () => {
    const result = await userManagementAgent(
      '名前が John で メール john@example.com の新規ユーザーを作成してください'
    )
    expect(result.content).toBeDefined()
  })

  it('不正なリクエストを適切に処理する', async () => {
    const result = await userManagementAgent('存在しないユーザーを取得してください')
    expect(result).toBeDefined()
  })
})
```

## 📊 実践的なユースケース

### ユースケース 1: データ分析エージェント

```typescript
// agents/dataAnalystAgent.ts
export async function analyzeDataset(
  csvFilePath: string,
  analysisQuery: string
) {
  // 1. CSVファイルを読み込む
  const data = readCSVFile(csvFilePath)

  // 2. エージェントに分析を依頼
  const analysis = await analyticsAgent(
    `以下のデータを分析してください:\n${data}\n\n質問: ${analysisQuery}`
  )

  return analysis
}
```

### ユースケース 2: コードレビューエージェント

```typescript
// agents/codeReviewAgent.ts
export async function reviewCode(sourceCode: string) {
  const review = await codeReviewAgent(
    `以下のコードをレビューしてください:\n\`\`\`\n${sourceCode}\n\`\`\``
  )

  return parseReviewResult(review)
}
```

### ユースケース 3: カスタマーサポートエージェント

```typescript
// agents/supportAgent.ts
export async function handleCustomerQuery(
  customerId: string,
  query: string
) {
  const customerHistory = await getCustomerHistory(customerId)

  const response = await customerSupportAgent(
    `顧客ID: ${customerId}\n履歴: ${customerHistory}\n\n質問: ${query}`
  )

  return response
}
```

## 🔗 関連資料

- [Claude API Documentation](https://docs.anthropic.com/)
- [Claude Agent SDK Guide](https://github.com/anthropics/anthropic-sdk-python)
- [CLAUDE.md](./CLAUDE.md) - Claude開発ガイド
- [README.md](./README.md) - プロジェクト概要

## 💡 よくある質問

**Q: Agent SDK と API の違いは？**
A: Agent SDK はツール統合とマルチターン会話を簡単に実装できるようにしたラッパーです。直接 API を使うこともできますが、複雑さが増します。

**Q: 複数のエージェントを組み合わせることはできますか？**
A: はい、エージェント間でツール呼び出しを組み合わせることで、複雑なワークフローを実装できます。

**Q: エージェントの実行時間を制限できますか？**
A: はい、`max_tokens` や タイムアウト設定でコントロール可能です。

**Q: プライベートデータはセキュアですか？**
A: Anthropic はリクエストを 30 日間保持し、プライベートデータの取り扱いについては契約で保証しています。詳細は [プライバシーポリシー](https://www.anthropic.com/privacy) を確認してください。
