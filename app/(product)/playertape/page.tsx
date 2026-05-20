"use client"

import { ProductViewClient } from "@/components/product/product-view-client"
import { PlayerTapeView } from "@/components/product/views/playertape-view"

export default function PlayerTapePage() {
  return (
    <ProductViewClient>
      {({ onSelectPlayer }) => <PlayerTapeView onSelectPlayer={onSelectPlayer} />}
    </ProductViewClient>
  )
}
