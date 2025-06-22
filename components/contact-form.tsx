"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

interface ContactFormProps {
  className?: string
}

interface FormErrors {
  firstName?: string
  lastName?: string
  phone?: string
  email?: string
  message?: string
}

export default function ContactForm({ className }: ContactFormProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    message: ""
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState("")

  // Validation functions
  const validateName = (name: string, fieldName: string): string | undefined => {
    if (!name.trim()) {
      return `${fieldName} është i detyrueshëm`
    }
    if (name.trim().length < 3) {
      return `Ju lutem shënoni ${fieldName}n e plotë!`
    }
    if (/\d/.test(name)) {
      return `${fieldName} nuk mund të përmbajë numra!`
    }
    if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(name)) {
      return `${fieldName} mund të përmbajë vetëm shkronja, hapësira, apostrofa dhe vizë`
    }
    return undefined
  }

  const validatePhone = (phone: string): string | undefined => {
    if (!phone.trim()) {
      return "Numri i telefonit është i detyrueshëm"
    }
    if (!/^\d+$/.test(phone)) {
      return "Numri i telefonit mund të përmbajë vetëm numra"
    }
    if (phone.length < 7) {
      return "Numri i telefonit duhet të ketë të paktën 7 shifra"
    }
    if (phone.length > 15) {
      return "Numri i telefonit nuk mund të ketë më shumë se 15 shifra"
    }
    return undefined
  }

  const validateEmail = (email: string): string | undefined => {
    if (!email.trim()) {
      return "Email është i detyrueshëm"
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return "Ju lutemi vendosni një email të vlefshëm"
    }
    return undefined
  }

  const validateMessage = (message: string): string | undefined => {
    if (!message.trim()) {
      return "Mesazhi është i detyrueshëm"
    }
    if (message.trim().length < 10) {
      return "Mesazhi duhet të ketë të paktën 10 karaktere"
    }
    return undefined
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    newErrors.firstName = validateName(formData.firstName, "Emri")
    newErrors.lastName = validateName(formData.lastName, "Mbiemri")
    newErrors.phone = validatePhone(formData.phone)
    newErrors.email = validateEmail(formData.email)
    newErrors.message = validateMessage(formData.message)

    setErrors(newErrors)

    // Return true if no errors
    return !Object.values(newErrors).some(error => error !== undefined)
  }

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form before submission
    if (!validateForm()) {
      return
    }

    setStatus('loading')
    setErrorMessage("")

    try {
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          source: window.location.href
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Ka ndodhur një gabim')
      }

      setStatus('success')
      setFormData({
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        message: ""
      })
      setErrors({})
    } catch (error) {
      console.error("Form submission error:", error)
      setStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'Ka ndodhur një gabim. Ju lutemi provoni përsëri.')
    }
  }

  return (
    <div className={className}>
      {status === 'success' && (
        <div className="bg-green-50 text-green-800 p-4 rounded-lg mb-6">
          Mesazhi juaj u dërgua me sukses. Do t'ju kontaktojmë së shpejti.
        </div>
      )}

      {status === 'error' && (
        <div className="bg-red-50 text-red-800 p-4 rounded-lg mb-6">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Input
              placeholder="Emri"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              className={errors.firstName ? "border-red-500" : ""}
            />
            {errors.firstName && (
              <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
            )}
          </div>
          <div>
            <Input
              placeholder="Mbiemri"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              className={errors.lastName ? "border-red-500" : ""}
            />
            {errors.lastName && (
              <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
            )}
          </div>
        </div>
        
        <div>
          <Input
            placeholder="Numri i telefonit"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            className={errors.phone ? "border-red-500" : ""}
          />
          {errors.phone && (
            <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
          )}
        </div>
        
        <div>
          <Input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className={errors.email ? "border-red-500" : ""}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
        </div>
        
        <div>
          <Textarea
            placeholder="Mesazhi"
            className={`min-h-[150px] ${errors.message ? "border-red-500" : ""}`}
            value={formData.message}
            onChange={(e) => handleInputChange('message', e.target.value)}
          />
          {errors.message && (
            <p className="text-red-500 text-sm mt-1">{errors.message}</p>
          )}
        </div>
        
        <Button 
          type="submit" 
          className="w-full bg-brand-primary hover:bg-brand-primary/90" 
          disabled={status === 'loading'}
        >
          {status === 'loading' ? 'Duke dërguar...' : 'Dërgo'}
        </Button>
      </form>
    </div>
  )
} 