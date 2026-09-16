// Supabase Edge Function: enhance-player-photo
// Proxies a two-image edit request to Gemini ("nano banana") so the API key never
// reaches the browser. Deploy with:
//   supabase functions deploy enhance-player-photo
// Then set the secret once:
//   supabase secrets set GEMINI_API_KEY=your_key_here
import { corsHeaders } from '../_shared/cors.ts'

const GEMINI_MODEL = 'gemini-2.5-flash-image'
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`

const PROMPT = `Create a photorealistic professional volleyball player portrait, photographed
from his anatomical right at a 30-degree three-quarter angle. Natural relaxed
stance, same friendly expression as in the reference. Do not mirror the image.

IDENTITY (from reference image 1): Preserve his facial identity, eye shape, nose,
jawline, smile, skin tone, hairline, facial hair and apparent age exactly. Do not
beautify or reconstruct the face. Maintain his original physique and proportions —
head size, shoulder width, neck length, torso length, arm length, apparent height
and athletic build. Use image 1 ONLY for face, hairstyle, skin tone and body
proportions — do NOT copy its red jacket or its background.

WARDROBE (from reference image 2 only): Dress him in the jersey shown in image 2,
matching its design, colors, patterns and placement as closely as possible,
fitted naturally to HIS original body. If shorts are visible, use white shorts.
Do NOT copy the body, pose, face or background of the person wearing the
reference uniform. Do not invent extra numbers, letters or logos that are not
visible in image 2.

LIGHTING: Realistic sports-portrait lighting recreated in a studio — a broad
overhead light balanced with soft frontal fill to light the eyes and reduce
under-eye shadows. Neutral white balance for accurate skin and jersey colors.
Enhance fabric detail without artificial smoothing or exaggerated sharpness.

BACKGROUND: A completely plain, solid medium-gray studio background, easy to
remove. No sports hall, no net, no seating, no lights, no scenery. No gradients,
no textures, no background shadows, no text. Keep all subject edges natural and
clearly defined, no halos, no background color spill.

CAMERA: Eye-level, natural 85mm lens perspective, head-to-upper-thigh framing,
vertical 4:5 composition. Keep head, shoulders and elbows inside the frame with
comfortable margins.

NEGATIVE: no invented numbers or sponsor text, no volleyball unless requested, no
beautified or reshaped face, no changed body proportions, no mirrored image, no
background scenery, no gradient background, no distorted hands, no extra
fingers, no watermark, no text overlay.`

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { playerPhotoBase64, playerPhotoMime, jerseyPhotoBase64, jerseyPhotoMime } = await req.json()

    if (!playerPhotoBase64 || !jerseyPhotoBase64) {
      return json({ error: 'missing playerPhotoBase64 or jerseyPhotoBase64' }, 400)
    }

    const apiKey = Deno.env.get('GEMINI_API_KEY')
    if (!apiKey) return json({ error: 'GEMINI_API_KEY secret is not configured' }, 500)

    const geminiRes = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { inline_data: { mime_type: playerPhotoMime || 'image/jpeg', data: playerPhotoBase64 } },
              { inline_data: { mime_type: jerseyPhotoMime || 'image/jpeg', data: jerseyPhotoBase64 } },
              { text: PROMPT },
            ],
          },
        ],
      }),
    })

    if (!geminiRes.ok) {
      const errText = await geminiRes.text()
      return json({ error: `Gemini error (${geminiRes.status}): ${errText}` }, 502)
    }

    const result = await geminiRes.json()
    const parts = result?.candidates?.[0]?.content?.parts ?? []
    // deno-lint-ignore no-explicit-any
    const imagePart = parts.find((p: any) => p.inlineData || p.inline_data)
    const inline = imagePart?.inlineData || imagePart?.inline_data

    if (!inline?.data) return json({ error: 'Gemini returned no image' }, 502)

    return json({ mimeType: inline.mimeType || inline.mime_type || 'image/png', data: inline.data })
  } catch (e) {
    return json({ error: String(e) }, 500)
  }
})

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}
