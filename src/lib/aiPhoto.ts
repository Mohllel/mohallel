import { supabase } from './supabase'

function splitDataUrl(dataUrl: string): { mimeType: string; base64: string } {
  const match = dataUrl.match(/^data:(.+?);base64,(.+)$/)
  if (!match) throw new Error('صيغة الصورة غير صالحة')
  return { mimeType: match[1], base64: match[2] }
}

/** يحوّل صورة لاعب مرفوعة إلى بورتريه احترافي بزي الفريق، عبر Gemini (يمر بدالة Supabase Edge لإخفاء مفتاح الـ API) */
export async function enhancePlayerPhoto(playerPhotoDataUrl: string, jerseyPhotoDataUrl: string): Promise<string> {
  if (!supabase) throw new Error('الخدمة السحابية غير مُفعّلة — تحقق من إعداد Supabase')

  const player = splitDataUrl(playerPhotoDataUrl)
  const jersey = splitDataUrl(jerseyPhotoDataUrl)

  const { data, error } = await supabase.functions.invoke('enhance-player-photo', {
    body: {
      playerPhotoBase64: player.base64,
      playerPhotoMime: player.mimeType,
      jerseyPhotoBase64: jersey.base64,
      jerseyPhotoMime: jersey.mimeType,
    },
  })

  if (error) throw new Error(error.message || 'فشل توليد الصورة')
  if (!data?.data) throw new Error('لم يتم إرجاع صورة من الخدمة')

  return `data:${data.mimeType || 'image/png'};base64,${data.data}`
}
