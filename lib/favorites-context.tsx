"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast"

type FavoritesContextType = {
  favorites: string[]
  addFavorite: (propertyId: string) => void
  removeFavorite: (propertyId: string) => void
  isFavorite: (propertyId: string) => boolean
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>([])
  const { data: session, status } = useSession()
  const router = useRouter();

  // Load favorites from localStorage on mount and when session changes
  useEffect(() => {
    if (status === 'loading') return; // Wait for session to load

    const storedFavorites = localStorage.getItem("favorites")
    if (storedFavorites) {
      try {
        const parsedFavorites = JSON.parse(storedFavorites)
        console.log('Loaded favorites from localStorage:', parsedFavorites)
        setFavorites(parsedFavorites)
      } catch (e) {
        console.error("Failed to parse favorites from localStorage", e)
        setFavorites([])
      }
    } else {
      console.log('No favorites found in localStorage')
      setFavorites([])
    }
  }, [status])

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    if (favorites.length > 0) {
      localStorage.setItem("favorites", JSON.stringify(favorites))
      console.log('Saved favorites to localStorage:', favorites)
    } else {
      localStorage.removeItem("favorites")
      console.log('Removed favorites from localStorage')
    }
  }, [favorites])

  const addFavorite = (propertyId: string) => {
    if (!session?.user) {
      toast.error("Ju duhet të kyçeni për të shtuar prona në të preferuarat", {
        id: "login-required",
        duration: 4000,
      });
      return;
    }
    setFavorites((prev) => {
      if (prev.includes(propertyId)) return prev;
      return [...prev, propertyId];
    });
  }

  const removeFavorite = (propertyId: string) => {
    console.log('removeFavorite called with propertyId:', propertyId)
    setFavorites((prev) => prev.filter((id) => id !== propertyId))
  }

  const isFavorite = (propertyId: string) => {
    const result = favorites.includes(propertyId)
    console.log('isFavorite check for propertyId:', propertyId, 'result:', result)
    return result
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
