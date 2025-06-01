import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: Request) {
  try {
    await prisma.$connect();

    // Parse the URL to get the search params
    const { searchParams } = new URL(request.url);
    const value = searchParams.get('value');

    let categories;
    if (value) {
      categories = await prisma.category.findMany({
        where: { value: value.toLowerCase() },
        orderBy: { name: 'asc' },
        include: {
          properties: {
            select: {
              id: true,
              title: true,
              location: true,
              statuses: true,
            }
          }
        }
      });
    } else {
      categories = await prisma.category.findMany({
        orderBy: { name: 'asc' },
        include: {
          properties: {
            select: {
              id: true,
              title: true,
              location: true,
              statuses: true,
            }
          }
        }
      });
    }

    const categoriesWithCount = categories.map(category => ({
      id: category.id,
      name: category.name,
      value: category.value,
      properties: category.properties,
      _count: { properties: category.properties.length }
    }));

    return NextResponse.json(categoriesWithCount);
  } catch (error) {
    console.error('Error in /api/categories GET:', error);
    return NextResponse.json([], { status: 200 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: Request) {
  try {
    await prisma.$connect()
    const data = await request.json()
    
    if (!data.name || !data.value) {
      return NextResponse.json({ error: 'Name and value are required' }, { status: 400 })
    }

    const category = await prisma.category.create({
      data: {
        name: data.name,
        value: data.value.toLowerCase() // Ensure value is lowercase
      }
    })

    return NextResponse.json(category)
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
} 