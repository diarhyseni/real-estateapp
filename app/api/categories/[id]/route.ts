import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const category = await prisma.category.findUnique({
    where: { id: params.id },
    include: {
      _count: {
        select: { properties: true }
      }
    }
  })
  return NextResponse.json(category)
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const data = await request.json()
  const category = await prisma.category.update({
    where: { id: params.id },
    data,
  })
  return NextResponse.json(category)
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  await prisma.category.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
} 