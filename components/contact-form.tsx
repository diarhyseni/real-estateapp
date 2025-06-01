"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

interface ContactFormProps {
  className?: string
}

export default function ContactForm({ className }: ContactFormProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    message: ""
  })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
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
          <Input
            placeholder="Emri"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
          />
          <Input
            placeholder="Mbiemri"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
          />
        </div>
        <Input
          placeholder="Numri i telefonit"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        />
        <Input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
        <Textarea
          placeholder="Mesazhi"
          className="min-h-[150px]"
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
        />
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