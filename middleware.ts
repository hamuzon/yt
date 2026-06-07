import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const url = new URL(request.url)
  const host = request.headers.get('host') || ''
  const hostPart = host.split(':')[0]

  // Hostヘッダー（ポート番号を除く部分）の末尾にドットがあるか判定
  if (hostPart.endsWith('.')) {
    // 末尾のドットを明示的に削除したホスト名を設定
    url.hostname = hostPart.slice(0, -1)
    return NextResponse.redirect(url, 301)
  }

  return NextResponse.next()
}