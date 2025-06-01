"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { ToastAction } from "@/components/ui/toast"

export default function NewCategoryPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    value: "",
  })
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      const result = await response.json()
      if (!response.ok) {
        setError(result.error || "Gabim gjatë shtimit të kategorisë.")
        setIsSubmitting(false)
        return
      }
      toast({
        title: "Kategoria u krijua me sukses",
        description: "Kategoria e re u shtua në sistem.",
        action: <ToastAction altText="Shiko">Shiko</ToastAction>,
      })
      router.push("/admin/categories")
    } catch (error) {
      setError("Gabim gjatë shtimit të kategorisë.")
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.push("/admin/categories")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">Shto kategori të re</h1>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Emri i kategorisë</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="p.sh. Shtëpi"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="value">Vlera (për përdorim në sistem)</Label>
                <Input
                  id="value"
                  name="value"
                  placeholder="p.sh. house"
                  value={formData.value}
                  onChange={handleChange}
                  required
                />
                <p className="text-xs text-slate-500">
                  Vlera duhet të jetë unike dhe të përmbajë vetëm shkronja të vogla, numra dhe underscore.
                </p>
              </div>
            </div>

            {error && <div className="text-red-600">{error}</div>}

            <div className="flex justify-end gap-4 mt-6">
              <Button variant="outline" type="button" onClick={() => router.push("/admin/categories")}>
                Anulo
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Duke ruajtur..." : "Ruaj kategorinë"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
