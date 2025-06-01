"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { Menu, Heart, User, ChevronDown, LogIn, UserPlus, Settings, LayoutDashboard, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { useSession, signOut } from "next-auth/react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { usePathname } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [categories, setCategories] = useState([])
  const pathname = usePathname()
  const router = useRouter()
  const { data: session, status, update: updateSession } = useSession()
  const [imageKey, setImageKey] = useState(Date.now())
  const [prevImage, setPrevImage] = useState(session?.user?.image);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories")
        const data = await res.json()
        setCategories(data)
      } catch (error) {
        console.error("Error fetching categories:", error)
      }
    }
    fetchCategories()
  }, [])

  useEffect(() => {
    if (session?.user?.image && session?.user?.image !== prevImage) {
      setImageKey(Date.now());
      setPrevImage(session?.user?.image);
    }
  }, [session?.user?.image, prevImage]);

  const isActive = (path: string) => pathname === path

  const handleLogout = async () => {
    await signOut({ redirect: false })
    router.push("/")
  }

  const getInitials = (name: string) => {
    if (!name) return ""
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const isAdmin = session?.user?.role === "admin"


  return (
    <header className="sticky top-0 z-50 w-full border-b bg-brand-primary text-white">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-brand-secondary">Roka Real Estate</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/sale"
              className={cn(
                "nav-button",
                isActive("/sale") && "active"
              )}
            >
              Në Shitje
            </Link>
            <Link
              href="/rent"
              className={cn(
                "nav-button",
                isActive("/rent") && "active"
              )}
            >
              Me Qira
            </Link>
            <Link
              href="/exclusive"
              className={cn(
                "nav-button",
                isActive("/exclusive") && "active"
              )}
            >
              Ekskluzive
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="default"
                className="hidden md:flex items-center gap-1 bg-brand-primary text-white hover:bg-brand-primary/90 border border-brand-secondary"
              >
                Kategoritë
                <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-white">
              {categories.map((category: any) => (
                <DropdownMenuItem key={category.id} asChild className="cursor-pointer">
                  <Link href={`/category/${category.value.toLowerCase()}`}>{category.name}</Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Only show favorites button for non-admin users */}
          {!isAdmin && (
            <Link href="/favorites">
              <Button
                variant="ghost"
                size="icon"
                className="hidden md:flex text-white hover:bg-brand-primary/90 hover:text-brand-secondary"
              >
                <Heart className="h-5 w-5" />
                <span className="sr-only">Të preferuarat</span>
              </Button>
            </Link>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              {session ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden md:flex items-center gap-2 text-white hover:bg-brand-primary/90 hover:text-brand-secondary"
                >
                  <Avatar className="h-8 w-8 bg-brand-secondary text-white">
                    {session?.user?.image ? (
                      <AvatarImage 
                        key={imageKey}
                        src={session.user.image}
                        alt={session?.user?.name || ''} 
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          console.error('Failed to load image:', session.user.image);
                        }}
                      />
                    ) : null}
                    <AvatarFallback className="bg-brand-secondary text-white">
                      {getInitials(session?.user?.name || "")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start text-xs">
                    <span className="font-medium">{session.user.name}</span>
                    <span className="text-white/70">
                      {session.user.role === "admin"
                        ? "Administrator"
                        : session.user.role === "agent"
                        ? "Agjent"
                        : "Përdorues"}
                    </span>
                  </div>
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  className="hidden md:flex text-white hover:bg-brand-primary/90 hover:text-brand-secondary"
                >
                  <User className="h-5 w-5" />
                  <span className="sr-only">Llogaria</span>
                </Button>
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-white">
              {session ? (
                <>
                  <div className="px-2 py-1.5 text-sm font-medium text-gray-900">{session.user.email}</div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/profile" className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      <span>Profili im</span>
                    </Link>
                  </DropdownMenuItem>
                  {/* Only show favorites for regular users (not admin or agent) */}
                  {session.user.role === "user" && (
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link href="/favorites" className="flex items-center gap-2">
                        <Heart className="h-4 w-4" />
                        <span>Të preferuarat</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {(session.user.role === "admin" || session.user.role === "agent") && (
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link href="/admin" className="flex items-center gap-2">
                        <LayoutDashboard className="h-4 w-4" />
                        <span>Paneli i Administratorit</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer text-red-600" onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    <span>Dilni</span>
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/login" className="flex items-center gap-2">
                      <LogIn className="h-4 w-4" />
                      <span>Kyçu</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/register" className="flex items-center gap-2">
                      <UserPlus className="h-4 w-4" />
                      <span>Regjistrohu</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/favorites">Të preferuarat</Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-white hover:bg-brand-primary/90 hover:text-brand-secondary"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <div className="grid gap-6 py-6">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Kategoritë</h4>
                  <nav className="grid gap-2">
                    {categories.map((category: any) => (
                      <Link
                        key={category.id}
                        href={`/category/${category.value.toLowerCase()}`}
                        className="text-base font-medium hover:text-brand-secondary"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {category.name}
                      </Link>
                    ))}
                  </nav>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Shërbimet</h4>
                  <nav className="grid gap-4">
                    <Link
                      href="/sale"
                      className={cn(
                        "text-base font-medium hover:text-brand-secondary",
                        isActive("/sale") && "text-brand-secondary font-medium"
                      )}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Në Shitje
                    </Link>
                    <Link
                      href="/rent"
                      className={cn(
                        "text-base font-medium hover:text-brand-secondary",
                        isActive("/rent") && "text-brand-secondary font-medium"
                      )}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Me Qira
                    </Link>
                    <Link
                      href="/exclusive"
                      className={cn(
                        "text-base font-medium hover:text-brand-secondary",
                        isActive("/exclusive") && "text-brand-secondary font-medium"
                      )}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Ekskluzive
                    </Link>
                  </nav>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
