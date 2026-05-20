import { AppChrome } from "@/components/app/app-chrome"

export default function ProductLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AppChrome>{children}</AppChrome>
}
