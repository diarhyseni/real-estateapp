import type { Metadata } from "next"
import { Outfit } from "next/font/google"
import "./globals.css"
import { Toaster as HotToaster } from "react-hot-toast"
import { FavoritesProvider } from "@/lib/favorites-context"
import AuthProvider from "@/components/providers/session-provider"

const outfit = Outfit({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Mitrovica Real Estate",
  description: "Find your dream property in Kosovo",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={outfit.className} suppressHydrationWarning>
        <AuthProvider>
          <FavoritesProvider>
            {children}
            <HotToaster position="top-right" />
          </FavoritesProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
