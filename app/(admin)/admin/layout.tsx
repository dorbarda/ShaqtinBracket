import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <div className="border-b mb-6 pb-4 flex gap-2 flex-wrap">
        <Link href="/admin/season"><Button variant="outline" size="sm">Season</Button></Link>
        <Link href="/admin/teams"><Button variant="outline" size="sm">Teams</Button></Link>
        <Link href="/admin/bracket"><Button variant="outline" size="sm">Bracket</Button></Link>
        <Link href="/admin/results"><Button variant="outline" size="sm">Results</Button></Link>
        <Link href="/admin/betting"><Button variant="outline" size="sm">Betting</Button></Link>
      </div>
      {children}
    </div>
  )
}
