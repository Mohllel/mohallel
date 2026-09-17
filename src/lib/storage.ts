import { supabase } from './supabase'
import { useAuthStore } from '../store/useAuthStore'

function dataUrlToBlob(dataUrl: string): { blob: Blob; ext: string } {
  const [header, base64] = dataUrl.split(',')
  const mime = header.match(/data:(.*?);base64/)?.[1] ?? 'image/png'
  const ext = mime.split('/')[1] ?? 'png'
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return { blob: new Blob([bytes], { type: mime }), ext }
}

/** يرفع صورة (data URL) إلى مجلد النادي النشط حالياً بمخزن club-media، ويرجّع الرابط العام */
export async function uploadImage(path: string, dataUrl: string): Promise<string> {
  if (!supabase) throw new Error('الخدمة السحابية غير مُفعّلة')
  const clubId = useAuthStore.getState().activeClubId
  if (!clubId) throw new Error('يجب تسجيل الدخول أولاً')

  const { blob, ext } = dataUrlToBlob(dataUrl)
  const fullPath = `${clubId}/${path}.${ext}`

  const { error } = await supabase.storage.from('club-media').upload(fullPath, blob, {
    upsert: true,
    contentType: blob.type,
  })
  if (error) throw new Error(error.message)

  const { data } = supabase.storage.from('club-media').getPublicUrl(fullPath)
  return `${data.publicUrl}?v=${Date.now()}`
}
