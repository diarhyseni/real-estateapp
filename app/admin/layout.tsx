"use client"

import type React from "react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import AdminSidebar from "@/components/admin/sidebar"
import Header from "@/components/header"

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

  if (status === "loading") {
    return <div>Loading...</div>
  }

  if (!isAdminOrAgent) {
    return null
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex-1 flex">
        <AdminSidebar />
        <main className="flex-1 p-6 bg-slate-50">{children}</main>
      </div>
    </div>
  )
}
