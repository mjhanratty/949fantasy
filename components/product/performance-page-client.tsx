"use client"

import { StatisticsView } from "@/components/product/views/performance-view"
import { ProductViewClient } from "@/components/product/product-view-client"
import { useState } from "react"

export function PerformancePageClient({
  initialTab = "performance",
}: {
  initialTab?: "performance" | "trends"
}) {
  const [tab, setTab] = useState(initialTab)

  return (
    <ProductViewClient>
      {({ onSelectPlayer }) => (
        <StatisticsView tab={tab} setTab={setTab} onSelectPlayer={onSelectPlayer} />
      )}
    </ProductViewClient>
  )
}
