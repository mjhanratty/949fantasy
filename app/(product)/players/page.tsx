import { Suspense } from "react"
import { PlayerPageClient } from "@/components/product/player-page-client"

export default function PlayersPage() {
  return (
    <Suspense fallback={<div className="view-enter p-8 text-slate-text">Loading player…</div>}>
      <PlayerPageClient />
    </Suspense>
  )
}
