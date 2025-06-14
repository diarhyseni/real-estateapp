import { NextResponse } from 'next/server'
import { prisma } from '@/lib/server/db'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    if (!category) {
      return NextResponse.json(
        { error: 'Category parameter is required' },
        { status: 400 }
      )
    }

    const properties = await prisma.property.findMany({
      where: {
        categoryId: category
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(properties)
  } catch (error) {
    console.error('Error fetching properties by category:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 