"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Facebook, Instagram, Mail, MapPin, Phone } from "lucide-react"

export default function Footer() {
  const [categories, setCategories] = useState([])

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories")
        const data = await res.json()
        setCategories(data)
      } catch (error) {
        console.error("Error fetching categories:", error)
      }
    }
    fetchCategories()
  }, [])

  return (
    <footer className="bg-brand-primary text-white">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4 text-brand-secondary">Kontakti</h3>
            <ul className="grid gap-4">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-brand-secondary" />
                <a href="tel:+38349123456" className="text-white/80 hover:text-brand-secondary">
                  +383 49 123 456
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-brand-secondary" />
                <a href="mailto:info@rokarealestate.com" className="text-white/80 hover:text-brand-secondary">
                  info@rokarealestate.com
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-brand-secondary mt-1" />
                <span className="text-white/80">
                  Rruga "Agim Ramadani" <br />
                  10000 Prishtinë, Kosovë
                </span>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4 text-brand-secondary">Kategoritë</h3>
            <ul className="grid gap-2">
              {categories.map((category: any) => (
                <li key={category.id}>
                  <Link href={`/category/${category.value.toLowerCase()}`} className="text-white/80 hover:text-brand-secondary">
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4 text-brand-secondary">Shërbimet</h3>
            <ul className="grid gap-2">
              <li>
                <Link href="/sale" className="text-white/80 hover:text-brand-secondary">
                  Në shitje
                </Link>
              </li>
              <li>
                <Link href="/rent" className="text-white/80 hover:text-brand-secondary">
                  Me qira
                </Link>
              </li>
              <li>
                <Link href="/exclusive" className="text-white/80 hover:text-brand-secondary">
                  Ekskluzive
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4 text-brand-secondary">Na ndiqni</h3>
            <div className="flex gap-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/80 hover:text-brand-secondary"
              >
                <Facebook className="h-6 w-6" />
                <span className="sr-only">Facebook</span>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/80 hover:text-brand-secondary"
              >
                <Instagram className="h-6 w-6" />
                <span className="sr-only">Instagram</span>
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container py-6 text-center text-sm text-white/60">
          <p>© {new Date().getFullYear()} Roka Real Estate. Të gjitha të drejtat e rezervuara.</p>
        </div>
      </div>
    </footer>
  )
}
