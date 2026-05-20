"use client"

import { ProductViewClient } from "@/components/product/product-view-client"
import { StadiumMap } from "@/components/product/views/stadium-map"

export function GamesPageClient() {
  return (
    <div className="view-enter mx-auto max-w-[1280px] px-8 py-8">
      <ProductViewClient>
        {({ onSelectPlayer }) => <StadiumMap onSelectPlayer={onSelectPlayer} />}
      </ProductViewClient>
    </div>
  )
}
