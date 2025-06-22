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
      <div className="bg-white rounded-lg border shadow-sm p-2 sm:p-6 max-w-full overflow-x-auto">
        <table className="w-full border-collapse" style={{ minWidth: '900px' }}>
          <thead>
            <tr>
              <th className="py-2 px-4 border border-slate-200 text-left">Emri</th>
              <th className="py-2 px-4 border border-slate-200 text-left">Email</th>
              <th className="py-2 px-4 border border-slate-200 text-left">Roli</th>
              <th className="py-2 px-4 border border-slate-200 text-left">Krijuar më</th>
              <th className="py-2 px-4 border border-slate-200 text-right">Veprime</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td className="py-2 px-4 border border-slate-200">{user.name}</td>
                <td className="py-2 px-4 border border-slate-200">{user.email}</td>
                <td className="py-2 px-4 border border-slate-200 capitalize">{user.role}</td>
                <td className="py-2 px-4 border border-slate-200">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : ''}</td>
                <td className="py-2 px-4 border border-slate-200 text-right">
                  <div className="flex gap-2 justify-end">
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
                      className="text-red-600 hover:text-red-800"
                      onClick={() => handleDelete(user)}
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
