"use client"

import { ProductViewClient } from "@/components/product/product-view-client"
import { RankingsView } from "@/components/product/views/rankings-view"

export default function RankingsPage() {
  return (
    <ProductViewClient>
      {({ onSelectPlayer }) => <RankingsView onSelectPlayer={onSelectPlayer} />}
    </ProductViewClient>
  )
}
