import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { firstName, lastName, email, phone, message, source } = body

    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !message) {
      return NextResponse.json(
        { error: "Të gjitha fushat janë të detyrueshme" },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Email adresa nuk është valide" },
        { status: 400 }
      )
    }

    // Create contact in database using raw query
    const contact = await prisma.$queryRaw`
      INSERT INTO "Contact" ("id", "firstName", "lastName", "email", "phone", "message", "source", "status", "createdAt")
      VALUES (
        gen_random_uuid(),
        ${firstName},
        ${lastName},
        ${email},
        ${phone},
        ${message},
        ${source || null},
        'unread',
        CURRENT_TIMESTAMP
      )
      RETURNING *;
    `

    return NextResponse.json({ success: true, contact })
  } catch (error) {
    console.error("Error creating contact:", error)
    return NextResponse.json(
      { error: "Ka ndodhur një gabim. Ju lutemi provoni përsëri." },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    // Get contacts using raw query
    const contacts = await prisma.$queryRaw`
      SELECT * FROM "Contact"
      ORDER BY "createdAt" DESC;
    `
    return NextResponse.json(contacts)
  } catch (error) {
    console.error("Error fetching contacts:", error)
    return NextResponse.json(
      { error: "Ka ndodhur një gabim gjatë marrjes së kontakteve" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, status } = body

    if (!id || !status) {
      return NextResponse.json(
        { error: "ID dhe statusi janë të detyrueshëm" },
        { status: 400 }
      )
    }

    const contact = await prisma.$queryRaw`
      UPDATE "Contact"
      SET "status" = ${status}
      WHERE "id" = ${id}
      RETURNING *;
    `

    return NextResponse.json({ success: true, contact })
  } catch (error) {
    console.error("Error updating contact:", error)
    return NextResponse.json(
      { error: "Ka ndodhur një gabim gjatë përditësimit të kontaktit" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: "ID është e detyrueshme" },
        { status: 400 }
      )
    }

    await prisma.$queryRaw`
      DELETE FROM "Contact"
      WHERE "id" = ${id};
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting contact:", error)
    return NextResponse.json(
      { error: "Ka ndodhur një gabim gjatë fshirjes së kontaktit" },
      { status: 500 }
    )
  }
} 