"use client"

import type { Player } from "@/lib/mock"
import { useRouter } from "next/navigation"
import type { ReactNode } from "react"

type ProductViewClientProps = {
  children: (handlers: {
    onSelectPlayer: (player: Player) => void
  }) => ReactNode
}

/** Wires prototype onSelectPlayer → /players?demo=id until dynamic routes exist. */
export function ProductViewClient({ children }: ProductViewClientProps) {
  const router = useRouter()

  function onSelectPlayer(player: Player) {
    router.push(`/players?player=${encodeURIComponent(player.id)}`)
  }

  return <>{children({ onSelectPlayer })}</>
}
