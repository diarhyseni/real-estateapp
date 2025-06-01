"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useSession } from "next-auth/react"
import { toast, useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

type FavoritesContextType = {
  favorites: string[]
  addFavorite: (propertyId: string) => void
  removeFavorite: (propertyId: string) => void
  isFavorite: (propertyId: string) => boolean
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)

function useLoginToast() {
  const { toast } = useToast();
  const router = useRouter();
  return () =>
    toast({
      title: "Ju duhet të kyçeni për të shtuar prona në të preferuarat",
      action: (
        <button
          className="ml-4 px-4 py-2 rounded bg-brand-primary text-white hover:bg-brand-primary/90 transition-colors"
          onClick={() => router.push('/login')}
        >
          Kyçu
        </button>
      ),
    });
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>([])
  const { data: session } = useSession()
  const router = useRouter();
  const showLoginToast = useLoginToast();

  // Load favorites from localStorage on mount
  useEffect(() => {
    const storedFavorites = localStorage.getItem("favorites")
    if (storedFavorites) {
      try {
        setFavorites(JSON.parse(storedFavorites))
      } catch (e) {
        console.error("Failed to parse favorites from localStorage", e)
        setFavorites([])
      }
    }
  }, [])

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites))
  }, [favorites])

  const addFavorite = (propertyId: string) => {
    if (!session?.user) {
      showLoginToast();
      return
    }

    setFavorites((prev) => {
      if (prev.includes(propertyId)) {
        return prev
      }
      return [...prev, propertyId]
    })
  }

  const removeFavorite = (propertyId: string) => {
    setFavorites((prev) => prev.filter((id) => id !== propertyId))
  }

  const isFavorite = (propertyId: string) => {
    return favorites.includes(propertyId)
  }

  return (
    <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const context = useContext(FavoritesContext)
  if (context === undefined) {
    throw new Error("useFavorites must be used within a FavoritesProvider")
  }
  return context
}
