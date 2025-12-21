import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '備品管理システム',
  description: '社内備品の貸出・返却状況を可視化し、在庫管理を行うシステム',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>
        {children}
      </body>
    </html>
  )
}
