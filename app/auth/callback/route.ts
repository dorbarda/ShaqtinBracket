import { NextResponse, type NextRequest } from 'next/server'

// This route handled PKCE magic links (now replaced by implicit flow).
// Kept to gracefully redirect any stale links.
export async function GET(request: NextRequest) {
  const { origin } = new URL(request.url)
  return NextResponse.redirect(`${origin}/bracket`)
}
