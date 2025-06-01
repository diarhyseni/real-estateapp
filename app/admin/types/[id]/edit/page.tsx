"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"

export default function EditTypePage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string
  const [formData, setFormData] = useState({ name: "", value: "" })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!id) return
    fetch(`/api/types`)
      .then(res => res.json())
      .then(data => {
        const type = data.find((t: any) => t.id === id)
        if (type) setFormData({ name: type.name, value: type.value })
      })
  }, [id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    const res = await fetch(`/api/types/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })
    setIsLoading(false)
    if (res.ok) {
      toast({ title: "Lloji u përditësua me sukses" })
      router.push("/admin/types")
    } else {
      toast({ title: "Gabim", description: "Nuk u përditësua lloji" })
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10">
      <Card>
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold mb-4">Ndrysho Llojin</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Emri</Label>
              <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="value">Vlera (unikat)</Label>
              <Input id="value" name="value" value={formData.value} onChange={handleChange} required />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Duke ruajtur..." : "Ruaj ndryshimet"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 