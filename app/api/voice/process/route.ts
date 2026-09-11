import { NextResponse } from 'next/server'
import { api } from '@/lib/api'

export async function POST(req: Request) {
  try {
    const { text, userId, careRelationshipId } = await req.json()

    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }

    const prompt = `
      The user said: "${text}"
      The user is in a medication care app.
      Identify if the user is reporting taking a medication.
      Return a JSON object with:
      {
        "action": "mark_taken" | "unknown",
        "medicationName": "string" | null,
        "confidence": number (0-1)
      }
      Only return the JSON object, nothing else.
    `

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0,
        response_format: { type: 'json_object' },
      }),
    })

    const result = await response.json()
    const aiResponse = JSON.parse(result.choices[0]?.message?.content || '{}')

    if (aiResponse.action === 'mark_taken' && aiResponse.medicationName) {
      // 1. Find the medication ID by name
      const medsRes = await api.medications.list(careRelationshipId)
      const med = medsRes.medications.find(m =>
        m.name.toLowerCase().includes(aiResponse.medicationName.toLowerCase()) ||
        aiResponse.medicationName.toLowerCase().includes(m.name.toLowerCase())
      )

      if (med) {
        // 2. Mark as taken
        await api.medications.take(String(med.id), userId)
        return NextResponse.json({
          success: true,
          message: `Recorded: ${med.name} marked as taken.`,
          medicationName: med.name
        })
      } else {
        return NextResponse.json({
          success: false,
          message: `I heard "${aiResponse.medicationName}", but couldn't find it in your medication list.`
        })
      }
    }

    return NextResponse.json({
      success: false,
      message: 'I couldn\'t quite catch which medication you took. Could you try again?'
    })
  } catch (error) {
    console.error('[Voice Action Error]', error)
    return NextResponse.json({ error: 'Failed to process voice command' }, { status: 500 })
  }
}
