import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { data, context } = await req.json()

    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }

    const prompt = `
      You are a compassionate and clinical AI assistant for Sahay+, a medication care app.
      Context: ${context}
      Data: ${JSON.stringify(data)}

      Provide a concise, human-centered summary (max 2-3 sentences).
      Focus on actionable insights, positive reinforcement, or gentle warnings.
      Avoid technical jargon. Use a warm, supportive tone.
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
        temperature: 0.7,
        max_tokens: 150,
      }),
    })

    const result = await response.json()
    const summary = result.choices[0]?.message?.content || 'No summary available at this time.'

    return NextResponse.json({ summary })
  } catch (error) {
    console.error('[AI Summary Error]', error)
    return NextResponse.json({ error: 'Failed to generate summary' }, { status: 500 })
  }
}
