import { cn } from '@/lib/utils'
import { Medal } from 'lucide-react'

interface LeaderboardRow {
  id: string
  display_name: string
  avatar_url: string | null
  total: number
  r1: number
  r2: number
  r3: number
  r4: number
  preBet: number
  isCurrentUser: boolean
}

export function LeaderboardTable({ rows }: { rows: LeaderboardRow[] }) {
  if (rows.length === 0) {
    return <p className="text-muted-foreground text-sm">No scores yet.</p>
  }

  const medalColors = ['text-yellow-500', 'text-gray-400', 'text-amber-600']

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="px-4 py-3 text-left w-10">#</th>
            <th className="px-4 py-3 text-left">Player</th>
            <th className="px-4 py-3 text-right font-semibold">Total</th>
            <th className="px-4 py-3 text-right text-muted-foreground">R1</th>
            <th className="px-4 py-3 text-right text-muted-foreground">Semi</th>
            <th className="px-4 py-3 text-right text-muted-foreground">Conf</th>
            <th className="px-4 py-3 text-right text-muted-foreground">Finals</th>
            <th className="px-4 py-3 text-right text-muted-foreground">Pre</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={row.id}
              className={cn(
                'border-b last:border-0 transition-colors',
                row.isCurrentUser ? 'bg-primary/5' : 'hover:bg-muted/30',
              )}
            >
              <td className="px-4 py-3 text-center">
                {i < 3 ? (
                  <Medal className={cn('h-4 w-4 inline', medalColors[i])} />
                ) : (
                  <span className="text-muted-foreground">{i + 1}</span>
                )}
              </td>
              <td className="px-4 py-3 font-medium">
                {row.display_name}
                {row.isCurrentUser && (
                  <span className="ml-2 text-[10px] bg-primary/15 text-primary px-1.5 py-0.5 rounded-full font-semibold">you</span>
                )}
              </td>
              <td className="px-4 py-3 text-right font-bold">{row.total}</td>
              <td className="px-4 py-3 text-right text-muted-foreground">{row.r1}</td>
              <td className="px-4 py-3 text-right text-muted-foreground">{row.r2}</td>
              <td className="px-4 py-3 text-right text-muted-foreground">{row.r3}</td>
              <td className="px-4 py-3 text-right text-muted-foreground">{row.r4}</td>
              <td className="px-4 py-3 text-right text-muted-foreground">{row.preBet}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
