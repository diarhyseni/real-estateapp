"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Property } from "@/lib/types"
import { Plus, Edit, Trash2, Loader2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import Link from "next/link"

export default function AdminPropertiesPage() {
  const router = useRouter()
  const [properties, setProperties] = useState<Property[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<string>('ALL')
  const [types, setTypes] = useState<{ value: string, name: string }[]>([])

  useEffect(() => {
    fetch('/api/types')
      .then(res => res.json())
      .then(data => setTypes(data))
  }, [])

  useEffect(() => {
    fetchProperties()
  }, [search, filter])

  const fetchProperties = async () => {
    try {
      let url = '/api/properties'
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (filter && filter !== 'ALL') params.append('statuses', filter)
      if (params.toString()) url += `?${params.toString()}`
      
      const response = await fetch(url)
      if (!response.ok) throw new Error('Failed to fetch properties')
      const data = await response.json()
      
      const transformedData = data.map((property: any) => ({
        ...property,
        createdAt: property.createdAt instanceof Date ? property.createdAt.toISOString() : property.createdAt,
        updatedAt: property.updatedAt instanceof Date ? property.updatedAt.toISOString() : property.updatedAt,
      }))
      
      setProperties(transformedData)
    } catch (error) {
      console.error('Error fetching properties:', error)
      toast({
        title: "Error",
        description: "Failed to load properties",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this property?')) return

    try {
      const response = await fetch(`/api/properties/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete property')

      toast({
        title: "Success",
        description: "Property deleted successfully",
      })

      fetchProperties()
    } catch (error) {
      console.error('Error deleting property:', error)
      toast({
        title: "Error",
        description: "Failed to delete property",
        variant: "destructive",
      })
    }
  }

  const formatPrice = (price: number, currency: string) => {
    return `${price.toLocaleString()} ${currency}`;
  };

  const statusMap: Record<string, { label: string; color: string }> = {
    SALE: { label: "Në shitje", color: "bg-[#0D1831] text-white" },
    RENT: { label: "Me qira", color: "bg-blue-100 text-blue-800" },
    EXCLUSIVE: { label: "Ekskluzive", color: "bg-yellow-400 text-white" },
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Pronat</h1>
        <Button onClick={() => router.push('/admin/properties/add')}>
          <Plus className="h-4 w-4 mr-2" />
          Shto pronë
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <input
              type="text"
              placeholder="Kërko pronë..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="border rounded px-3 py-2 w-full md:w-80"
            />
            <div className="flex gap-2 mt-2 md:mt-0">
              <button
                className={`ml-2 px-2 py-1 text-xs rounded ${filter === 'ALL' ? 'bg-gray-200 text-gray-800 font-bold border border-gray-400' : 'bg-white text-gray-800 border border-gray-200'}`}
                onClick={() => setFilter('ALL')}
                type="button"
              >
                Të gjitha
              </button>
              {types.map(type => (
                <button
                  key={type.value}
                  className={`ml-2 px-2 py-1 text-xs rounded ${filter === type.value ? 'bg-gray-300 text-black font-bold border border-gray-400' : 'bg-white text-gray-800 border border-gray-200'}`}
                  onClick={() => setFilter(type.value)}
                  type="button"
                >
                  {type.name}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full whitespace-nowrap">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Titulli</th>
                  <th className="text-left py-3 px-4">Kategoria</th>
                  <th className="text-left py-3 px-4">Çmimi</th>
                  <th className="text-left py-3 px-4">Lokacioni</th>
                  <th className="text-left py-3 px-4">Veprime</th>
                </tr>
              </thead>
              <tbody>
                {properties.map((property) => (
                  <tr key={property.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span>{property.title}</span>
                        {property.statuses?.map((status) => {
                          const statusInfo = statusMap[status] || { label: status, color: "bg-gray-200 text-gray-800" };
                          return (
                            <span key={status} className={`px-2 py-1 text-xs rounded ${statusInfo.color}`}>
                              {statusInfo.label}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                    <td className="py-3 px-4">{property.category?.name}</td>
                    <td className="py-3 px-4">{formatPrice(property.price, property.currency)}</td>
                    <td className="py-3 px-4">{property.location}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Link href={`/admin/properties/${property.id}/edit`}>
                          <Button variant="outline" size="sm" className="hover:bg-blue-600 hover:text-white transition-colors">
                            <Edit className="h-4 w-4 mr-2" />
                            Ndrysho
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:bg-red-600 hover:text-white transition-colors"
                          onClick={() => handleDelete(property.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Fshij
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
