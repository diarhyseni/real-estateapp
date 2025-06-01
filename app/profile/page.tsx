"use client"

import { SelectItem } from "@/components/ui/select"

import { SelectContent } from "@/components/ui/select"

import { SelectValue } from "@/components/ui/select"

import { SelectTrigger } from "@/components/ui/select"

import { Select } from "@/components/ui/select"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getCurrentUser, isAdmin } from "@/lib/auth"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { toast } from "@/components/ui/use-toast"
import { Eye, EyeOff, Upload, User, Settings, Key, FileText } from "lucide-react"
import { useSession, signOut } from "next-auth/react"

export default function ProfilePage() {
  const router = useRouter()
  const { data: session, status, update: updateSession } = useSession();
  const [user, setUser] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || ''
  })
  const [newPassword, setNewPassword] = useState('');
  const [profilePic, setProfilePic] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedSection, setSelectedSection] = useState<'profile' | 'password'>('profile')

  async function fetchUserFromBackend(userId: string) {
    const res = await fetch(`/api/users/${userId}`)
    const data = await res.json()
    if (data && !data.error) {
      setUser(data)
      setFormData({
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || ''
      })
    }
  }

  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      fetchUserFromBackend(session.user.id);
    }
  }, [session, status]);

  useEffect(() => {
    if (user?.image) {
      setProfilePic(user.image);
    }
  }, [user]);

  const getInitials = (name: string) => {
    if (!name) return ""
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({ ...prev, [id]: value }))
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          role: user.role,
          image: user.image
        })
      })
      const updatedUser = await response.json()
      if (!response.ok) throw new Error(updatedUser.error || 'Failed to update profile')
      
      // Update local state
      setUser(updatedUser)
      setFormData({
        name: updatedUser.name || '',
        email: updatedUser.email || '',
        phone: updatedUser.phone || '',
        address: updatedUser.address || ''
      })

      // Update the session with all user data
      await updateSession({
        ...session,
        user: {
          ...session?.user,
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          image: updatedUser.image,
          phone: updatedUser.phone,
          address: updatedUser.address
        }
      })

      // Force a page refresh to ensure all components update
      router.refresh()

      toast({
        title: 'Profili u përditësua me sukses',
        description: 'Të dhënat tuaja u ruajtën.'
      })
      setIsSubmitting(false)
    } catch (error: any) {
      toast({
        title: 'Gabim',
        description: error.message || 'Ndodhi një gabim gjatë përditësimit të profilit.',
        variant: 'destructive',
      })
      setIsSubmitting(false)
    }
  }

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword })
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Failed to update password')
      toast({
        title: 'Fjalëkalimi u ndryshua me sukses',
        description: 'Fjalëkalimi juaj u përditësua.'
      })
      setNewPassword('')
      setIsSubmitting(false)
    } catch (error: any) {
      toast({
        title: 'Gabim',
        description: error.message || 'Ndodhi një gabim gjatë ndryshimit të fjalëkalimit.',
        variant: 'destructive',
      })
      setIsSubmitting(false)
    }
  }

  // Profile picture upload handler
  const handleProfilePicChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setIsSubmitting(true)
      try {
        // Convert file to base64
        const base64Data = await new Promise((resolve) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result)
          reader.readAsDataURL(file)
        })

        // Upload to Cloudinary
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ image: base64Data }),
        })

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload image')
        }

        const uploadData = await uploadResponse.json()

        // If there's an existing profile picture, delete it from Cloudinary
        if (user.image) {
          const oldPublicId = user.image.split('/').slice(-1)[0].split('.')[0]
          await fetch('/api/upload/delete', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ publicId: `realestate/${oldPublicId}` }),
          })
        }

        // Update user profile with new image URL
        const response = await fetch(`/api/users/${user.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...user,
            image: uploadData.url
          })
        })

        if (!response.ok) {
          throw new Error('Failed to update profile picture')
        }

        const updatedUser = await response.json()
        
        // Update local state
        setUser(updatedUser)
        setProfilePic(uploadData.url)

        // Update session with new image URL
        await updateSession({
          ...session,
          user: {
            ...session?.user,
            image: uploadData.url
          }
        })

        // Wait for session to update
        await new Promise(resolve => setTimeout(resolve, 1000))

        // Signout and redirect to force a complete session refresh
        await signOut({ redirect: true, callbackUrl: '/profile' })

        toast({
          title: 'Sukses',
          description: 'Fotoja e profilit u përditësua me sukses.'
        })
      } catch (error) {
        console.error('Error:', error)
        toast({
          title: 'Gabim',
          description: 'Ndodhi një gabim gjatë përditësimit të fotos së profilit.',
          variant: 'destructive'
        })
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  if (!user) {
    // Show empty profile form if user is not found
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 bg-slate-50 py-12">
          <div className="container">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="w-full md:w-64">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center">
                      <div className="relative mb-4">
                        <Avatar className="h-24 w-24 bg-brand-primary text-white text-xl">
                          {user?.image ? (
                            <AvatarImage src={user.image} alt={user.name} />
                          ) : (
                            <AvatarFallback>{getInitials(user?.name || '')}</AvatarFallback>
                          )}
                        </Avatar>
                        <button className="absolute bottom-0 right-0 bg-brand-secondary text-white rounded-full p-1.5 shadow-md">
                          <Upload className="h-4 w-4" />
                        </button>
                      </div>
                      <h2 className="text-xl font-bold">-</h2>
                      <p className="text-sm text-slate-500 mb-4">-</p>
                      <div className="w-full space-y-2">
                        <Button variant={selectedSection === 'profile' ? 'secondary' : 'ghost'} className="w-full justify-start" onClick={() => setSelectedSection('profile')}>
                          <User className="mr-2 h-4 w-4" />
                          Profili
                        </Button>
                        <Button variant={selectedSection === 'password' ? 'secondary' : 'ghost'} className="w-full justify-start" onClick={() => setSelectedSection('password')}>
                          <Key className="mr-2 h-4 w-4" />
                          Fjalëkalimi
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="flex-1">
                {selectedSection === 'profile' && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Informacioni i profilit</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="name">Emri i plotë</Label>
                            <Input id="name" value={formData.name} onChange={handleInputChange} required />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" value={formData.email} onChange={handleInputChange} required />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="phone">Numri i telefonit</Label>
                            <Input id="phone" value={formData.phone} onChange={handleInputChange} placeholder="Numri i telefonit" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="address">Adresa</Label>
                            <Input id="address" value={formData.address} onChange={handleInputChange} placeholder="Adresa" />
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <Button type="submit" disabled>
                            Ruaj ndryshimet
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                )}
                {selectedSection === 'password' && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Ndrysho fjalëkalimin</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handlePasswordUpdate} className="space-y-6">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="new-password">Fjalëkalimi i ri</Label>
                            <Input id="new-password" name="new-password" type="password" placeholder="••••••••" required value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                          </div>
                        </div>
                        <Button type="submit" disabled={isSubmitting}>
                          {isSubmitting ? "Duke ruajtur..." : "Ndrysho fjalëkalimin"}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-slate-50 py-12">
        <div className="container">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-64">
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col items-center">
                    <div className="relative mb-4">
                      <Avatar className="h-24 w-24 bg-brand-primary text-white text-xl">
                        {user?.image ? (
                          <AvatarImage src={user.image} alt={user.name} />
                        ) : (
                          <AvatarFallback>{getInitials(user?.name || '')}</AvatarFallback>
                        )}
                      </Avatar>
                      <button 
                        className="absolute bottom-0 right-0 bg-brand-secondary text-white rounded-full p-1.5 shadow-md"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="h-4 w-4" />
                      </button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleProfilePicChange}
                      />
                    </div>
                    <h2 className="text-xl font-bold">{user.name}</h2>
                    <p className="text-sm text-slate-500 mb-4">{user.email}</p>
                    <div className="w-full space-y-2">
                      <Button variant={selectedSection === 'profile' ? 'secondary' : 'ghost'} className="w-full justify-start" onClick={() => setSelectedSection('profile')}>
                        <User className="mr-2 h-4 w-4" />
                        Profili
                      </Button>
                      <Button variant={selectedSection === 'password' ? 'secondary' : 'ghost'} className="w-full justify-start" onClick={() => setSelectedSection('password')}>
                        <Key className="mr-2 h-4 w-4" />
                        Fjalëkalimi
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex-1">
              {selectedSection === 'profile' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Informacioni i profilit</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleProfileUpdate} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="name">Emri i plotë</Label>
                          <Input 
                            id="name" 
                            value={formData.name} 
                            onChange={handleInputChange}
                            required 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input 
                            id="email" 
                            type="email" 
                            value={formData.email}
                            onChange={handleInputChange}
                            required 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Numri i telefonit</Label>
                          <Input 
                            id="phone" 
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="Numri i telefonit" 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="address">Adresa</Label>
                          <Input 
                            id="address" 
                            value={formData.address}
                            onChange={handleInputChange}
                            placeholder="Adresa" 
                          />
                        </div>
                      </div>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Duke ruajtur...' : 'Ruaj ndryshimet'}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )}
              {selectedSection === 'password' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Ndrysho fjalëkalimin</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handlePasswordUpdate} className="space-y-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="new-password">Fjalëkalimi i ri</Label>
                          <Input id="new-password" name="new-password" type="password" placeholder="••••••••" required value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                        </div>
                      </div>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Duke ruajtur..." : "Ndrysho fjalëkalimin"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
