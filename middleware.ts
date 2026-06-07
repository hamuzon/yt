import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const url = new URL(request.url)
  const host = request.headers.get('host') || ''

  // Hostヘッダー（ポート番号を除く部分）の末尾にドットがあるか判定
  if (host.split(':')[0].endsWith('.')) {
    // urlオブジェクトは既に正規化されているため、そのままリダイレクト先として使用可能
    return NextResponse.redirect(url, 301)
  }

  return NextResponse.next()
}