"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function HeroButtons() {
  const router = useRouter()

  return (
    <div className="flex gap-4">
      <Button 
        className="bg-brand-primary hover:bg-brand-primary/90 text-white px-8 py-6 text-lg border border-[1px] border-white"
        onClick={() => {
          document.getElementById('pronat-e-fundit')?.scrollIntoView({ behavior: 'smooth' })
        }}
      >
        Shiko Pronat
      </Button>
      <Button 
        variant="outline" 
        className="border border-[1px] border-brand-primary text-[#0D1831] hover:bg-white px-8 py-6 text-lg"
        onClick={() => router.push('/contact')}
      >
        Ofro pronën
      </Button>
    </div>
  )
} 