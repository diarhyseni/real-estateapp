// This is a mock implementation for demonstration purposes
// In a real application, you would integrate with your backend API

import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/server/db"
import GoogleProvider from "next-auth/providers/google"
import bcrypt from "bcryptjs"
import { JWT } from "next-auth/jwt"
import CredentialsProvider from "next-auth/providers/credentials"
import { AdapterUser } from "next-auth/adapters"

export type UserRole = "user" | "agent" | "admin"

export interface User {
  id: string
  name: string | null
  email: string | null
  role: UserRole
  image?: string | null
  phone?: string | null
  address?: string | null
  emailVerified?: Date | null
}

declare module "next-auth" {
  interface Session {
    user: User
  }
  interface User {
    id: string
    name: string | null
    email: string | null
    role: UserRole
    image?: string | null
    phone?: string | null
    address?: string | null
    emailVerified?: Date | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: UserRole
    name?: string | null
    email?: string | null
    image?: string | null
    phone?: string | null
    address?: string | null
  }
}

// Mock users database
const users = [
  {
    id: "admin1",
    name: "Admin User",
    email: "admin@rokarealestate.com",
    password: "Admin123!",
    role: "admin" as UserRole,
  },
]

// Mock user storage
let currentUser: User | null = null

export const authOptions: NextAuthOptions = {
  secret: "24ae06230b3b6e7eaa35d978208aeb0c399b620e0305d9665b4bdc660f31413b",
  adapter: PrismaAdapter(prisma) as any,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email dhe fjalëkalimi janë të detyrueshëm")
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user || !user.password) {
          throw new Error("Email ose fjalëkalimi i gabuar")
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

        if (!isPasswordValid) {
          throw new Error("Email ose fjalëkalimi i gabuar")
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role as UserRole,
          image: user.image,
          phone: user.phone,
          address: user.address,
          emailVerified: user.emailVerified
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.image = user.image
        token.phone = user.phone
        token.address = user.address
      }

      // Update token if session is updated
      if (trigger === "update" && session) {
        token.name = session.user.name
        token.email = session.user.email
        token.image = session.user.image
        token.role = session.user.role
        token.phone = session.user.phone
        token.address = session.user.address
      }

      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id
        session.user.role = token.role as UserRole
        session.user.image = token.image
        session.user.phone = token.phone
        session.user.address = token.address
      }
      return session
    },
  },
  debug: true,
}

export async function loginUser(email: string, password: string, rememberMe: boolean = false): Promise<User> {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to login')
    }

    const user = await response.json()
    
    // Store user data in localStorage or sessionStorage
    const storage = rememberMe ? localStorage : sessionStorage
    storage.setItem('user', JSON.stringify(user))
    
    return user
  } catch (error) {
    console.error('Login error:', error)
    throw error
  }
}

export async function registerUser(name: string, email: string, password: string): Promise<User> {
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to register')
    }

    const user = await response.json()
    return user
  } catch (error) {
    console.error('Registration error:', error)
    throw error
  }
}

export function logoutUser() {
  // Clear user data from both storages
  localStorage.removeItem('user')
  sessionStorage.removeItem('user')
}

export function getCurrentUser(): User | null {
  // Try to get user from sessionStorage first, then localStorage
  const userData = sessionStorage.getItem('user') || localStorage.getItem('user')
  return userData ? JSON.parse(userData) : null
}

export function isAuthenticated(): boolean {
  return getCurrentUser() !== null
}

export function isAdmin(): boolean {
  const user = getCurrentUser()
  return user?.role === 'admin'
}

export function isAgent(): boolean {
  const user = getCurrentUser()
  return user !== null && (user.role === "admin" || user.role === "agent")
}

// Admin functions
export async function createUser(name: string, email: string, password: string, role: UserRole): Promise<User> {
  if (!isAdmin()) {
    throw new Error("Unauthorized")
  }

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      throw new Error("User already exists")
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role
      }
    })

    // Return user without password
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as UserRole,
    }
  } catch (error) {
    console.error('Create user error:', error)
    throw error
  }
}

export async function updateUserRole(userId: string, role: UserRole): Promise<User> {
  if (!isAdmin()) {
    throw new Error("Unauthorized")
  }

  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { role }
    })

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as UserRole,
    }
  } catch (error) {
    console.error('Update user role error:', error)
    throw error
  }
}
