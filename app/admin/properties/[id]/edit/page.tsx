"use client"

import React from "react"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Upload, X, Plus, Loader2, AlertCircle } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/use-toast"
import { MultiSelect } from "@/components/ui/multiselect"
import { cn, formatPrice } from "@/lib/utils"
import { Alert, AlertDescription } from "@/components/ui/alert"

function RequiredLabel({ children }: { children: React.ReactNode }) {
  return (
    <Label>
      {children} <span className="text-red-500">*</span>
    </Label>
  )
}

export default function EditPropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params)
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [images, setImages] = useState<string[]>([])
  const [newImageFiles, setNewImageFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [googleMapsUrl, setGoogleMapsUrl] = useState("")
  const [googleMapsIframe, setGoogleMapsIframe] = useState("")
  const [characteristics, setCharacteristics] = useState<string[]>([''])
  const [nearbyPlaces, setNearbyPlaces] = useState<Array<{ name: string; distance: string }>>([{ name: '', distance: '' }])
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    location: '',
    area: '',
    areaUnit: 'm2',
    type: 'SALE',
    categoryId: '',
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
    isExclusive: false,
    latitude: '',
    longitude: '',
    images: [],
    characteristics: [],
    nearbyPlaces: [],
    currency: 'EUR',
    googleMapsIframe: '',
    city: '',
    address: '',
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [categories, setCategories] = useState<{id: string, name: string, value: string}[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [types, setTypes] = useState<{id: string, name: string, value: string}[]>([])
  const [selectedType, setSelectedType] = useState<string>("")
  const [statuses, setStatuses] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState("details")
  const [errors, setErrors] = useState<{
    details: string[];
    features: string[];
    images: string[];
    location: string[];
  }>({
    details: [],
    features: [],
    images: [],
    location: [],
  })

  React.useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data))
  }, [])

  React.useEffect(() => {
    fetch('/api/types')
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to fetch types');
        }
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          // Add EXCLUSIVE if it's not already in the types
          const hasExclusive = data.some(type => type.value === 'EXCLUSIVE');
          const updatedTypes = hasExclusive ? data : [
            ...data,
            { id: 'exclusive', name: 'Ekskluzive', value: 'EXCLUSIVE' }
          ];
          setTypes(updatedTypes);
        } else {
          console.error('Types data is not an array:', data);
          setTypes([]);
        }
      })
      .catch(error => {
        console.error('Error fetching types:', error);
        setTypes([]);
      });
  }, []);

  // Add EXCLUSIVE to types if not present
  React.useEffect(() => {
    if (Array.isArray(types) && !types.some(type => type.value === 'EXCLUSIVE')) {
      setTypes([...types, { id: 'exclusive', name: 'Ekskluzive', value: 'EXCLUSIVE' }]);
    }
  }, [types]);

  React.useEffect(() => {
    async function fetchProperty() {
      try {
        const res = await fetch(`/api/properties/${id}`);
        if (!res.ok) {
          throw new Error('Failed to fetch property data.');
        }
        const property = await res.json();
        
        // Set form data
        setFormData({
          ...formData,
          ...property,
          price: property.price?.toString() || '',
          area: property.area?.toString() || '',
          bedrooms: property.bedrooms?.toString() || '',
          bathrooms: property.bathrooms?.toString() || '',
          parking: property.parking?.toString() || '',
          latitude: property.latitude?.toString() || '',
          longitude: property.longitude?.toString() || '',
          googleMapsIframe: property.googleMapsIframe || '',
        });
        
        // Set other state values
        setImages(property.images || []);
        setCharacteristics(property.characteristics || ['']);
        setSelectedCategory(property.categoryId || "");
        setGoogleMapsUrl(property.googleMapsIframe || '');
        setGoogleMapsIframe(property.googleMapsIframe || '');
        
        if (Array.isArray(property.statuses)) {
          setStatuses(property.statuses);
        } else if (property.type) {
          setStatuses([property.type]);
        }
        
        // Set nearby places
        // Parse the string format "Name (Distance)" into { name: string, distance: string }
        const parsedNearbyPlaces = (property.nearbyPlaces || []).map((placeString: string) => {
          const match = placeString.match(/(.+?)\s*\(([^)]+)\)/);
          if (match) {
            return { name: match[1].trim(), distance: match[2].trim() };
          } else {
            return { name: placeString.trim(), distance: '' };
          }
        });
        setNearbyPlaces(parsedNearbyPlaces.length > 0 ? parsedNearbyPlaces : [{ name: '', distance: '' }]);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching property:', err);
        setError('Error fetching property data.');
        setLoading(false);
      }
    }
    if (id) fetchProperty();
  }, [id]);

  // Update isExclusive when statuses change
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      isExclusive: statuses.includes('EXCLUSIVE')
    }));
  }, [statuses]);

  // Handle status changes from MultiSelect
  const handleStatusChange = (newStatuses: string[]) => {
    // Ensure at least one type (RENT or SALE) is selected
    const hasMainType = newStatuses.some(status => status === 'RENT' || status === 'SALE');
    if (!hasMainType && newStatuses.length > 0) {
      toast({
        title: "Kujdes!",
        description: "Duhet të zgjidhni të paktën një lloj (Me qira ose Në shitje).",
        variant: "destructive",
      });
      return;
    }
    setStatuses(newStatuses);
  };

  if (loading) return <div>Loading...</div>
  if (error) return <div className="text-red-500">{error}</div>

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => {
      if (name === 'type') {
        return {
          ...prev,
          [name]: value,
          isExclusive: value === 'EXCLUSIVE',
        }
      }
      return {
        ...prev,
        [name]: value
      }
    })
    if (name === 'categoryId') setSelectedCategory(value)
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      setIsSubmitting(true)
      try {
        const newFiles = Array.from(files)
        setNewImageFiles(prevFiles => [...prevFiles, ...newFiles])
      } catch (error) {
        console.error('Error handling files:', error)
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

  const removeImage = async (index: number) => {
    try {
      // Get the image URL that's being removed
      const imageUrl = images[index]
      
      // Extract public ID from Cloudinary URL
      const publicId = imageUrl.split('/').slice(-1)[0].split('.')[0]
      
      // Delete from Cloudinary
      await fetch('/api/upload/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ publicId: `realestate/${publicId}` }),
      })

      // Remove from local state
      const newImages = [...images]
      newImages.splice(index, 1)
      setImages(newImages)
    } catch (error) {
      console.error('Error removing image:', error)
      toast({
        title: "Gabim!",
        description: "Diçka shkoi keq gjatë fshirjes së imazhit.",
        variant: "destructive",
      })
    }
  }

  const removeNewImageFile = (index: number) => {
    const newFiles = [...newImageFiles]
    newFiles.splice(index, 1)
    setNewImageFiles(newFiles)
  }

  const handleGoogleMapsUrlChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setGoogleMapsUrl(value);
    
    if (value.includes('<iframe') && value.includes('</iframe>')) {
      const srcMatch = value.match(/src="([^"]+)"/);
      if (srcMatch && srcMatch[1]) {
        setGoogleMapsIframe(srcMatch[1]);
      }
    } else if (value.startsWith('https://')) {
      setGoogleMapsIframe(value);
    } else {
      setGoogleMapsIframe('');
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
      const numericValue = value.replace(/[^0-9.]/g, '')
      newNearbyPlaces[index][field] = numericValue
    } else {
      newNearbyPlaces[index][field] = value
    }
    setNearbyPlaces(newNearbyPlaces)
  }

  const validateTab = (tab: string) => {
    const newErrors: string[] = []

    switch (tab) {
      case "details":
        if (!formData.title) newErrors.push("Titulli është i detyrueshëm")
        if (!formData.price) newErrors.push("Çmimi është i detyrueshëm")
        if (!formData.area) newErrors.push("Sipërfaqja është e detyrueshme")
        if (!formData.location) newErrors.push("Lokacioni është i detyrueshëm")
        if (!formData.description) newErrors.push("Përshkrimi është i detyrueshëm")
        if (!selectedCategory) newErrors.push("Kategoria është e detyrueshme")
        if (statuses.length === 0) newErrors.push("Të paktën një lloj (Me qira ose Në shitje) është i detyrueshëm")
        break
      case "features":
        // Not required
        break
      case "images":
        if (images.length === 0) {
          newErrors.push("Të paktën një imazh është i detyrueshëm")
        }
        break
      case "location":
        if (!formData.address) newErrors.push("Adresa është e detyrueshme")
        if (!formData.city) newErrors.push("Qyteti është i detyrueshëm")
        break
    }

    setErrors(prev => ({ ...prev, [tab]: newErrors }))
    return newErrors.length === 0
  }

  const handleNextTab = () => {
    const isValid = validateTab(activeTab)
    if (!isValid) {
      toast({
        title: "Gabim!",
        description: "Ju lutem plotësoni të gjitha fushat e detyrueshme.",
        variant: "destructive",
      })
      return
    }

    switch (activeTab) {
      case "details":
        setActiveTab("features")
        break
      case "features":
        setActiveTab("images")
        break
      case "images":
        setActiveTab("location")
        break
      default:
        break
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate all tabs before submission
    const detailsValid = validateTab("details")
    const featuresValid = validateTab("features")
    const imagesValid = validateTab("images")
    const locationValid = validateTab("location")

    if (!detailsValid || !featuresValid || !imagesValid || !locationValid) {
      toast({
        title: "Gabim!",
        description: "Ju lutem plotësoni të gjitha fushat e detyrueshme në të gjitha seksionet.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Upload new images first
      const uploadedNewImageUrls = await Promise.all(
        newImageFiles.map(async (file) => {
          const base64Data = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });

          const response = await fetch('/api/upload', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ image: base64Data }),
          });

          if (!response.ok) {
            throw new Error('Failed to upload image');
          }

          const data = await response.json();
          return data.url;
        })
      );

      const allImages = [...images, ...uploadedNewImageUrls];

      // Format nearby places back into strings
      const formattedNearbyPlaces = nearbyPlaces
        .filter(place => place.name)
        .map(place => {
          return `${place.name}${place.distance ? ` (${place.distance})` : ''}`;
        });

      let propertyData = {
        title: formData.title,
        description: formData.description,
        price: formData.price ? parseFloat(formData.price) : null,
        currency: formData.currency,
        type: statuses.find(s => s === 'RENT' || s === 'SALE') || '',
        categoryId: selectedCategory,
        location: formData.location,
        area: formData.area ? parseFloat(formData.area) : null,
        areaUnit: formData.areaUnit,
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
        bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : null,
        parking: formData.parking ? parseInt(formData.parking) : null,
        images: allImages,
        hasBalcony: Boolean(formData.hasBalcony),
        hasGarden: Boolean(formData.hasGarden),
        hasPool: Boolean(formData.hasPool),
        hasSecurity: Boolean(formData.hasSecurity),
        hasAirConditioning: Boolean(formData.hasAirConditioning),
        hasHeating: Boolean(formData.hasHeating),
        hasInternet: Boolean(formData.hasInternet),
        hasElevator: Boolean(formData.hasElevator),
        latitude: formData.latitude,
        longitude: formData.longitude,
        characteristics: characteristics.filter(c => c.trim() !== ''),
        nearbyPlaces: formattedNearbyPlaces,
        statuses: statuses,
        isExclusive: statuses.includes('EXCLUSIVE'),
        googleMapsIframe: googleMapsIframe,
        city: formData.city,
        address: formData.address,
      }

      const response = await fetch(`/api/properties/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(propertyData),
      })

      if (!response.ok) {
        throw new Error('Failed to update property')
      }

      toast({
        title: "Sukses!",
        description: "Prona u përditësua me sukses.",
      })
      router.push('/admin')
    } catch (error) {
      console.error('Error updating property:', error)
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

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.push("/admin/properties")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">Ndrysho pronën</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="mb-6">
            <TabsTrigger value="details" className="relative">
              Detajet
              {errors.details.length > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 flex items-center justify-center">
                  <AlertCircle className="h-3 w-3 text-white" />
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="features" className="relative">
              Karakteristikat
              {errors.features.length > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 flex items-center justify-center">
                  <AlertCircle className="h-3 w-3 text-white" />
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="images" className="relative">
              Imazhet
              {errors.images.length > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 flex items-center justify-center">
                  <AlertCircle className="h-3 w-3 text-white" />
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="location" className="relative">
              Lokacioni
              {errors.location.length > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 flex items-center justify-center">
                  <AlertCircle className="h-3 w-3 text-white" />
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {Object.entries(errors).map(([tab, tabErrors]) => (
            tabErrors.length > 0 && activeTab === tab && (
              <Alert variant="destructive" className="mb-6" key={tab}>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {tabErrors.map((error, index) => (
                    <div key={index}>{error}</div>
                  ))}
                </AlertDescription>
              </Alert>
            )
          ))}

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
                        type="number"
                        value={formData.price}
                        onChange={handleInputChange}
                        placeholder="Çmimi (0 për 'Me marrëveshje')"
                        min="0"
                        step="1"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="currency">Monedha</Label>
                      <Input
                        id="currency"
                        name="currency"
                        value="EUR"
                        readOnly
                        className="bg-muted"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <RequiredLabel>Lloji</RequiredLabel>
                      <MultiSelect
                        options={types.map(type => ({
                          value: type.value,
                          label: type.name
                        }))}
                        value={statuses}
                        onChange={handleStatusChange}
                        placeholder="Zgjidh llojin"
                      />
                    </div>
                    <div className="space-y-2">
                      <RequiredLabel>Kategoria</RequiredLabel>
                      <Select 
                        value={selectedCategory} 
                        onValueChange={value => handleSelectChange('categoryId', value)}
                      >
                        <SelectTrigger id="category">
                          <SelectValue placeholder="Zgjidhni kategorinë" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(category => (
                            <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                          ))}
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
                        step="0.01"
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

                  <div className="space-y-2 md:col-span-2">
                    <RequiredLabel>Përshkrimi</RequiredLabel>
                    <Textarea 
                      id="description" 
                      name="description" 
                      value={formData.description}
                      onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Përshkruani pronën" 
                      className="min-h-32" 
                      required 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            <div className="flex justify-end mt-6">
              <Button type="button" onClick={handleNextTab}>
                Faqja tjetër
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="features">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Karakteristika shtesë</h3>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={addCharacteristic}
                          className="h-8"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Shto karakteristikë
                        </Button>
                      </div>
                      <div className="grid gap-3">
                        {characteristics.map((characteristic, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              value={characteristic}
                              onChange={(e) => updateCharacteristic(index, e.target.value)}
                              placeholder="p.sh. Pamje nga deti, Garazh i mbyllur, etj."
                              className="flex-1"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              onClick={() => removeCharacteristic(index)}
                              disabled={characteristics.length === 1}
                              className="h-10 w-10 p-0"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Në afërsi</h3>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={addNearbyPlace}
                          className="h-8"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Shto vend
                        </Button>
                      </div>
                      <div className="grid gap-3">
                        {nearbyPlaces.map((place, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              value={place.name}
                              onChange={(e) => updateNearbyPlace(index, 'name', e.target.value)}
                              placeholder="Emri i vendit"
                              className="flex-1"
                            />
                            <div className="relative flex-1">
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
                              onClick={() => removeNearbyPlace(index)}
                              disabled={nearbyPlaces.length === 1}
                              className="h-10 w-10 p-0"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Karakteristikat kryesore</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="hasBalcony"
                          checked={formData.hasBalcony}
                          onCheckedChange={(checked) => 
                            setFormData(prev => ({ ...prev, hasBalcony: checked as boolean }))
                          }
                        />
                        <Label htmlFor="hasBalcony">Ballkon</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="hasGarden"
                          checked={formData.hasGarden}
                          onCheckedChange={(checked) => 
                            setFormData(prev => ({ ...prev, hasGarden: checked as boolean }))
                          }
                        />
                        <Label htmlFor="hasGarden">Kopsht</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="hasPool"
                          checked={formData.hasPool}
                          onCheckedChange={(checked) => 
                            setFormData(prev => ({ ...prev, hasPool: checked as boolean }))
                          }
                        />
                        <Label htmlFor="hasPool">Pishinë</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="hasSecurity"
                          checked={formData.hasSecurity}
                          onCheckedChange={(checked) => 
                            setFormData(prev => ({ ...prev, hasSecurity: checked as boolean }))
                          }
                        />
                        <Label htmlFor="hasSecurity">Siguri</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="hasAirConditioning"
                          checked={formData.hasAirConditioning}
                          onCheckedChange={(checked) => 
                            setFormData(prev => ({ ...prev, hasAirConditioning: checked as boolean }))
                          }
                        />
                        <Label htmlFor="hasAirConditioning">Kondicioner</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="hasHeating"
                          checked={formData.hasHeating}
                          onCheckedChange={(checked) => 
                            setFormData(prev => ({ ...prev, hasHeating: checked as boolean }))
                          }
                        />
                        <Label htmlFor="hasHeating">Ngrohje</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="hasInternet"
                          checked={formData.hasInternet}
                          onCheckedChange={(checked) => 
                            setFormData(prev => ({ ...prev, hasInternet: checked as boolean }))
                          }
                        />
                        <Label htmlFor="hasInternet">Internet</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="hasElevator"
                          checked={formData.hasElevator}
                          onCheckedChange={(checked) => 
                            setFormData(prev => ({ ...prev, hasElevator: checked as boolean }))
                          }
                        />
                        <Label htmlFor="hasElevator">Ashensor</Label>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button type="button" onClick={handleNextTab}>
                      Faqja tjetër
                    </Button>
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
                    {/* Existing images */}
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
                    {/* New images (previews) */}
                    {newImageFiles.map((file, index) => {
                      const url = URL.createObjectURL(file)
                      return (
                        <div key={index} className="relative aspect-square">
                          <img
                            src={url}
                            alt={`New property image ${index + 1}`}
                            className="w-full h-full object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeNewImageFile(index)}
                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
            <div className="flex justify-end mt-6">
              <Button type="button" onClick={handleNextTab}>
                Faqja tjetër
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="location">
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <RequiredLabel>Adresa</RequiredLabel>
                    <Input
                      id="address"
                      name="address"
                      placeholder="Adresa e plotë"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <RequiredLabel>Qyteti</RequiredLabel>
                    <Select
                      name="city"
                      value={formData.city || ''}
                      onValueChange={value => setFormData(prev => ({ ...prev, city: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Zgjidh qytetin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Deçan">Deçan</SelectItem>
                        <SelectItem value="Dragash">Dragash</SelectItem>
                        <SelectItem value="Ferizaj">Ferizaj</SelectItem>
                        <SelectItem value="Fushë Kosovë">Fushë Kosovë</SelectItem>
                        <SelectItem value="Gjakovë">Gjakovë</SelectItem>
                        <SelectItem value="Gjilan">Gjilan</SelectItem>
                        <SelectItem value="Gllogoc">Gllogoc</SelectItem>
                        <SelectItem value="Graçanicë">Graçanicë</SelectItem>
                        <SelectItem value="Hani i Elezit">Hani i Elezit</SelectItem>
                        <SelectItem value="Istog">Istog</SelectItem>
                        <SelectItem value="Junik">Junik</SelectItem>
                        <SelectItem value="Kamenicë">Kamenicë</SelectItem>
                        <SelectItem value="Kaçanik">Kaçanik</SelectItem>
                        <SelectItem value="Klinë">Klinë</SelectItem>
                        <SelectItem value="Kllokot">Kllokot</SelectItem>
                        <SelectItem value="Leposaviq">Leposaviq</SelectItem>
                        <SelectItem value="Lipjan">Lipjan</SelectItem>
                        <SelectItem value="Malishevë">Malishevë</SelectItem>
                        <SelectItem value="Mamushë">Mamushë</SelectItem>
                        <SelectItem value="Mitrovicë">Mitrovicë</SelectItem>
                        <SelectItem value="Mitrovicë e Veriut">Mitrovicë e Veriut</SelectItem>
                        <SelectItem value="Novobërdë">Novobërdë</SelectItem>
                        <SelectItem value="Obiliq">Obiliq</SelectItem>
                        <SelectItem value="Partesh">Partesh</SelectItem>
                        <SelectItem value="Pejë">Pejë</SelectItem>
                        <SelectItem value="Podujevë">Podujevë</SelectItem>
                        <SelectItem value="Prishtinë">Prishtinë</SelectItem>
                        <SelectItem value="Prizren">Prizren</SelectItem>
                        <SelectItem value="Rahovec">Rahovec</SelectItem>
                        <SelectItem value="Ranillug">Ranillug</SelectItem>
                        <SelectItem value="Skënderaj">Skënderaj</SelectItem>
                        <SelectItem value="Suharekë">Suharekë</SelectItem>
                        <SelectItem value="Shtime">Shtime</SelectItem>
                        <SelectItem value="Shtërpcë">Shtërpcë</SelectItem>
                        <SelectItem value="Viti">Viti</SelectItem>
                        <SelectItem value="Vushtrri">Vushtrri</SelectItem>
                        <SelectItem value="Zubin Potok">Zubin Potok</SelectItem>
                        <SelectItem value="Zveçan">Zveçan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="googleMapsUrl">Google Maps URL</Label>
                    <div className="flex flex-col gap-2">
                      <textarea 
                        id="googleMapsUrl" 
                        name="googleMapsUrl"
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="<iframe src='https://www.google.com/maps/embed?pb=...' width='600' height='450' style='border:0;' allowfullscreen='' loading='lazy' referrerpolicy='no-referrer-when-downgrade'></iframe>"
                        value={googleMapsUrl}
                        onChange={handleGoogleMapsUrlChange}
                      />
                      <p className="text-sm text-gray-500">
                        Shkoni në Google Maps → Share → Embed a map → Kopjoni të gjithë kodin e iframe
                      </p>
                    </div>
                  </div>

                  {googleMapsIframe && (
                    <div className="md:col-span-2 w-full aspect-video">
                      <iframe 
                        src={googleMapsIframe}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                    </div>
                  )}
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
              'Ruaj ndryshimet'
            )}
          </Button>
        </div>
      </form>
    </div>
  )
} 