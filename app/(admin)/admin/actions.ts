// app/(admin)/admin/actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { anilistClient, SEARCH_QUERY, DETAIL_QUERY, extractAuthor, slugify } from '@/lib/anilist/client'

type SearchResult = {
  id: number
  title: { romaji: string; native: string | null }
  coverImage: { large: string }
}

export async function searchAnilist(query: string) {
  if (!query.trim()) return { results: [] as SearchResult[], error: null }

  try {
    const data = await anilistClient.request<{ Page: { media: SearchResult[] } }>(
      SEARCH_QUERY,
      { search: query }
    )
    return { results: data.Page.media, error: null }
  } catch (err: unknown) {
    const status = (err as { response?: { status?: number } })?.response?.status
    if (status === 429) {
      return { results: [], error: 'AniList está limitando las peticiones, esperá unos segundos' }
    }
    return { results: [], error: 'No pudimos conectar con AniList' }
  }
}

export async function importWork(anilistId: number) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const data = await anilistClient.request<{
    Media: {
      id: number
      title: { romaji: string; native: string | null }
      description: string | null
      coverImage: { large: string }
      volumes: number | null
      staff: { edges: { role: string; node: { name: { full: string } } }[] }
    }
  }>(DETAIL_QUERY, { id: anilistId })

  const media = data.Media

  const coverResponse = await fetch(media.coverImage.large)
  if (!coverResponse.ok) return { error: 'No pudimos descargar la portada de AniList' }
  const coverBuffer = await coverResponse.arrayBuffer()
  const path = `works/${media.id}.jpg`

  const { error: uploadError } = await supabase.storage
    .from('covers')
    .upload(path, coverBuffer, { contentType: 'image/jpeg', upsert: true })

  if (uploadError) return { error: `No pudimos subir la portada: ${uploadError.message}` }

  const { data: publicUrlData } = supabase.storage.from('covers').getPublicUrl(path)

  const { error: upsertError } = await supabase.from('works').upsert(
    {
      anilist_id: media.id,
      slug: slugify(media.title.romaji),
      title_romaji: media.title.romaji,
      title_native: media.title.native,
      author: extractAuthor(media.staff),
      synopsis: media.description,
      cover_image_url: publicUrlData.publicUrl,
      total_volumes: media.volumes,
    },
    { onConflict: 'anilist_id' }
  )

  if (upsertError) return { error: upsertError.message }

  revalidatePath('/')
  return { error: null }
}