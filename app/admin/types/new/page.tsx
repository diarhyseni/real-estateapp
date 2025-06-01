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

export default function NewTypePage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    value: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const res = await fetch("/api/types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        throw new Error("Failed to create type")
      }

      toast({
        title: "Lloji u shtua me sukses",
        description: "Lloji i ri u shtua në sistem.",
      })

      router.push("/admin/types")
      router.refresh()
    } catch (error) {
      toast({
        title: "Gabim",
        description: "Lloji nuk u shtua. Ju lutemi provoni përsëri.",
        action: <ToastAction altText="Try again">Provo përsëri</ToastAction>,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10">
      <Button
        variant="ghost"
        className="mb-4"
        onClick={() => router.back()}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Kthehu
      </Button>

      <Card>
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold mb-4">Shto Llojin e ri</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Emri</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="P.sh. Në shitje"
                required
              />
            </div>
            <div>
              <Label htmlFor="value">Vlera (unikat)</Label>
              <Input
                id="value"
                name="value"
                value={formData.value}
                onChange={handleChange}
                placeholder="P.sh. sale"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Duke shtuar..." : "Shto tip"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
