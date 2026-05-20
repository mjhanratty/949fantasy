"use client"

import { PLAYERS } from "@/lib/mock"
import { PlayerDetailView } from "@/components/product/views/player-detail-view"
import { useRouter, useSearchParams } from "next/navigation"

export function PlayerPageClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const id = searchParams.get("player") ?? "jchase"
  const player = PLAYERS.find((p) => p.id === id) ?? PLAYERS[0]

  return (
    <PlayerDetailView
      player={player}
      onBack={() => router.push("/rankings")}
    />
  )
}
