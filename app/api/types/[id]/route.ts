import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const type = await prisma.type.findUnique({
    where: { id: params.id },
    include: {
      _count: {
        select: { properties: true }
      }
    }
  })
  return NextResponse.json(type)
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const data = await request.json()
  const type = await prisma.type.update({
    where: { id: params.id },
    data,
  })
  return NextResponse.json(type)
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  await prisma.type.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
} 