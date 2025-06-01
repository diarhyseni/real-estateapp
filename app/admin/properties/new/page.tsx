"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Upload, X, Plus, MapPin, Loader2 } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/use-toast"
import { ToastAction } from "@/components/ui/toast"

function RequiredLabel({ children }: { children: React.ReactNode }) {
  return (
    <Label>
      {children} <span className="text-red-500">*</span>
    </Label>
  )
}

export default function NewPropertyPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [images, setImages] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [googleMapsUrl, setGoogleMapsUrl] = useState("")
  const [characteristics, setCharacteristics] = useState<string[]>([''])
  const [nearbyPlaces, setNearbyPlaces] = useState<Array<{ name: string; distance: string }>>([{ name: '', distance: '' }])
  const [type, setType] = useState("SALE")
  const [category, setCategory] = useState("apartment")
  const [latitude, setLatitude] = useState("")
  const [longitude, setLongitude] = useState("")

  // Add state for all required fields
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    location: '',
    area: '',
    areaUnit: 'm2',
    type: 'SALE',
    category: 'apartment',
    description: '',
    bedrooms: '',
    bathrooms: '',
    parking: '',
    hasBalcony: false,
    hasGarden: false,
    hasPool: false,
    hasSecurity: false,
    hasAirConditioning: false,
    hasHeating: false,
    hasInternet: false,
    hasElevator: false,
    hasParking: false,
    isFurnished: false,
    isExclusive: false,
    latitude: '',
    longitude: '',
  })

  // Add handler for input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  // Add handler for select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Upload images first
      const uploadedImageUrls = await Promise.all(
        images.map(async (file) => {
          const formData = new FormData()
          formData.append('file', file)
          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          })
          const data = await response.json()
          return data.url
        })
      )

      // Format nearby places with distance
      const formattedNearbyPlaces = nearbyPlaces.map(place => {
        const [name, distance] = place.name.split(' (')
        return `${name} (${distance}`
      })

      const propertyData = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        currency: '€',
        type: formData.type,
        category: formData.category,
        location: formData.location,
        area: parseFloat(formData.area),
        areaUnit: formData.areaUnit,
        bedrooms: parseInt(formData.bedrooms),
        bathrooms: parseInt(formData.bathrooms),
        parking: parseInt(formData.parking),
        images: uploadedImageUrls.filter((url) => typeof url === 'string' && url),
        isExclusive: Boolean(formData.isExclusive),
        hasBalcony: Boolean(formData.hasBalcony),
        hasGarden: Boolean(formData.hasGarden),
        hasPool: Boolean(formData.hasPool),
        hasSecurity: Boolean(formData.hasSecurity),
        hasAirConditioning: Boolean(formData.hasAirConditioning),
        hasHeating: Boolean(formData.hasHeating),
        hasInternet: Boolean(formData.hasInternet),
        hasElevator: Boolean(formData.hasElevator),
        hasParking: Boolean(formData.hasParking),
        isFurnished: Boolean(formData.isFurnished),
        hasAC: Boolean(formData.hasAirConditioning),
        address: '',
        city: '',
        postalCode: '',
        latitude: formData.latitude || null,
        longitude: formData.longitude || null,
        characteristics: characteristics.filter(c => c.trim() !== ''),
        nearbyPlaces: formattedNearbyPlaces
      }

      const response = await fetch('/api/properties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(propertyData),
      })

      if (!response.ok) {
        console.error('Response status:', response.status);
        console.error('Response headers:', Object.fromEntries(response.headers.entries()));
        const errorText = await response.text();
        console.error('Raw error response:', errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          errorData = { error: errorText };
        }
        console.error('Parsed API error:', errorData);
        throw new Error(errorData.error || errorData.message || 'Failed to create property');
      }

      toast({
        title: "Sukses!",
        description: "Prona u shtua me sukses.",
      })
      router.push('/admin/properties')
    } catch (error) {
      console.error('Error creating property:', error)
      toast({
        title: "Gabim!",
        description: error instanceof Error ? error.message : "Diçka shkoi keq.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleImageUpload = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      setIsSubmitting(true)
      try {
        const uploadedUrls = await Promise.all(
          Array.from(files).map(async (file) => {
            const formData = new FormData()
            formData.append('file', file)

            const response = await fetch('/api/upload', {
              method: 'POST',
              body: formData,
            })

            if (!response.ok) {
              throw new Error('Failed to upload image')
            }

            const data = await response.json()
            return data.url
          })
        )

        setImages([...images, ...uploadedUrls])
      } catch (error) {
        console.error('Error uploading images:', error)
        toast({
          title: "Gabim!",
          description: "Diçka shkoi keq gjatë ngarkimit të imazheve.",
          variant: "destructive",
        })
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  const removeImage = (index: number) => {
    const newImages = [...images]
    newImages.splice(index, 1)
    setImages(newImages)
  }

  const handleGoogleMapsUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value
    setGoogleMapsUrl(url)

    // Only try to parse if it looks like a valid URL
    if (!url.trim() || (!url.startsWith("http://") && !url.startsWith("https://"))) {
      return
    }

    try {
      const urlObj = new URL(url)
      const params = new URLSearchParams(urlObj.search)
      const coords = params.get('q')?.split(',')

      if (coords && coords.length === 2) {
        const [lat, lng] = coords
        setLatitude(lat)
        setLongitude(lng)
      }
    } catch (error) {
      console.error('Invalid Google Maps URL:', error)
    }
  }

  const addCharacteristic = () => {
    setCharacteristics([...characteristics, ''])
  }

  const removeCharacteristic = (index: number) => {
    const newCharacteristics = [...characteristics]
    newCharacteristics.splice(index, 1)
    setCharacteristics(newCharacteristics)
  }

  const updateCharacteristic = (index: number, value: string) => {
    const newCharacteristics = [...characteristics]
    newCharacteristics[index] = value
    setCharacteristics(newCharacteristics)
  }

  const addNearbyPlace = () => {
    setNearbyPlaces([...nearbyPlaces, { name: '', distance: '' }])
  }

  const removeNearbyPlace = (index: number) => {
    const newNearbyPlaces = [...nearbyPlaces]
    newNearbyPlaces.splice(index, 1)
    setNearbyPlaces(newNearbyPlaces)
  }

  const updateNearbyPlace = (index: number, field: 'name' | 'distance', value: string) => {
    const newNearbyPlaces = [...nearbyPlaces]
    if (field === 'distance') {
      // Only allow numbers
      const numericValue = value.replace(/[^0-9.]/g, '')
      newNearbyPlaces[index][field] = numericValue
    } else {
      newNearbyPlaces[index][field] = value
    }
    setNearbyPlaces(newNearbyPlaces)
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.push("/admin/properties")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">Shto pronë të re</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="details" className="mb-8">
          <TabsList className="mb-6">
            <TabsTrigger value="details">Detajet</TabsTrigger>
            <TabsTrigger value="features">Karakteristikat</TabsTrigger>
            <TabsTrigger value="images">Imazhet</TabsTrigger>
            <TabsTrigger value="location">Lokacioni</TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <RequiredLabel>Titulli</RequiredLabel>
                    <Input 
                      id="title" 
                      name="title" 
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Shto titullin e pronës" 
                      required 
                    />
                  </div>

                  <div className="space-y-2">
                    <RequiredLabel>Vendndodhja</RequiredLabel>
                    <Input 
                      id="location" 
                      name="location" 
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="Adresa e pronës" 
                      required 
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <RequiredLabel>Çmimi</RequiredLabel>
                      <Input
                        id="price"
                        name="price"
                        type="text"
                        value={formData.price}
                        onChange={handleInputChange}
                        placeholder="Çmimi"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="currency">Monedha</Label>
                      <Input
                        id="currency"
                        name="currency"
                        value="€"
                        readOnly
                        className="bg-muted"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <RequiredLabel>Lloji</RequiredLabel>
                      <Select 
                        value={formData.type} 
                        onValueChange={(value) => handleSelectChange('type', value)}
                      >
                        <SelectTrigger id="type">
                          <SelectValue placeholder="Zgjidhni llojin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SALE">Në shitje</SelectItem>
                          <SelectItem value="RENT">Me qira</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <RequiredLabel>Kategoria</RequiredLabel>
                      <Select 
                        value={formData.category} 
                        onValueChange={(value) => handleSelectChange('category', value)}
                      >
                        <SelectTrigger id="category">
                          <SelectValue placeholder="Zgjidhni kategorinë" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="apartment">Apartament</SelectItem>
                          <SelectItem value="house">Shtëpi</SelectItem>
                          <SelectItem value="villa">Vilë</SelectItem>
                          <SelectItem value="land">Truall</SelectItem>
                          <SelectItem value="commercial">Lokal komercial</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <RequiredLabel>Sipërfaqja</RequiredLabel>
                    <div className="flex gap-2">
                      <Input
                        id="area"
                        name="area"
                        type="number"
                        value={formData.area}
                        onChange={handleInputChange}
                        placeholder="Sipërfaqja"
                        required
                        min="0"
                        className="flex-1"
                      />
                      <Select 
                        value={formData.areaUnit} 
                        onValueChange={(value) => handleSelectChange('areaUnit', value)}
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue placeholder="Njësia" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="m2">m²</SelectItem>
                          <SelectItem value="km2">km²</SelectItem>
                          <SelectItem value="hektar">Hektar</SelectItem>
                          <SelectItem value="ari">Ari</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="bedrooms">Dhoma gjumi</Label>
                      <Input
                        id="bedrooms"
                        name="bedrooms"
                        type="number"
                        value={formData.bedrooms}
                        onChange={handleInputChange}
                        placeholder="Numri i dhomave"
                        min="0"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bathrooms">Banjo</Label>
                      <Input
                        id="bathrooms"
                        name="bathrooms"
                        type="number"
                        value={formData.bathrooms}
                        onChange={handleInputChange}
                        placeholder="Numri i banjove"
                        min="0"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="parking">Parking</Label>
                      <Input
                        id="parking"
                        name="parking"
                        type="number"
                        value={formData.parking}
                        onChange={handleInputChange}
                        placeholder="Numri i vendeve"
                        min="0"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="googleMapsUrl">Google Maps URL</Label>
                    <Input
                      id="googleMapsUrl"
                      value={googleMapsUrl}
                      onChange={handleGoogleMapsUrlChange}
                      placeholder="https://maps.google.com/..."
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <RequiredLabel>Përshkrimi</RequiredLabel>
                    <Textarea id="description" name="description" placeholder="Përshkruani pronën" className="min-h-32" required />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="isExclusive" 
                        name="isExclusive" 
                        checked={formData.isExclusive}
                        onCheckedChange={(checked) => {
                          setFormData(prev => ({
                            ...prev,
                            isExclusive: checked as boolean
                          }))
                        }}
                      />
                      <Label htmlFor="isExclusive">Pronë Ekskluzive</Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="features">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label>Balcony</Label>
                      <input
                        type="checkbox"
                        id="hasBalcony"
                        checked={formData.hasBalcony}
                        onChange={(e) => setFormData({ ...formData, hasBalcony: e.target.checked })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <Label>Garden</Label>
                      <input
                        type="checkbox"
                        id="hasGarden"
                        checked={formData.hasGarden}
                        onChange={(e) => setFormData({ ...formData, hasGarden: e.target.checked })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <Label>Pool</Label>
                      <input
                        type="checkbox"
                        id="hasPool"
                        checked={formData.hasPool}
                        onChange={(e) => setFormData({ ...formData, hasPool: e.target.checked })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <Label>Security</Label>
                      <input
                        type="checkbox"
                        id="hasSecurity"
                        checked={formData.hasSecurity}
                        onChange={(e) => setFormData({ ...formData, hasSecurity: e.target.checked })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <Label>Air Conditioning</Label>
                      <input
                        type="checkbox"
                        id="hasAirConditioning"
                        checked={formData.hasAirConditioning}
                        onChange={(e) => setFormData({ ...formData, hasAirConditioning: e.target.checked })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <Label>Heating</Label>
                      <input
                        type="checkbox"
                        id="hasHeating"
                        checked={formData.hasHeating}
                        onChange={(e) => setFormData({ ...formData, hasHeating: e.target.checked })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <Label>Internet</Label>
                      <input
                        type="checkbox"
                        id="hasInternet"
                        checked={formData.hasInternet}
                        onChange={(e) => setFormData({ ...formData, hasInternet: e.target.checked })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <Label>Elevator</Label>
                      <input
                        type="checkbox"
                        id="hasElevator"
                        checked={formData.hasElevator}
                        onChange={(e) => setFormData({ ...formData, hasElevator: e.target.checked })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Karakteristikat</h3>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addCharacteristic}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Shto karakteristikë
                      </Button>
                    </div>
                    <div className="space-y-4">
                      {characteristics.map((characteristic, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={characteristic}
                            onChange={(e) => updateCharacteristic(index, e.target.value)}
                            placeholder="Shto karakteristikë"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeCharacteristic(index)}
                            disabled={characteristics.length === 1}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Vendet në afërsi</h3>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addNearbyPlace}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Shto vend
                      </Button>
                    </div>
                    <div className="space-y-4">
                      {nearbyPlaces.map((place, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={place.name}
                            onChange={(e) => updateNearbyPlace(index, 'name', e.target.value)}
                            placeholder="Emri i vendit"
                          />
                          <div className="relative">
                            <Input
                              value={place.distance}
                              onChange={(e) => updateNearbyPlace(index, 'distance', e.target.value)}
                              placeholder="Distanca"
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9.]*"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">km</span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeNearbyPlace(index)}
                            disabled={nearbyPlaces.length === 1}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="images">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Button type="button" onClick={handleImageUpload}>
                      <Upload className="h-4 w-4 mr-2" />
                      Ngarko imazh
                    </Button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileChange}
                      multiple
                    />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {images.map((image, index) => (
                      <div key={index} className="relative aspect-square">
                        <img
                          src={image}
                          alt={`Property image ${index + 1}`}
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="location">
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="address">Adresa</Label>
                    <Input id="address" name="address" placeholder="Adresa e plotë" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">Qyteti</Label>
                    <Input id="city" name="city" defaultValue="Prishtinë" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Kodi postar</Label>
                    <Input id="postalCode" name="postalCode" placeholder="Kodi postar" />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="googleMapsUrl">Google Maps Link</Label>
                    <Input 
                      id="googleMapsUrl" 
                      name="googleMapsUrl"
                      type="url"
                      placeholder="https://www.google.com/maps/..."
                      value={googleMapsUrl}
                      onChange={handleGoogleMapsUrlChange}
                    />
                    <p className="text-sm text-gray-500">
                      Vendosni linkun e Google Maps për të marrë koordinatat automatikisht
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-4 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Anulo
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Duke u ruajtur...
              </>
            ) : (
              'Ruaj pronën'
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
