"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"
import { signIn, useSession } from "next-auth/react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import Header from "@/components/header"
import Footer from "@/components/footer"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const { update } = useSession()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Të dhënat e kyçjes janë të pasakta. Ju lutemi provoni përsëri.")
        setIsLoading(false)
        return
      }

      // Wait for session to update and fetch the role
      let tries = 0;
      let userRole = null;
      while (tries < 10) {
        await new Promise(res => setTimeout(res, 200));
        await update();
        const sess = await fetch("/api/auth/session").then(r => r.json());
        userRole = sess?.user?.role;
        if (userRole) break;
        tries++;
      }

      if (userRole === "admin" || userRole === "agent") {
        router.push("/admin");
      } else {
        router.push("/");
      }
    } catch (error) {
      setError("Ndodhi një gabim. Ju lutemi provoni përsëri.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center py-12">
        <div className="w-full max-w-md px-4">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-brand-primary">Kyçu në llogarinë tuaj</h1>
              <p className="text-slate-500 mt-2">Shfletoni pronat tuaja të preferuara</p>
            </div>

            {error && <div className="bg-red-50 text-red-600 p-3 rounded-md mb-6 text-sm">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="emri@shembull.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password">Fjalëkalimi</Label>
                  <Link href="/forgot-password" className="text-sm text-brand-secondary hover:underline">
                    Keni harruar fjalëkalimin?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked === true)}
                />
                <label
                  htmlFor="remember"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Më mbaj mend
                </label>
              </div>

              <Button type="submit" className="w-full bg-brand-primary hover:bg-brand-primary/90" disabled={isLoading}>
                {isLoading ? "Duke u kyçur..." : "Kyçu"}
              </Button>

              <div className="text-center text-sm">
                <span className="text-slate-500">Nuk keni llogari? </span>
                <Link href="/register" className="text-brand-secondary hover:underline font-medium">
                  Regjistrohu
                </Link>
              </div>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
