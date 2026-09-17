import { uploadImage } from './storage'
import { useClubStore } from '../store/useClubStore'

const isBase64Image = (v: string | null | undefined): v is string => !!v && v.startsWith('data:image')

/** يرفع أي صورة لا تزال محفوظة كـ base64 داخل بيانات النادي إلى Supabase Storage، ويستبدلها برابط */
export async function migrateClubImagesToStorage(): Promise<void> {
  const state = useClubStore.getState()
  const hasBase64 =
    isBase64Image(state.clubLogo) ||
    isBase64Image(state.jerseyPhoto) ||
    isBase64Image(state.headerImage) ||
    state.players.some((p) => isBase64Image(p.photo))
  if (!hasBase64) return

  if (isBase64Image(state.clubLogo)) {
    state.setClubLogo(await uploadImage('club-logo', state.clubLogo))
  }
  if (isBase64Image(state.jerseyPhoto)) {
    state.setJerseyPhoto(await uploadImage('jersey', state.jerseyPhoto))
  }
  if (isBase64Image(state.headerImage)) {
    state.setHeaderImage(await uploadImage('header', state.headerImage))
  }
  for (const player of state.players) {
    if (isBase64Image(player.photo)) {
      const url = await uploadImage(`players/${player.id}`, player.photo)
      useClubStore.getState().setPlayerPhoto(player.id, url)
    }
  }
}
