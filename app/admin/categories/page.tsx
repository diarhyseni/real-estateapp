"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { PlusCircle, Search, Edit, Trash2, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function CategoriesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [categories, setCategories] = useState<any[]>([])
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null)
  const [types, setTypes] = useState<{ value: string, name: string }[]>([])
  const [selectedType, setSelectedType] = useState<string>("")

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      const res = await fetch("/api/categories")
      const data = await res.json()
      setCategories(data)
    }
    fetchCategories()
  }, [])

  // Fetch types from API
  useEffect(() => {
    fetch('/api/types')
      .then(res => res.json())
      .then(data => setTypes(data))
  }, [])

  // Filter categories based on search term
  const filtered = useMemo(
    () =>
      categories.filter(
        (c) =>
          c.name.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [categories, searchTerm]
  )

  const handleDeleteCategory = (id: string) => {
    setCategoryToDelete(id)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (categoryToDelete) {
      // Call API to delete
      await fetch(`/api/categories/${categoryToDelete}`, { method: "DELETE" })
      setCategories(categories.filter((category) => category.id !== categoryToDelete))
      toast({
        title: "Kategoria u fshi me sukses",
        description: "Kategoria u fshi nga sistemi.",
      })
    }
    setIsDeleteDialogOpen(false)
    setCategoryToDelete(null)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Kategoritë</h1>
        <Link href="/admin/categories/new">
          <Button className="bg-brand-primary hover:bg-brand-primary/90">
            <PlusCircle className="h-4 w-4 mr-2" />
            Shto kategori
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-4 border-b flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <Input
              type="text"
              placeholder="Kërko kategori..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Emri</TableHead>
                <TableHead>Numri i pronave</TableHead>
                <TableHead className="text-right">Veprimet</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>
                    <span className="font-semibold">
                      {category.properties?.length || 0} prona
                    </span>
                  </TableCell>
                  <TableCell className="text-right flex gap-2 justify-end">
                    <Link href={`/admin/categories/${category.id}/edit`}>
                      <Button variant="outline" size="sm" className="hover:bg-blue-600 hover:text-white transition-colors">
                        <Edit className="h-4 w-4 mr-2" />
                        Ndrysho
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      className="text-red-600 hover:bg-red-600 hover:text-white transition-colors"
                      size="sm"
                      onClick={() => handleDeleteCategory(category.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Fshij
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Jeni të sigurt?</AlertDialogTitle>
            <AlertDialogDescription>
              Kjo veprim do të fshijë përgjithmonë kategorinë nga sistemi. Ky veprim nuk mund të kthehet.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anulo</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Fshij
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
