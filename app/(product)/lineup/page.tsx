"use client"

import { ProductViewClient } from "@/components/product/product-view-client"
import { LineupView } from "@/components/product/views/lineup-view"

export default function LineupPage() {
  return (
    <ProductViewClient>
      {({ onSelectPlayer }) => <LineupView onSelectPlayer={onSelectPlayer} />}
    </ProductViewClient>
  )
}
