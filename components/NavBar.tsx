"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Trophy, BarChart3, Star, List, Settings } from "lucide-react"
import { useEffect, useState } from "react"

export function NavBar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [displayName, setDisplayName] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const name = session.user.user_metadata?.display_name
          ?? session.user.email?.split('@')[0]
          ?? null
        setDisplayName(name)
      }
    })
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setDisplayName(null)
    router.push('/login')
    router.refresh()
  }

  const isActive = (path: string) => pathname?.startsWith(path)

  const navLinks = [
    { href: '/bracket', label: 'Bracket', icon: Trophy },
    { href: '/picks', label: 'Picks', icon: Star },
    { href: '/leaderboard', label: 'Leaderboard', icon: BarChart3 },
    { href: '/my-picks', label: 'My Picks', icon: List },
    { href: '/admin/season', label: 'Admin', icon: Settings },
  ]

  return (
    <nav className="border-b bg-card">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <Trophy className="h-6 w-6 text-primary" />
            <span>ShaqtinBracket</span>
          </Link>

          <div className="flex items-center gap-1">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href}>
                <Button
                  variant={isActive(href) && !(href === '/bracket' && isActive('/admin')) ? 'default' : 'ghost'}
                  size="sm"
                  className="gap-1.5"
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{label}</span>
                </Button>
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {displayName ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground hidden sm:inline">{displayName}</span>
                <Button variant="outline" size="sm" onClick={handleLogout}>Sign out</Button>
              </div>
            ) : (
              <Link href="/login">
                <Button size="sm">Sign in</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
