"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Facebook, Instagram, Mail, MapPin, Phone } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white">
      <div className="container py-10">
        <div className="flex flex-col gap-10 md:flex-row md:gap-0 md:justify-between md:items-start">
          <div className="mb-6 md:mb-0 w-full md:w-1/3">
            <h3 className="text-lg font-bold mb-4 text-brand-secondary">Kontakti</h3>
            <ul className="grid gap-4">
              <li className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-brand-secondary" />
                <a href="tel:+38349123456" className="text-white/80 hover:text-brand-secondary transition-colors">
                  +383 49 123 456
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-brand-secondary" />
                <a href="mailto:info@rokarealestate.com" className="text-white/80 hover:text-brand-secondary transition-colors">
                  info@rokarealestate.com
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-5 w-5 text-brand-secondary mt-1" />
                <span className="text-white/80">
                  Rruga "Agim Ramadani" <br />
                  10000 Prishtinë, Kosovë
                </span>
              </li>
            </ul>
          </div>
          <div className="mb-6 md:mb-0 w-full md:w-1/3">
            <h3 className="text-lg font-bold mb-4 text-brand-secondary">Shërbimet</h3>
            <ul className="grid gap-2">
              <li>
                <Link href="/sale" className="text-white/80 hover:text-brand-secondary transition-colors">
                  Në shitje
                </Link>
              </li>
              <li>
                <Link href="/rent" className="text-white/80 hover:text-brand-secondary transition-colors">
                  Me qira
                </Link>
              </li>
              <li>
                <Link href="/exclusive" className="text-white/80 hover:text-brand-secondary transition-colors">
                  Ekskluzive
                </Link>
              </li>
            </ul>
          </div>
          <div className="w-full md:w-1/3 flex flex-col items-start md:items-end">
            <h3 className="text-lg font-bold mb-4 text-brand-secondary">Na ndiqni</h3>
            <div className="flex gap-4 mb-2">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/80 hover:text-brand-secondary transition-colors"
              >
                <Facebook className="h-7 w-7" />
                <span className="sr-only">Facebook</span>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/80 hover:text-brand-secondary transition-colors"
              >
                <Instagram className="h-7 w-7" />
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
