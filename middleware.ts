import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const url = new URL(request.url)

  // hostnameの末尾にドットがある場合は削除してリダイレクト
  if (url.hostname.endsWith('.')) {
    url.hostname = url.hostname.slice(0, -1)
    return NextResponse.redirect(url, 301)
  }

  return NextResponse.next()
}