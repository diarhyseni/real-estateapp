"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import React from "react"

export default function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params)
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "user",
    password: ""
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/users/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          toast({ title: "Gabim", description: data.error, variant: "destructive" })
          router.push("/admin/users")
        } else {
          setFormData({ name: data.name, email: data.email, role: data.role, password: "" })
        }
        setLoading(false)
      })
  }, [id, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleRoleChange = (value: string) => {
    setFormData((prev) => ({ ...prev, role: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update user')
      }
      toast({ title: "Përdoruesi u përditësua me sukses" })
      router.push("/admin/users")
    } catch (error: any) {
      toast({ title: "Gabim", description: error.message, variant: "destructive" })
      setIsSubmitting(false)
    }
  }

  if (loading) return <div className="p-6">Duke ngarkuar...</div>

  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.push("/admin/users")}> <ArrowLeft className="h-4 w-4" /> </Button>
        <h1 className="text-3xl font-bold">Ndrysho përdoruesin</h1>
      </div>
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Emri i plotë</Label>
                <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Roli</Label>
                <Select value={formData.role} onValueChange={handleRoleChange}>
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Zgjidhni rolin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Përdorues</SelectItem>
                    <SelectItem value="agent">Agjent</SelectItem>
                    <SelectItem value="admin">Administrator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Fjalëkalimi i ri (opsional)</Label>
                <Input id="password" name="password" type="password" value={formData.password} onChange={handleChange} placeholder="••••••••" />
              </div>
            </div>
            <div className="flex justify-end gap-4 mt-6">
              <Button variant="outline" type="button" onClick={() => router.push("/admin/users")}>Anulo</Button>
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Duke ruajtur..." : "Ruaj ndryshimet"}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 