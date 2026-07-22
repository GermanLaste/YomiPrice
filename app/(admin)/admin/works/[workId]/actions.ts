// app/(admin)/admin/works/[workId]/actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function createEdition(workId: string, workSlug: string, formData: FormData) {
  const volume_number = Number(formData.get('volume_number'))
  const title_override = (formData.get('title_override') as string)?.trim() || null
  const isbn = (formData.get('isbn') as string)?.trim() || null

  if (!volume_number || volume_number < 1) {
    return { error: 'El número de tomo tiene que ser mayor a 0' }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('editions')
    .insert({ work_id: workId, volume_number, title_override, isbn })

  if (error) {
    return { error: error.code === '23505' ? 'Ese número de tomo ya existe para esta obra' : error.message }
  }

  revalidatePath(`/admin/works/${workId}`)
  revalidatePath(`/manga/${workSlug}`)
  return { error: null }
}

export async function updateEdition(id: string, workId: string, workSlug: string, formData: FormData) {
  const volume_number = Number(formData.get('volume_number'))
  const title_override = (formData.get('title_override') as string)?.trim() || null
  const isbn = (formData.get('isbn') as string)?.trim() || null

  if (!volume_number || volume_number < 1) {
    return { error: 'El número de tomo tiene que ser mayor a 0' }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('editions')
    .update({ volume_number, title_override, isbn })
    .eq('id', id)

  if (error) {
    return { error: error.code === '23505' ? 'Ese número de tomo ya existe para esta obra' : error.message }
  }

  revalidatePath(`/admin/works/${workId}`)
  revalidatePath(`/manga/${workSlug}`)
  return { error: null }
}

export async function deleteEdition(id: string, workId: string, workSlug: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('editions').delete().eq('id', id)

  if (error) return { error: error.message }

  revalidatePath(`/admin/works/${workId}`)
  revalidatePath(`/manga/${workSlug}`)
  return { error: null }
}