"use client"

import { useState, useMemo, useEffect } from "react"
import type { Property as PropertyTypeBase } from '@/lib/types'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import { Edit } from "lucide-react"

type Category = {
  id: string;
  name: string;
  value: string;
}

type PropertyType = PropertyTypeBase & { statuses?: string[] }

type Property = {
  id: string;
  title: string;
  description?: string;
  price: number;
  currency: string;
  type: string;
  category?: Category;
  categoryId?: string;
  location: string;
  area: number;
  bedrooms?: number;
  bathrooms?: number;
  parking?: number;
  isExclusive: boolean;
  hasBalcony: boolean;
  hasGarden: boolean;
  hasPool: boolean;
  hasSecurity: boolean;
  hasAirConditioning: boolean;
  hasHeating: boolean;
  hasInternet: boolean;
  hasElevator: boolean;
  images: string[];
  createdAt: string;
  updatedAt: string;
  statuses?: string[];
}

interface PropertyTableProps {
  properties: PropertyType[]
}

export default function PropertyTable({ properties: initialProperties }: PropertyTableProps) {
  const [properties, setProperties] = useState<PropertyType[]>(initialProperties)
  const [search, setSearch] = useState("")
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [sortField, setSortField] = useState<keyof PropertyType | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 15
  const [filter, setFilter] = useState<string>('ALL')
  const router = useRouter()
  const [types, setTypes] = useState<{ value: string, name: string }[]>([])

  useEffect(() => {
    fetch('/api/types')
      .then(res => res.json())
      .then(data => setTypes(data))
  }, [])

  // Fetch properties from backend when search changes
  useEffect(() => {
    const fetchProperties = async () => {
      let url = '/api/properties'
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      // Optionally add filter params here if needed
      if (filter && filter !== 'ALL') params.append('statuses', filter)
      if (params.toString()) url += `?${params.toString()}`
      const res = await fetch(url)
      const data = await res.json()
      setProperties(data)
    }
    fetchProperties()
  }, [search])

  // Category translation map
  const categoryMap: { [key: string]: string } = {
    'house': 'Shtëpi',
    'apartment': 'Banesa',
    'office': 'Zyre',
    'local': 'Lokal',
    'land': 'Troje',
    'warehouse': 'Depo',
    'object': 'Objekte'
  }

  const statusMap: Record<string, { label: string; color: string }> = {
    SALE: { label: "Në shitje", color: "bg-brand-primary text-white" },
    RENT: { label: "Me qira", color: "bg-blue-100 text-blue-800" },
    EXCLUSIVE: { label: "Ekskluzive", color: "bg-yellow-400 text-white" },
    // Add more if needed
  };

  // Get all unique, normalized statuses from types (not from properties)
  const allStatuses = types.map(t => t.value.toLowerCase());

  // Filter properties by search and filter type
  const filtered = useMemo(
    () =>
      properties.filter(
        (p) =>
          filter === 'ALL' ||
          (filter && p.statuses?.some(s => s.trim().toLowerCase() === filter)) &&
          (p.title.toLowerCase().includes(search.toLowerCase()) ||
            p.location.toLowerCase().includes(search.toLowerCase()))
      ),
    [properties, search, filter]
  )

  // Sort the filtered properties
  const sortedProperties = useMemo(() => {
    if (!sortField) return filtered
    return [...filtered].sort((a, b) => {
      const aValue = a[sortField]
      const bValue = b[sortField]
      if (aValue === null || bValue === null) return 0
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
      }
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue
      }
      return 0
    })
  }, [filtered, sortField, sortDirection])

  // Paginate the sorted properties
  const paginatedProperties = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    return sortedProperties.slice(startIndex, startIndex + pageSize)
  }, [sortedProperties, currentPage, pageSize])

  const totalPages = Math.ceil(sortedProperties.length / pageSize)

  const handleSort = (field: keyof PropertyType) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      const response = await fetch(`/api/properties/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        throw new Error('Failed to delete property')
      }
      router.refresh()
    } catch (error) {
      alert('Failed to delete property')
    } finally {
      setDeletingId(null)
    }
  }

  const formatPrice = (price: number, currency: string) => {
    return `${price.toLocaleString()} €`;
  };

  return (
    <div className="overflow-x-auto w-full scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100" style={{ WebkitOverflowScrolling: 'touch' }}>
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
              className={`ml-2 px-2 py-1 text-xs rounded ${filter === type.value.toLowerCase() ? 'bg-gray-300 text-black font-bold border border-gray-400' : 'bg-white text-gray-800 border border-gray-200'}`}
              onClick={() => setFilter(type.value.toLowerCase())}
              type="button"
            >
              {type.name}
            </button>
          ))}
        </div>
      </div>
      <table className="w-full min-w-full whitespace-nowrap">
        <thead>
          <tr className="border-b">
            <th className="text-left py-2 cursor-pointer" onClick={() => handleSort('title')}>
              Titulli {sortField === 'title' && (sortDirection === 'asc' ? '↑' : '↓')}
            </th>
            <th className="text-left py-2 cursor-pointer" onClick={() => handleSort('category')}>
              Kategoria {sortField === 'category' && (sortDirection === 'asc' ? '↑' : '↓')}
            </th>
            <th className="text-left py-2 cursor-pointer" onClick={() => handleSort('price')}>
              Çmimi {sortField === 'price' && (sortDirection === 'asc' ? '↑' : '↓')}
            </th>
            <th className="text-left py-2 cursor-pointer" onClick={() => handleSort('location')}>
              Lokacioni {sortField === 'location' && (sortDirection === 'asc' ? '↑' : '↓')}
            </th>
            <th className="text-left py-2">Veprime</th>
          </tr>
        </thead>
        <tbody>
          {paginatedProperties.map((property) => (
            <tr key={property.id} className="border-b">
              <td className="py-2 flex items-center gap-2">
                {property.title}
                {Array.isArray(property.statuses) && property.statuses.length > 0 && [...new Set(property.statuses)].map((status: string) => {
                  const statusInfo = statusMap[status] || { label: (types.find(t => t.value === status)?.name || status), color: "bg-gray-200 text-gray-800" };
                  return (
                    <span key={status} className={`ml-2 px-2 py-1 text-xs rounded ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                  );
                })}
              </td>
              <td className="py-2">
                {property.category?.value 
                  ? categoryMap[property.category.value.toLowerCase()] 
                  : property.category?.name || 'N/A'}
              </td>
              <td className="py-2">{formatPrice(property.price, property.currency)}</td>
              <td className="py-2">{property.location}</td>
              <td className="py-2 flex gap-2">
                <Link href={`/admin/properties/${property.id}/edit`}>
                  <Button variant="outline" size="sm" className="hover:bg-blue-600 hover:text-white transition-colors">
                    <Edit className="h-4 w-4 mr-2" />
                    Ndrysho
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  className="text-red-600 hover:bg-red-600 hover:text-white transition-colors"
                  size="sm"
                  onClick={() => handleDelete(property.id)}
                  disabled={deletingId === property.id}
                >
                  Fshij
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-4 flex justify-between items-center">
        <div>
          <span>Page {currentPage} of {totalPages}</span>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
} 