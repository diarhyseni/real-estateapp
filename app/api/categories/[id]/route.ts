import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params: promisedParams }: { params: Promise<{ id: string }> }
) {
  const params = await promisedParams;
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
  request: NextRequest,
  { params: promisedParams }: { params: Promise<{ id: string }> }
) {
  const params = await promisedParams;
  const data = await request.json()
  const category = await prisma.category.update({
    where: { id: params.id },
    data,
  })
  return NextResponse.json(category)
}

export async function DELETE(
  request: NextRequest,
  { params: promisedParams }: { params: Promise<{ id: string }> }
) {
  const params = await promisedParams;
  await prisma.category.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
} 