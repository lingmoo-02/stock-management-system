'use client'

export default function MyLoansPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">借用状況</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-gray-600 text-sm font-medium mb-2">借用中</div>
          <div className="text-3xl font-bold text-gray-900">0</div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-gray-600 text-sm font-medium mb-2">申請中</div>
          <div className="text-3xl font-bold text-gray-900">0</div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-gray-600 text-sm font-medium mb-2">返却期限が近い</div>
          <div className="text-3xl font-bold text-gray-900">0</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">借用中の備品</h2>
        </div>

        <div className="p-6 text-center text-gray-600">
          <p>借用中の備品はありません</p>
        </div>
      </div>
    </div>
  )
}
