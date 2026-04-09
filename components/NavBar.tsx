"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Trophy, BarChart3, Star, List, Settings } from "lucide-react"
import { useEffect, useState } from "react"
import type { UserProfile } from "@/types/database.types"

export function NavBar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [profile, setProfile] = useState<UserProfile | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase.from('user_profiles').select('*').eq('id', user.id).single()
          .then(({ data }) => setProfile(data))
      }
    })
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setProfile(null)
    router.push('/login')
    router.refresh()
  }

  const isActive = (path: string) => pathname?.startsWith(path)

  return (
    <nav className="border-b bg-card">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <Trophy className="h-6 w-6 text-primary" />
            <span>ShaqtinBracket</span>
          </Link>

          {profile && (
            <div className="flex items-center gap-1">
              <Link href="/bracket">
                <Button variant={isActive('/bracket') ? 'default' : 'ghost'} size="sm" className="gap-1.5">
                  <Trophy className="h-4 w-4" />
                  <span className="hidden sm:inline">Bracket</span>
                </Button>
              </Link>
              <Link href="/picks">
                <Button variant={isActive('/picks') && !isActive('/pre-picks') ? 'default' : 'ghost'} size="sm" className="gap-1.5">
                  <Star className="h-4 w-4" />
                  <span className="hidden sm:inline">Picks</span>
                </Button>
              </Link>
              <Link href="/leaderboard">
                <Button variant={isActive('/leaderboard') ? 'default' : 'ghost'} size="sm" className="gap-1.5">
                  <BarChart3 className="h-4 w-4" />
                  <span className="hidden sm:inline">Leaderboard</span>
                </Button>
              </Link>
              <Link href="/my-picks">
                <Button variant={isActive('/my-picks') ? 'default' : 'ghost'} size="sm" className="gap-1.5">
                  <List className="h-4 w-4" />
                  <span className="hidden sm:inline">My Picks</span>
                </Button>
              </Link>
              {profile.role === 'admin' && (
                <Link href="/admin/season">
                  <Button variant={isActive('/admin') ? 'default' : 'ghost'} size="sm" className="gap-1.5">
                    <Settings className="h-4 w-4" />
                    <span className="hidden sm:inline">Admin</span>
                  </Button>
                </Link>
              )}
            </div>
          )}

          <div className="flex items-center gap-2">
            {profile ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground hidden sm:inline">{profile.display_name}</span>
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
