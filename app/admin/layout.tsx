"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Suspense } from "react"
import AdminSidebar from "@/components/admin/sidebar"
import Header from "@/components/header"
import { Toaster } from "@/components/ui/toaster"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { data: session, status } = useSession()

  const isAdminOrAgent = session && (session.user.role === "admin" || session.user.role === "agent")

  useEffect(() => {
    if (status === "loading") return

    if (!isAdminOrAgent) {
      router.push("/login?callbackUrl=/admin")
    }
  }, [session, status, router])

  // Track sidebar collapsed state in layout
  const [isCollapsed, setIsCollapsed] = useState(false)
  const sidebarWidth = isCollapsed ? 64 : 256 // px

  if (status === "loading") {
    return <div>Loading...</div>
  }

  if (!isAdminOrAgent) {
    return null
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      {/* Fixed Sidebar */}
      <div
        className="fixed top-16 left-0 z-40 h-[calc(100vh-64px)]"
        style={{ width: sidebarWidth }}
      >
        <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      </div>
      {/* Main Content */}
      <div style={{ marginLeft: sidebarWidth }}>
        <main className="p-6">
          <Suspense fallback={<div>Loading...</div>}>
            {children}
          </Suspense>
        </main>
      </div>
      <Toaster />
    </div>
  )
}
