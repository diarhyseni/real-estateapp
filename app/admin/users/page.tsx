"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from '@/components/ui/button'
import { Edit, Trash2 } from 'lucide-react'

export default function UsersPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [users, setUsers] = useState<any[]>([])
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<any>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    const res = await fetch("/api/users")
    const data = await res.json()
    setUsers(data)
  }

  const handleDelete = (user: any) => {
    setUserToDelete(user)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!userToDelete) return
    await fetch(`/api/users/${userToDelete.id}`, { method: 'DELETE' })
    setIsDeleteDialogOpen(false)
    setUserToDelete(null)
    fetchUsers()
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Përdoruesit</h1>
        <button
          onClick={() => router.push('/admin/users/new')}
          className="bg-brand-primary hover:bg-brand-primary/90 text-white px-4 py-2 rounded flex items-center gap-2"
        >
          <span className="text-lg font-bold">+</span> Shto përdorues
        </button>
      </div>
      <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
        <thead>
          <tr>
            <th className="px-4 py-2 border-b text-left">Emri</th>
            <th className="px-4 py-2 border-b text-left">Email</th>
            <th className="px-4 py-2 border-b text-left">Roli</th>
            <th className="px-4 py-2 border-b text-left">Krijuar më</th>
            <th className="px-4 py-2 border-b text-left">Veprime</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id} className="hover:bg-gray-50">
              <td className="px-4 py-2 border-b text-left">{user.name}</td>
              <td className="px-4 py-2 border-b text-left">{user.email}</td>
              <td className="px-4 py-2 border-b text-left capitalize">{user.role}</td>
              <td className="px-4 py-2 border-b text-left">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : ''}</td>
              <td className="px-4 py-2 border-b text-left flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="hover:bg-blue-600 hover:text-white transition-colors"
                  onClick={() => router.push(`/admin/users/${user.id}/edit`)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Ndrysho
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:bg-red-600 hover:text-white transition-colors"
                  onClick={() => handleDelete(user)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Fshij
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {isDeleteDialogOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <div className="bg-white p-6 rounded shadow-lg">
            <h2 className="text-lg font-bold mb-4">Jeni të sigurt që doni të fshini këtë përdorues?</h2>
            <div className="flex justify-end gap-4">
              <button className="px-4 py-2 bg-gray-200 rounded" onClick={() => setIsDeleteDialogOpen(false)}>Anulo</button>
              <button className="px-4 py-2 bg-red-600 text-white rounded" onClick={confirmDelete}>Fshij</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
