import { NextResponse } from 'next/server'
import { prisma } from '@/lib/server/db'
import { NextRequest } from 'next/server'

export async function GET(
  request: NextRequest,
  { params: promisedParams }: { params: Promise<{ slugId: string }> }
) {
  const params = await promisedParams;
  const { slugId } = params;
  
  if (!slugId) {
    return NextResponse.json({ error: "Missing property slugId" }, { status: 400 });
  }
  
  try {
    const property = await prisma.property.findUnique({
      where: { slugId: parseInt(slugId) },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            image: true
          }
        },
        category: true,
        typeRelation: true
      }
    });
    
    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }
    
    return NextResponse.json(property);
  } catch (error: any) {
    console.error('Error fetching property by slugId:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 