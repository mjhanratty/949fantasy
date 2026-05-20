"use client"

import { MetricsView } from "@/components/product/views/metrics-view"
import { ProductViewClient } from "@/components/product/product-view-client"
import { useState } from "react"

export function MetricsPageClient({
  initialTab = "weekly",
}: {
  initialTab?: "weekly" | "standings" | "position"
}) {
  const [tab, setTab] = useState(initialTab)

  return (
    <ProductViewClient>
      {({ onSelectPlayer }) => (
        <MetricsView tab={tab} setTab={setTab} onSelectPlayer={onSelectPlayer} />
      )}
    </ProductViewClient>
  )
}
