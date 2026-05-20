"use client"

import { ProductViewClient } from "@/components/product/product-view-client"
import { SnapshotView } from "@/components/product/views/snapshot-view"

export default function SnapshotPage() {
  return (
    <ProductViewClient>
      {({ onSelectPlayer }) => <SnapshotView onSelectPlayer={onSelectPlayer} />}
    </ProductViewClient>
  )
}
