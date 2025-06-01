import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Loader2 } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'

export function ImageUpload({ onUpload }: { onUpload: (url: string) => void }) {
  const [isUploading, setIsUploading] = useState(false)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      // Convert file to base64
      const base64Data = await new Promise((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result)
        reader.readAsDataURL(file)
      })

      // Upload to Cloudinary
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: base64Data }),
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()
      onUpload(data.url)
    } catch (error) {
      console.error('Upload error:', error)
      toast({
        title: "Gabim!",
        description: "Ngarkimi i imazhit dështoi.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div>
      <Input
        type="file"
        accept="image/*"
        onChange={handleUpload}
        disabled={isUploading}
      />
      {isUploading && (
        <div className="mt-2 flex items-center">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="ml-2">Duke u ngarkuar...</span>
        </div>
      )}
    </div>
  )
} 