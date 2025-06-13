import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

type RouteContext = {
  params: {
    id: string
  }
}

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  const category = await prisma.category.findUnique({
    where: { id: context.params.id },
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
  context: RouteContext
) {
  const data = await request.json()
  const category = await prisma.category.update({
    where: { id: context.params.id },
    data,
  })
  return NextResponse.json(category)
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  await prisma.category.delete({ where: { id: context.params.id } })
  return NextResponse.json({ success: true })
} 