"use client"

import Header from "@/components/header"
import Footer from "@/components/footer"
import { Facebook, Instagram, Linkedin, Youtube, Mail, MapPin, Phone } from "lucide-react"
import Link from "next/link"
import ContactForm from "@/components/contact-form"

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div>
            <h1 className="text-3xl font-bold mb-2">Na kontaktoni</h1>
            <p className="text-gray-600 mb-8">
              Duke plotësuar këtë formë, ju parashtroni pyetjen, apo kërkesën tuaj.
            </p>

            <ContactForm />
          </div>

          {/* Contact Information */}
          <div>
            <h2 className="text-2xl font-bold mb-2">Informatat kontaktuese</h2>
            <p className="text-gray-600 mb-8">
              Parashtroni pyetjet tuaja rreth shërbimeve tona
            </p>

            <div className="space-y-6">
              <div className="flex items-start gap-3">
                <Mail className="w-6 h-6 text-brand-primary mt-1" />
                <div>
                  <h3 className="font-semibold">E-mail</h3>
                  <p className="text-gray-600">info@test.com</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-6 h-6 text-brand-primary mt-1" />
                <div>
                  <h3 className="font-semibold">Lokacioni</h3>
                  <p className="text-gray-600">Rruga Mbretëresha Teutë, Mitrovicë</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-6 h-6 text-brand-primary mt-1" />
                <div>
                  <h3 className="font-semibold">Tel</h3>
                  <p className="text-gray-600">+383 (44) 910-403</p>
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <Link
                  href="https://facebook.com"
                  target="_blank"
                  className="text-gray-600 hover:text-brand-primary"
                >
                  <Facebook className="w-6 h-6" />
                </Link>
                <Link
                  href="https://instagram.com"
                  target="_blank"
                  className="text-gray-600 hover:text-brand-primary"
                >
                  <Instagram className="w-6 h-6" />
                </Link>
                <Link
                  href="https://linkedin.com"
                  target="_blank"
                  className="text-gray-600 hover:text-brand-primary"
                >
                  <Linkedin className="w-6 h-6" />
                </Link>
                <Link
                  href="https://youtube.com"
                  target="_blank"
                  className="text-gray-600 hover:text-brand-primary"
                >
                  <Youtube className="w-6 h-6" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
} 