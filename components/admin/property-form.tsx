"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"

export default function PropertyForm() {
  const router = useRouter()
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [categories, setCategories] = useState<{id: string, name: string, value: string}[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("")

  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        setCategories(data)
        if (data.length > 0) setSelectedCategory(data[0].id)
      })
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = Object.fromEntries(formData.entries())
    data.categoryId = selectedCategory
    delete data.category

    if (session?.user?.id) {
      data.userId = session.user.id
    }

    try {
      const response = await fetch('/api/properties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to create property')
      }

      router.refresh()
      e.currentTarget.reset()
      if (categories.length > 0) setSelectedCategory(categories[0].id)
    } catch (error) {
      console.error('Error creating property:', error)
      alert('Failed to create property')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" required />
        </div>
        <div>
          <Label htmlFor="type">Type</Label>
          <Select name="type" required>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="SALE">Sale</SelectItem>
              <SelectItem value="RENT">Rent</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="category">Category</Label>
          <Select name="category" required value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="price">Price</Label>
          <Input id="price" name="price" type="text" required />
        </div>
        <div>
          <Label htmlFor="currency">Currency</Label>
          <Select name="currency" defaultValue="EUR">
            <SelectTrigger>
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="EUR">EUR</SelectItem>
              <SelectItem value="USD">USD($)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="location">Location</Label>
          <Input id="location" name="location" required />
        </div>
        <div>
          <Label htmlFor="bedrooms">Bedrooms</Label>
          <Input id="bedrooms" name="bedrooms" type="number" />
        </div>
        <div>
          <Label htmlFor="bathrooms">Bathrooms</Label>
          <Input id="bathrooms" name="bathrooms" type="number" />
        </div>
        <div>
          <Label htmlFor="area">Area (m²)</Label>
          <Input id="area" name="area" type="number" required />
        </div>
        <div>
          <Label htmlFor="parking">Parking Spaces</Label>
          <Input id="parking" name="parking" type="number" />
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" />
      </div>

      <div>
        <Label htmlFor="image">Image URL</Label>
        <Input id="image" name="image" type="url" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center space-x-2">
          <Checkbox id="isExclusive" name="isExclusive" value="true" />
          <Label htmlFor="isExclusive">Exclusive Property</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="hasBalcony" name="hasBalcony" value="true" />
          <Label htmlFor="hasBalcony">Has Balcony</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="hasParking" name="hasParking" value="true" />
          <Label htmlFor="hasParking">Has Parking</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="hasElevator" name="hasElevator" value="true" />
          <Label htmlFor="hasElevator">Has Elevator</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="isFurnished" name="isFurnished" value="true" />
          <Label htmlFor="isFurnished">Is Furnished</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="hasAC" name="hasAC" value="true" />
          <Label htmlFor="hasAC">Has Air Conditioning</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="hasHeating" name="hasHeating" value="true" />
          <Label htmlFor="hasHeating">Has Heating</Label>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="address">Address</Label>
          <Input id="address" name="address" />
        </div>
        <div>
          <Label htmlFor="city">City</Label>
          <Input id="city" name="city" defaultValue="Mitrovicë" />
        </div>
        <div>
          <Label htmlFor="postalCode">Postal Code</Label>
          <Input id="postalCode" name="postalCode" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="latitude">Latitude</Label>
          <Input id="latitude" name="latitude" type="number" step="any" />
        </div>
        <div>
          <Label htmlFor="longitude">Longitude</Label>
          <Input id="longitude" name="longitude" type="number" step="any" />
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Adding...' : 'Add Property'}
        </Button>
      </div>
    </form>
  )
} 