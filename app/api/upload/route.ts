import { writeFile } from 'fs/promises'
import path from 'path'
import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuid } from 'uuid'
import { mkdirSync, existsSync } from 'fs'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const files = formData.getAll('files') as File[]

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files uploaded' }, { status: 400 })
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf']
    const MAX_SIZE = 5 * 1024 * 1024 // 5MB

    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true })
    }

    const urls: string[] = []

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json({ error: `File type ${file.type} not allowed` }, { status: 400 })
      }

      if (file.size > MAX_SIZE) {
        return NextResponse.json({ error: `File ${file.name} is too large` }, { status: 413 })
      }

      const buffer = Buffer.from(await file.arrayBuffer())
      const filename = `${uuid()}_${file.name.replace(/\s+/g, '_')}`
      const filePath = path.join(uploadDir, filename)

      await writeFile(filePath, buffer)
      urls.push(`/uploads/${filename}`)
    }

    return NextResponse.json({ urls }, { status: 200 })

  } catch (err) {
    console.error('File upload error:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
