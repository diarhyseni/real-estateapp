 export const dynamic = "force-dynamic";

import { Property } from "@/lib/types"
import { getProperties } from "@/lib/actions"
import PropertyTable from "@/components/admin/property-table"
import AddPropertyForm from "@/components/admin/add-property-form"

export default async function AdminPage() {
  const properties = await getProperties({}) as Property[]

  return (
    <div className="py-8 w-full">
      <div className="flex justify-between items-center mb-8 px-6">
        <h1 className="text-3xl font-bold">Paneli i Administratorit</h1>
        <AddPropertyForm />
      </div>
      
      <div className="grid gap-6 px-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Pronat</h2>
          <PropertyTable properties={properties} />
        </div>
      </div>
    </div>
  )
}
