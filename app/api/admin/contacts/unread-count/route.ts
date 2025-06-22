import { NextResponse } from 'next/server'
import { prisma } from '@/lib/server/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    console.log('=== Unread Count API Called ===')
    
    // Check authentication
    const session = await getServerSession(authOptions)
    console.log('Session:', session)

    if (!session?.user) {
      console.log('No session found')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin or agent
    if (session.user.role !== 'admin' && session.user.role !== 'agent') {
      console.log('User role not authorized:', session.user.role)
      return NextResponse.json(
        { error: 'Forbidden - Admin or agent access required' },
        { status: 403 }
      )
    }

    console.log('User authorized, counting unread contacts...')

    // Count contacts with 'unread' status
    const unreadCount = await prisma.contact.count({
      where: {
        status: 'unread'
      }
    })

    console.log('Unread contacts count:', unreadCount)

    // Also get total contacts for comparison
    const totalCount = await prisma.contact.count()
    console.log('Total contacts count:', totalCount)

    return NextResponse.json({ count: unreadCount })
  } catch (error) {
    console.error('Error fetching unread contacts count:', error)
    return NextResponse.json(
      { error: 'Failed to fetch unread contacts count', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 