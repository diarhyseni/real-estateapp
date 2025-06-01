interface ListingPageHeaderProps {
  title: string
  description: string
  count: number
  isExclusive?: boolean
}

export default function ListingPageHeader({ title, description, count, isExclusive }: ListingPageHeaderProps) {
  return (
    <div className={`py-12 ${isExclusive ? "bg-brand-secondary/10" : "bg-brand-primary/5"}`}>
      <div className="container">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">{title}</h1>
        <p className="text-lg text-slate-600 mb-2">{description}</p>
        <p className="text-sm text-slate-500">{count} prona të disponueshme</p>
      </div>
    </div>
  )
}
