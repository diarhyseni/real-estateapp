"use client"

import { useState } from "react"
import Image from "next/image"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, X } from "lucide-react"

interface ImageGalleryProps {
  images: string[]
}

export function ImageGallery({ images }: ImageGalleryProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [displayOrder, setDisplayOrder] = useState(images.map((_, index) => index))

  const showGalleryButton = images.length > 5

  const handlePrevious = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  const handleThumbnailClick = (index: number, isLastThumbnail: boolean) => {
    if (isLastThumbnail && showGalleryButton) {
      setIsOpen(true)
      setCurrentImageIndex(displayOrder[index])
    } else {
      // Swap the positions in displayOrder
      setDisplayOrder(prev => {
        const newOrder = [...prev]
        const mainImageIndex = newOrder[0]
        newOrder[0] = newOrder[index]
        newOrder[index] = mainImageIndex
        return newOrder
      })
    }
  }

  // Get the actual images in their display order
  const orderedImages = displayOrder.map(index => images[index])

  return (
    <>
      <div className="space-y-2">
        {/* Main large image */}
        <div className="aspect-[16/9] overflow-hidden rounded-lg">
          <Image
            src={orderedImages[0] || "/placeholder.svg"}
            alt="Main property image"
            width={800}
            height={450}
            className="h-full w-full object-cover"
          />
        </div>

        {/* Thumbnail grid */}
        <div className="grid grid-cols-4 gap-2">
          {orderedImages.slice(1, 5).map((image, i) => {
            const isLastThumbnail = i === 3 && showGalleryButton;
            return (
              <div 
                key={displayOrder[i + 1]} 
                className="relative aspect-[4/3] overflow-hidden rounded-lg cursor-pointer"
                onClick={() => handleThumbnailClick(i + 1, isLastThumbnail)}
              >
                <Image
                  src={image}
                  alt={`Property image ${i + 2}`}
                  width={200}
                  height={150}
                  className="h-full w-full object-cover"
                />
                {isLastThumbnail && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white font-medium hover:bg-black/60 transition-colors">
                    +{images.length - 5} more
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Gallery Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-7xl bg-black/95 border-none">
          <DialogTitle className="sr-only">Property Image Gallery</DialogTitle>
          <div className="relative h-[80vh]">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4 z-50 text-white hover:bg-white/20"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-6 w-6" />
            </Button>
            
            {/* Main gallery image */}
            <div className="relative h-full flex items-center justify-center">
              <Image
                src={images[currentImageIndex]}
                alt={`Property image ${currentImageIndex + 1}`}
                fill
                className="object-contain"
              />
              
              {/* Navigation buttons */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 z-50 text-white hover:bg-white/20"
                onClick={handlePrevious}
              >
                <ChevronLeft className="h-8 w-8" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 z-50 text-white hover:bg-white/20"
                onClick={handleNext}
              >
                <ChevronRight className="h-8 w-8" />
              </Button>
            </div>

            {/* Image counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white bg-black/50 px-4 py-2 rounded-full">
              {currentImageIndex + 1} / {images.length}
            </div>
          </div>

          {/* Thumbnails */}
          <div className="overflow-x-auto">
            <div className="flex gap-2 p-4">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden ${
                    index === currentImageIndex ? "ring-2 ring-white" : ""
                  }`}
                >
                  <Image
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
} 