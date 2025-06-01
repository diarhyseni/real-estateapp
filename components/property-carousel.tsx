"use client"

import { useEffect, useState } from "react"
import useEmblaCarousel from "embla-carousel-react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import PropertyCard from "@/components/property-card"
import { Property } from "@/lib/types"

interface PropertyCarouselProps {
  properties: Property[]
}

export default function PropertyCarousel({ properties }: PropertyCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: false,
    slidesToScroll: 1,
  })

  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(true)

  const onSelect = () => {
    if (!emblaApi) return
    setCanScrollPrev(emblaApi.canScrollPrev())
    setCanScrollNext(emblaApi.canScrollNext())
  }

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on('select', onSelect)
    emblaApi.on('reInit', onSelect)
    return () => {
      emblaApi.off('select', onSelect)
      emblaApi.off('reInit', onSelect)
    }
  }, [emblaApi])

  const scrollPrev = () => emblaApi && emblaApi.scrollPrev()
  const scrollNext = () => emblaApi && emblaApi.scrollNext()

  return (
    <div className="relative">
      <div className="flex items-center justify-end mb-4">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full bg-white/10 hover:bg-white/20 border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={scrollPrev}
            disabled={!canScrollPrev}
          >
            <ChevronLeft className="h-5 w-5 text-white" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full bg-white/10 hover:bg-white/20 border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={scrollNext}
            disabled={!canScrollNext}
          >
            <ChevronRight className="h-5 w-5 text-white" />
          </Button>
        </div>
      </div>
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-6">
          {properties.map((property) => (
            <div key={property.id} className="flex-[0_0_100%] md:flex-[0_0_50%] lg:flex-[0_0_33.333%] min-w-0">
              <PropertyCard property={property} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 