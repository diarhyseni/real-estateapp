import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function GET(
  request: NextRequest,
  { params: promisedParams }: { params: Promise<{ id: string }> }
) {
  const params = await promisedParams;
  const user = await prisma.user.findUnique({
    where: { id: params.id },
    select: { 
      id: true, 
      name: true, 
      email: true, 
      role: true, 
      createdAt: true, 
      image: true,
      phone: true,
      address: true
    }
  })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
  return NextResponse.json(user)
}

export async function PUT(
  request: NextRequest,
  { params: promisedParams }: { params: Promise<{ id: string }> }
) {
  const params = await promisedParams;
  try {
    const { name, email, role, password, image, phone, address } = await request.json()
    let data: any = { name, email, role, image, phone, address }
    if (password) {
      data.password = await bcrypt.hash(password, 10)
    }
    const user = await prisma.user.update({
      where: { id: params.id },
      data,
      select: { 
        id: true, 
        name: true, 
        email: true, 
        role: true, 
        createdAt: true, 
        image: true,
        phone: true,
        address: true
      }
    })
    return NextResponse.json(user)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params: promisedParams }: { params: Promise<{ id: string }> }
) {
  const params = await promisedParams;
  try {
    await prisma.user.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
  }
} 