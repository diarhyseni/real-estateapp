"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { Menu, Heart, User, ChevronDown, LogIn, UserPlus, Settings, LayoutDashboard, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { useSession, signOut } from "next-auth/react"
import { useFavorites } from "@/lib/favorites-context"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { usePathname } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ChevronRight } from "lucide-react"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [categoriesOpen, setCategoriesOpen] = useState(false)
  const [servicesOpen, setServicesOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { data: session, status, update: updateSession } = useSession()
  const [imageKey, setImageKey] = useState(0)
  const [prevImage, setPrevImage] = useState(session?.user?.image);
  const [categories, setCategories] = useState([])
  const { favorites } = useFavorites()

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
            <span className="text-xl font-bold text-brand-secondary">Real Estate</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/sale"
              className={cn(
                "nav-button ml-6 pr-4 border-r border-r-[#cccccc40]",
                isActive("/sale") && "active"
              )}
            >
              Në shitje
            </Link>
            <Link
              href="/rent"
              className={cn(
                "nav-button  pr-4 border-r border-r-[#cccccc40]",
                isActive("/rent") && "active"
              )}
            >
              Me qira
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
                className="hidden md:flex items-center gap-1 bg-white text-[#0D1831] hover:bg-gray-100 border border-white no-focus-ring"
                style={{ boxShadow: "none" }}
              >
                Kategoritë
                <ChevronDown className="h-4 w-4 ml-1 text-[#0D1831]" />
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
                className="hidden md:flex text-white hover:bg-brand-primary/90 hover:text-brand-secondary relative"
              >
           
                <div className="relative">
                  <Heart className="h-5 w-5" />
                  {favorites.length > 0 && (
                    <div className="absolute -top-1 -right-2 bg-red-500 text-white text-[12px] rounded-full h-3.5 w-3.5 flex items-center justify-center font-medium border border-white">
                      {favorites.length > 99 ? '99+' : favorites.length}
                    </div>
                  )}
                </div>
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
                  className="hidden md:flex items-center gap-2 text-white hover:bg-brand-primary/90 hover:text-brand-secondary no-focus-ring"
                  style={{ boxShadow: "none" }}
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
                  className="hidden md:flex text-white hover:bg-brand-primary/90 hover:text-brand-secondary no-focus-ring"
                  style={{ boxShadow: "none" }}
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
                        <div className="relative">
                          <Heart className="h-4 w-4" />
                          {favorites.length > 0 && (
                            <div className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] rounded-full h-3 w-3 flex items-center justify-center font-medium border border-white">
                              {favorites.length > 99 ? '99+' : favorites.length}
                            </div>
                          )}
                        </div>
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
                    <Link href="/favorites" className="flex items-center gap-2">
                      <div className="relative">
                        <Heart className="h-4 w-4" />
                        {favorites.length > 0 && (
                          <div className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] rounded-full h-3 w-3 flex items-center justify-center font-medium border border-white">
                            {favorites.length > 99 ? '99+' : favorites.length}
                          </div>
                        )}
                      </div>
                      <span>Të preferuarat</span>
                    </Link>
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
                <Menu className="h-6 w-6" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 bg-brand-primary text-white border-r border-brand-secondary">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              
              {/* User Profile Section */}
              {session && (
                <div className="flex items-center gap-3 p-4 border-b border-brand-secondary/30 mb-6">
                  <Avatar className="h-12 w-12 bg-brand-secondary text-white">
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
                  <div className="flex flex-col">
                    <span className="font-semibold text-white">{session.user.name}</span>
                    <span className="text-sm text-white/70">
                      {session.user.role === "admin"
                        ? "Administrator"
                        : session.user.role === "agent"
                        ? "Agjent"
                        : "Përdorues"}
                    </span>
                  </div>
                </div>
              )}

              <div className="space-y-6">
                {/* Categories Dropdown */}
                <div className="space-y-2">
                  <button
                    onClick={() => setCategoriesOpen(!categoriesOpen)}
                    className="flex items-center justify-between w-full text-lg font-semibold text-white hover:text-brand-secondary transition-colors"
                  >
                    Kategoritë
                    <ChevronDown className={`h-5 w-5 transition-transform ${categoriesOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {categoriesOpen && (
                    <nav className="ml-4 space-y-2 border-l border-brand-secondary/30 pl-4">
                      {categories.map((category: any) => (
                        <Link
                          key={category.id}
                          href={`/category/${category.value.toLowerCase()}`}
                          className="block text-base text-white/80 hover:text-brand-secondary transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {category.name}
                        </Link>
                      ))}
                    </nav>
                  )}
                </div>

                {/* Services Dropdown */}
                <div className="space-y-2">
                  <button
                    onClick={() => setServicesOpen(!servicesOpen)}
                    className="flex items-center justify-between w-full text-lg font-semibold text-white hover:text-brand-secondary transition-colors"
                  >
                    Shërbimet
                    <ChevronDown className={`h-5 w-5 transition-transform ${servicesOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {servicesOpen && (
                    <nav className="ml-4 space-y-2 border-l border-brand-secondary/30 pl-4">
                      <Link
                        href="/sale"
                        className={cn(
                          "block text-base text-white/80 hover:text-brand-secondary transition-colors",
                          isActive("/sale") && "text-brand-secondary font-medium"
                        )}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Në Shitje
                      </Link>
                      <Link
                        href="/rent"
                        className={cn(
                          "block text-base text-white/80 hover:text-brand-secondary transition-colors",
                          isActive("/rent") && "text-brand-secondary font-medium"
                        )}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Me Qira
                      </Link>
                      <Link
                        href="/exclusive"
                        className={cn(
                          "block text-base text-white/80 hover:text-brand-secondary transition-colors",
                          isActive("/exclusive") && "text-brand-secondary font-medium"
                        )}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Ekskluzive
                      </Link>
                    </nav>
                  )}
                </div>

                {/* User Actions */}
                {session ? (
                  <div className="space-y-2 pt-4 border-t border-brand-secondary/30">
                    <Link
                      href="/profile"
                      className="flex items-center gap-3 text-base text-white/80 hover:text-brand-secondary transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Settings className="h-5 w-5" />
                      <span>Profili im</span>
                    </Link>
                    
                    {/* Only show favorites for regular users (not admin or agent) */}
                    {session.user.role === "user" && (
                      <Link
                        href="/favorites"
                        className="flex items-center gap-3 text-base text-white/80 hover:text-brand-secondary transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <div className="relative">
                          <Heart className="h-5 w-5" />
                          {favorites.length > 0 && (
                            <div className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] rounded-full h-3 w-3 flex items-center justify-center font-medium border border-white">
                              {favorites.length > 99 ? '99+' : favorites.length}
                            </div>
                          )}
                        </div>
                        <span>Të preferuarat</span>
                      </Link>
                    )}
                    
                    {/* Admin/Agent Panel */}
                    {(session.user.role === "admin" || session.user.role === "agent") && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-3 text-base text-white/80 hover:text-brand-secondary transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <LayoutDashboard className="h-5 w-5" />
                        <span>Paneli i Administratorit</span>
                      </Link>
                    )}
                    
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center gap-3 text-base text-red-400 hover:text-red-300 transition-colors w-full"
                    >
                      <LogOut className="h-5 w-5" />
                      <span>Dilni</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2 pt-4 border-t border-brand-secondary/30">
                    <Link
                      href="/login"
                      className="flex items-center gap-3 text-base text-white/80 hover:text-brand-secondary transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <LogIn className="h-5 w-5" />
                      <span>Kyçu</span>
                    </Link>
                    <Link
                      href="/register"
                      className="flex items-center gap-3 text-base text-white/80 hover:text-brand-secondary transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <UserPlus className="h-5 w-5" />
                      <span>Regjistrohu</span>
                    </Link>
                    <Link
                      href="/favorites"
                      className="flex items-center gap-3 text-base text-white/80 hover:text-brand-secondary transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <div className="relative">
                        <Heart className="h-5 w-5" />
                        {favorites.length > 0 && (
                          <div className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] rounded-full h-3 w-3 flex items-center justify-center font-medium border border-white">
                            {favorites.length > 99 ? '99+' : favorites.length}
                          </div>
                        )}
                      </div>
                      <span>Të preferuarat</span>
                    </Link>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
