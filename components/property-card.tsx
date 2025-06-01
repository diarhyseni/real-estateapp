"use client"

import type React from "react"
import Link from "next/link"
import Image from "next/image"
import { Heart, Share2, MapPin, Maximize2, Bed, Bath, Car } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Facebook,
  Twitter,
  Linkedin,
  Mail,
  MessageCircle,
  Send,
  Copy,
} from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn, formatPrice } from "@/lib/utils"
import { useFavorites } from "@/lib/favorites-context"
import { Property } from "@/lib/types"

interface PropertyCardProps {
  property: Property
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const { isFavorite, addFavorite, removeFavorite } = useFavorites()
  const favorite = isFavorite(property.id)
  const isRental = property.statuses?.includes('RENT')
  const isSale = property.statuses?.includes('SALE')
  const [shareOpen, setShareOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const propertyUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/property/${property.id}`
      : ''

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (favorite) {
      removeFavorite(property.id)
    } else {
      addFavorite(property.id)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(propertyUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <Link href={`/property/${property.id}`} className="group">
      <div className="overflow-hidden rounded-lg border bg-white transition-all hover:shadow-md">
        <div className="relative">
          <div className="aspect-[4/3] w-full overflow-hidden">
            <Image
              src={property.images?.[0] || "/placeholder.svg?height=300&width=400"}
              alt={property.title}
              width={400}
              height={300}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          </div>
          <div className="absolute top-2 right-2 flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white"
              onClick={toggleFavorite}
            >
              <Heart
                className={cn("h-4 w-4", favorite ? "fill-brand-secondary text-brand-secondary" : "text-slate-600")}
              />
              <span className="sr-only">Add to favorites</span>
            </Button>
            <Dialog open={shareOpen} onOpenChange={setShareOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white"
                  onClick={e => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShareOpen(true);
                  }}
                >
                  <Share2 className="h-4 w-4 text-slate-600" />
                  <span className="sr-only">Share property</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Share</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-4 gap-4 mb-4">
                  <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(propertyUrl)}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 hover:bg-slate-100 rounded-lg p-2">
                    <Twitter className="h-8 w-8 text-[#1da1f2]" />
                    <span className="text-xs">Twitter</span>
                  </a>
                  <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(propertyUrl)}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 hover:bg-slate-100 rounded-lg p-2">
                    <Facebook className="h-8 w-8 text-[#1877f3]" />
                    <span className="text-xs">Facebook</span>
                  </a>
                  <a href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(propertyUrl)}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 hover:bg-slate-100 rounded-lg p-2">
                    <Linkedin className="h-8 w-8 text-[#0077b5]" />
                    <span className="text-xs">LinkedIn</span>
                  </a>
                  <a href={`https://www.facebook.com/dialog/send?link=${encodeURIComponent(propertyUrl)}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 hover:bg-slate-100 rounded-lg p-2">
                    <MessageCircle className="h-8 w-8 text-[#1877f3]" />
                    <span className="text-xs">Messenger</span>
                  </a>
                  <a href={`https://t.me/share/url?url=${encodeURIComponent(propertyUrl)}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 hover:bg-slate-100 rounded-lg p-2">
                    <Send className="h-8 w-8 text-[#229ed9]" />
                    <span className="text-xs">Telegram</span>
                  </a>
                  <a href={`viber://forward?text=${encodeURIComponent(propertyUrl)}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 hover:bg-slate-100 rounded-lg p-2">
                    <Send className="h-8 w-8 text-[#7360f2]" />
                    <span className="text-xs">Viber</span>
                  </a>
                  <a href={`https://wa.me/?text=${encodeURIComponent(propertyUrl)}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 hover:bg-slate-100 rounded-lg p-2">
                    <Send className="h-8 w-8 text-[#25d366]" />
                    <span className="text-xs">WhatsApp</span>
                  </a>
                  <a href={`mailto:?subject=Shiko këtë pronë&body=${encodeURIComponent(propertyUrl)}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 hover:bg-slate-100 rounded-lg p-2">
                    <Mail className="h-8 w-8 text-[#888]" />
                    <span className="text-xs">Email</span>
                  </a>
                </div>
                <div className="flex items-center gap-2 bg-slate-100 rounded px-3 py-2">
                  <input
                    type="text"
                    value={propertyUrl}
                    readOnly
                    className="flex-1 bg-transparent outline-none text-sm"
                    onFocus={e => e.target.select()}
                  />
                  <button onClick={e => { e.preventDefault(); e.stopPropagation(); handleCopy(); }} className="p-1 rounded hover:bg-slate-200">
                    <Copy className="h-5 w-5" />
                  </button>
                  {copied && <span className="text-xs text-green-600 ml-2">Copied!</span>}
                </div>
              </DialogContent>
            </Dialog>
          </div>
          {property.isExclusive && (
            <Badge className="absolute top-2 left-2 bg-brand-secondary hover:bg-brand-secondary/90">Ekskluzive</Badge>
          )}
          {(isRental || isSale) && (
            <Badge 
              variant={isRental ? "secondary" : "default"} 
              className="absolute bottom-2 left-2"
            >
              {isRental ? "Me qira" : "Në shitje"}
            </Badge>
          )}
        </div>
        <div className="p-4">
          <div className="mb-1 flex items-center gap-1 text-sm text-slate-500">
            <MapPin className="h-3.5 w-3.5" />
            <span>{property.location}</span>
          </div>
          <h3 className="mb-2 line-clamp-1 text-lg font-semibold">{property.title}</h3>
          <div className="flex items-center gap-x-2">
            <span className="font-semibold text-lg">
              {formatPrice(property.price, property.currency)}
            </span>
          </div>
          <div className="flex items-center justify-between border-t pt-4 text-sm text-slate-500">
            {property.bedrooms !== null && property.bedrooms !== undefined && (
              <div className="flex items-center gap-1">
                <Bed className="h-4 w-4" />
                <span>{property.bedrooms}</span>
              </div>
            )}
            {property.bathrooms !== null && property.bathrooms !== undefined && (
              <div className="flex items-center gap-1">
                <Bath className="h-4 w-4" />
                <span>{property.bathrooms}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Maximize2 className="h-4 w-4" />
              <span>{property.area} {property.areaUnit || 'm²'}</span>
            </div>
            {property.parking !== null && property.parking !== undefined && (
              <div className="flex items-center gap-1">
                <Car className="h-4 w-4" />
                <span>{property.parking}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
