"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Trash2, CheckCircle, MessageSquare } from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface Contact {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  message: string
  createdAt: string
  status: string
  source?: string
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedMessage, setSelectedMessage] = useState<{
    name: string;
    message: string;
  } | null>(null)

  const fetchContacts = async () => {
    try {
      const response = await fetch('/api/contacts')
      if (!response.ok) {
        throw new Error('Failed to fetch contacts')
      }
      const data = await response.json()
      setContacts(data)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch contacts')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchContacts()
  }, [])

  const handleStatusChange = async (id: string) => {
    try {
      const response = await fetch('/api/contacts', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          status: 'contacted'
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update contact status')
      }

      // Refresh contacts list
      fetchContacts()
      toast.success('Statusi u përditësua me sukses')
    } catch (error) {
      console.error('Error updating contact status:', error)
      toast.error('Gabim gjatë përditësimit të statusit')
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('A jeni i sigurt që dëshironi ta fshini këtë kontakt?')) {
      return
    }

    try {
      const response = await fetch(`/api/contacts?id=${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete contact')
      }

      // Refresh contacts list
      fetchContacts()
      toast.success('Kontakti u fshi me sukses')
    } catch (error) {
      console.error('Error deleting contact:', error)
      toast.error('Gabim gjatë fshirjes së kontaktit')
    }
  }

  return (
    <div className="mx-auto px-6">
      {loading && (
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Duke ngarkuar kontaktet...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-800 p-4 rounded-lg">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Kontaktet</h1>
          </div>

          <div className="rounded-md border bg-white p-2 sm:p-6 max-w-full overflow-x-auto">
            <table className="w-full border-collapse" style={{ minWidth: '900px' }}>
              <thead>
                <tr>
                  <th className="py-2 px-4 border border-slate-200">Emri</th>
                  <th className="py-2 px-4 border border-slate-200">Email</th>
                  <th className="py-2 px-4 border border-slate-200">Telefoni</th>
                  <th className="py-2 px-4 border border-slate-200">Mesazhi</th>
                  <th className="py-2 px-4 border border-slate-200">Burimi</th>
                  <th className="py-2 px-4 border border-slate-200">Data</th>
                  <th className="py-2 px-4 border border-slate-200">Statusi</th>
                  <th className="py-2 px-4 border border-slate-200">Veprime</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((contact) => (
                  <tr key={contact.id}>
                    <td className="py-2 px-4 border border-slate-200">{contact.firstName} {contact.lastName}</td>
                    <td className="py-2 px-4 border border-slate-200">{contact.email}</td>
                    <td className="py-2 px-4 border border-slate-200">{contact.phone}</td>
                    <td className="py-2 px-4 border border-slate-200 max-w-xs">
                      <div className="flex items-center gap-2">
                        <span className="truncate">{contact.message}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex-shrink-0"
                          onClick={() => setSelectedMessage({
                            name: `${contact.firstName} ${contact.lastName}`,
                            message: contact.message
                          })}
                        >
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                    <td className="py-2 px-4 border border-slate-200 max-w-xs truncate">
                      {contact.source ? (
                        <a 
                          href={contact.source} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          {new URL(contact.source).pathname}
                        </a>
                      ) : 'N/A'}
                    </td>
                    <td className="py-2 px-4 border border-slate-200">{format(new Date(contact.createdAt), 'dd/MM/yyyy HH:mm')}</td>
                    <td className="py-2 px-4 border border-slate-200">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        contact.status === 'unread' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {contact.status === 'unread' ? 'Pa lexuar' : 'Kontaktuar'}
                      </span>
                    </td>
                    <td className="py-2 px-4 border border-slate-200">
                      <div className="flex gap-2">
                        {contact.status === 'unread' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusChange(contact.id)}
                            title="Shëno si të kontaktuar"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(contact.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Fshi kontaktin"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Mesazhi nga {selectedMessage?.name}</DialogTitle>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">
              {selectedMessage?.message}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 