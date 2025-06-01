"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Building,
  Users,
  Settings,
  LogOut,
  PlusCircle,
  List,
  UserPlus,
  Tag,
  Layers,
  Home,
  User,
  Mail,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { logoutUser } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()

  const handleLogout = async () => {
    await logoutUser()
    router.push("/login")
  }

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(`${path}/`)
  }

  const navItems = [
    {
      title: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
    },
    {
      title: "Kontaktet",
      href: "/admin/contacts",
      icon: Mail,
    },
    {
      title: "Kategoritë",
      href: "/admin/categories",
      icon: Tag,
      children: [
        {
          title: "Të gjitha kategoritë",
          href: "/admin/categories",
          icon: List,
        },
        {
          title: "Shto kategori",
          href: "/admin/categories/new",
          icon: PlusCircle,
        },
      ],
    },
    {
      title: "Llojet",
      href: "/admin/types",
      icon: Layers,
      children: [
        {
          title: "Të gjitha llojet",
          href: "/admin/types",
          icon: List,
        },
        {
          title: "Shto lloj",
          href: "/admin/types/new",
          icon: PlusCircle,
        },
      ],
    },
    {
      title: "Përdoruesit",
      href: "/admin/users",
      icon: Users,
      children: [
        {
          title: "Të gjithë përdoruesit",
          href: "/admin/users",
          icon: List,
        },
        {
          title: "Shto përdorues",
          href: "/admin/users/new",
          icon: UserPlus,
        },
      ],
    },
    {
      title: "Profili im",
      href: "/profile",
      icon: User,
    },
  ]

  return (
    <div className="w-64 bg-white border-r min-h-screen">
      <div className="p-6 flex items-center gap-2">
        <h2 className="text-lg font-bold text-brand-primary">Admin Panel</h2>
      </div>
      <nav className="px-4 pb-4">
        <Link
          href="/"
          className="flex items-center gap-2 mb-6 text-sm font-medium text-slate-600 hover:text-brand-primary px-3 py-2"
        >
          <Home className="h-4 w-4" />
          Kthehu në faqen kryesore
        </Link>

        <ul className="space-y-1">
          {navItems.map((item, i) => {
            if (item.title === "Përdoruesit" && session?.user?.role !== "admin") {
              return null
            }
            return (
              <li key={i}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                    isActive(item.href) ? "bg-brand-primary text-white" : "text-slate-700 hover:bg-slate-100",
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.title}
                </Link>
                {item.children && (
                  <ul className="ml-6 mt-1 space-y-1">
                    {item.children.map((child, j) => (
                      <li key={j}>
                        <Link
                          href={child.href}
                          className={cn(
                            "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                            pathname === child.href
                              ? "bg-brand-primary/10 text-brand-primary font-medium"
                              : "text-slate-700 hover:bg-slate-100",
                          )}
                        >
                          <child.icon className="h-4 w-4" />
                          {child.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            )
          })}
        </ul>
        <div className="mt-6 pt-6 border-t">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" />
            Dilni
          </button>
        </div>
      </nav>
    </div>
  )
}
