/**
 * Example Feature Types
 * このファイルはフィーチャー固有の型定義を記述します。
 */

export interface ExampleItem {
  id: string
  name: string
  description?: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateExampleItemInput {
  name: string
  description?: string
}

export interface UpdateExampleItemInput {
  name?: string
  description?: string
}
