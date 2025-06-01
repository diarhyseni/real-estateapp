import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Heart, Share2, MapPin, Maximize2, Bed, Bath, Car, Phone, Mail, Check } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Property } from "@/lib/types"
import { cn, formatPrice } from "@/lib/utils"
import { ImageGallery } from "./image-gallery"
import ContactForm from "@/components/contact-form"

interface PropertyDetailsProps {
  property: Property & {
    user?: {
      id: string
      name: string | null
      email: string | null
      phone: string | null
      image: string | null
    },
    address?: string
  }
}

export default function PropertyDetails({ property }: PropertyDetailsProps) {
  if (!property) {
    return null
  }

  return (
    <div>
      <Link href="/" className="inline-flex items-center gap-2 mb-6 text-sm font-medium hover:underline">
        <ArrowLeft className="h-4 w-4" />
        Kthehu në kërkim
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="mb-6">
            <div className="flex items-start justify-between mb-2">
              <h1 className="text-2xl md:text-3xl font-bold">{property.title}</h1>
              <div className="flex gap-2">
                <Button variant="outline" size="icon">
                  <Heart className="h-5 w-5" />
                  <span className="sr-only">Add to favorites</span>
                </Button>
                <Button variant="outline" size="icon">
                  <Share2 className="h-5 w-5" />
                  <span className="sr-only">Share property</span>
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-2 text-slate-500 mb-4">
              <MapPin className="h-4 w-4" />
              <span>{property.location}</span>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <Badge variant={property.statuses?.includes('RENT') ? "secondary" : "default"}>
                {property.statuses?.includes('RENT') ? "Me qira" : "Në shitje"}
              </Badge>
              {property.isExclusive && (
                <Badge className="bg-brand-secondary hover:bg-brand-secondary/90">Ekskluzive</Badge>
              )}
            </div>
            <div className="flex items-center gap-x-2">
              <span className="text-2xl font-bold">
                {formatPrice(property.price, property.currency)}
              </span>
            </div>
          </div>

          <div className="mb-8">
            <ImageGallery images={property.images} />
          </div>

          <Tabs
            defaultValue="details"
            className="[&>div[role=tablist]]:border-b [&>div[role=tablist]]:border-gray-200"
          >
            <TabsList className="w-full grid grid-cols-3 bg-transparent [&>button[data-state=active]]:bg-transparent [&>button[data-state=active]]:text-brand-secondary [&>button[data-state=active]]:border-b-2 [&>button[data-state=active]]:border-brand-secondary [&>button]:rounded-none">
              <TabsTrigger value="details">Detajet</TabsTrigger>
              <TabsTrigger value="features">Karakteristikat</TabsTrigger>
              <TabsTrigger value="location">Vendndodhja</TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="pt-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {property.bedrooms !== null && property.bedrooms !== undefined && (
                  <div className="flex flex-col items-center justify-center border rounded-lg py-6 bg-white">
                    <Bed className="h-6 w-6 mb-2 text-brand-secondary" />
                    <div className="text-sm text-slate-500">Dhoma gjumi</div>
                    <div className="text-xl font-bold">{property.bedrooms}</div>
                  </div>
                )}
                {property.bathrooms !== null && property.bathrooms !== undefined && (
                  <div className="flex flex-col items-center justify-center border rounded-lg py-6 bg-white">
                    <Bath className="h-6 w-6 mb-2 text-brand-secondary" />
                    <div className="text-sm text-slate-500">Banjo</div>
                    <div className="text-xl font-bold">{property.bathrooms}</div>
                  </div>
                )}
                <div className="flex flex-col items-center justify-center border rounded-lg py-6 bg-white">
                  <Maximize2 className="h-6 w-6 mb-2 text-brand-secondary" />
                  <div className="text-sm text-slate-500">Sipërfaqja</div>
                  <div className="text-xl font-bold">{property.area || '-'} {property.areaUnit || 'm²'}</div>
                </div>
                {property.parking !== null && property.parking !== undefined && property.parking > 0 && (
                  <div className="flex flex-col items-center justify-center border rounded-lg py-6 bg-white">
                    <Car className="h-6 w-6 mb-2 text-brand-secondary" />
                    <div className="text-sm text-slate-500">Parking</div>
                    <div className="text-xl font-bold">{property.parking}</div>
                  </div>
                )}
              </div>

              {property.description && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Përshkrimi</h3>
                  <div className="prose max-w-none">
                    {property.description.split('\n').map((paragraph, index) => (
                      <p key={index} className="mb-4">{paragraph}</p>
                    ))}
                  </div>
                  {property.address && (
                    <div className="mt-2 text-base text-gray-700">
                      <strong>Adresa e plotë:</strong> {property.address}
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
            <TabsContent value="features" className="pt-4">
              <div>
                <h3 className="text-xl font-semibold mb-4">Karakteristikat</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                {property.characteristics && property.characteristics.length > 0 && (
                    property.characteristics.map((characteristic, index) => (
                      <div key={index} className="flex items-center gap-2 py-2">
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                        <span>{characteristic}</span>
                      </div>
                    ))
                  )}
                  {property.hasBalcony && (
                    <div className="flex items-center gap-2 py-2">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <span>Ka ballkon</span>
                    </div>
                  )}
                  {property.hasGarden && (
                    <div className="flex items-center gap-2 py-2">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <span>Ka kopsht</span>
                    </div>
                  )}
                  {property.hasPool && (
                    <div className="flex items-center gap-2 py-2">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <span>Ka pishinë</span>
                    </div>
                  )}
                  {property.hasSecurity && (
                    <div className="flex items-center gap-2 py-2">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <span>Ka siguri</span>
                    </div>
                  )}
                  {property.hasAirConditioning && (
                    <div className="flex items-center gap-2 py-2">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <span>Ka kondicioner</span>
                    </div>
                  )}
                  {property.hasHeating && (
                    <div className="flex items-center gap-2 py-2">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <span>Ka ngrohje</span>
                    </div>
                  )}
                  {property.hasInternet && (
                    <div className="flex items-center gap-2 py-2">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <span>Ka internet</span>
                    </div>
                  )}
                  {property.hasElevator && (
                    <div className="flex items-center gap-2 py-2">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <span>Ka ashensor</span>
                    </div>
                  )}
                  
                </div>
              </div>
            </TabsContent>
            <TabsContent value="location" className="pt-4">
              <h3 className="text-xl font-semibold mb-4">Lokacioni</h3>
              <div className="aspect-[16/9] overflow-hidden rounded-lg bg-slate-100 mb-4 relative h-[450px]">
                {property.googleMapsIframe ? (
                  <div 
                    className="absolute inset-0"
                    dangerouslySetInnerHTML={{ 
                      __html: property.googleMapsIframe.replace(
                        'width="600" height="450"',
                        'width="100%" height="100%"'
                      ).replace(
                        'style="border:0;"',
                        'style="border:0; width:100%; height:100%; position:absolute; top:0; left:0;"'
                      )
                    }}
                  />
                ) : (
                  <Image
                    src="/placeholder.svg?height=450&width=800&text=Map"
                    alt="Property location map"
                    width={800}
                    height={450}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              {property.nearbyPlaces && property.nearbyPlaces.length > 0 && (
                <>
                  <h4 className="font-semibold mb-4">Në afërsi</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                    {property.nearbyPlaces.map((place, index) => (
                      <div key={index} className="flex items-center gap-2 py-2">
                        <div className="h-2 w-2 rounded-full bg-blue-500" />
                        <span>
                          {(() => {
                            const match = place.match(/(.+?)\s*\(([^)]+)\)/);
                            if (match) {
                              return `${match[1].trim()} (${match[2].trim()} km)`;
                            } else {
                              return place;
                            }
                          })()}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <div>
          <div className="sticky top-24 border rounded-lg p-6 bg-white">
            <h3 className="text-xl font-semibold mb-4 text-brand-primary">Kontaktoni agjentin</h3>
            <div className="flex items-center gap-4 mb-6">
              <Avatar className="h-16 w-16">
                {property.user?.image ? (
                  <AvatarImage src={property.user.image} alt={property.user.name || 'Agent'} />
                ) : null}
                <AvatarFallback className="bg-brand-secondary text-white text-xl">
                  {property.user?.name ? property.user.name.charAt(0).toUpperCase() : 'A'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h4 className="font-semibold">{property.user?.name || 'Agjent'}</h4>
                <div className="font-semibold">Agjent i licensuar</div>
                
              </div>
            </div>
            <div className="space-y-4">
              {property.user?.phone && (
                <Button variant="outline" className="w-full justify-start gap-2" asChild>
                  <Link href={`tel:${property.user.phone}`}>
                    <Phone className="h-4 w-4" />
                    {property.user.phone}
                  </Link>
                </Button>
              )}
              {property.user?.email && (
                <Button variant="outline" className="w-full justify-start gap-2" asChild>
                  <Link href={`mailto:${property.user.email}`}>
                    <Mail className="h-4 w-4" />
                    Dërgo email
                  </Link>
                </Button>
              )}
              <div className="text-center text-slate-600 my-4">
                Ose, na kontaktoni duke plotësuar formën
              </div>
              <ContactForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 