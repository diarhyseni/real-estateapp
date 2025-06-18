import { Property } from "@/lib/types"
import { getProperties } from "@/lib/actions"
import PropertyTable from "@/components/admin/property-table"
import AddPropertyForm from "@/components/admin/add-property-form"

// Force dynamic rendering for admin page
export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const properties = await getProperties({}) as Property[]

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-xl sm:text-3xl font-bold">Paneli i Administratorit</h1>
        <AddPropertyForm />
      </div>
      
      <div className="grid gap-6 ">
        <div className="bg-white rounded-lg shadow p-2 sm:p-6 max-w-full overflow-x-auto">
          <h2 className="text-xl font-semibold mb-4">Pronat</h2>
          <PropertyTable properties={properties} minWidth={1300} />
        </div>
      </div>
    </div>
  )
}
