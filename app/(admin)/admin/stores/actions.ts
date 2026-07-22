// app/(admin)/admin/stores/actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function createStore(formData: FormData) {
  const name = (formData.get('name') as string)?.trim()
  const website_url = (formData.get('website_url') as string)?.trim()
  const logo_url = (formData.get('logo_url') as string)?.trim() || null

  if (!name || !website_url) {
    return { error: 'Nombre y sitio web son obligatorios' }
  }

  const supabase = await createClient()
  const { error } = await supabase.from('stores').insert({ name, website_url, logo_url })

  if (error) {
    return { error: error.code === '23505' ? 'Ya existe una tienda con ese nombre' : error.message }
  }

  revalidatePath('/admin/stores')
  return { error: null }
}

export async function updateStore(id: string, formData: FormData) {
  const name = (formData.get('name') as string)?.trim()
  const website_url = (formData.get('website_url') as string)?.trim()
  const logo_url = (formData.get('logo_url') as string)?.trim() || null

  if (!name || !website_url) {
    return { error: 'Nombre y sitio web son obligatorios' }
  }

  const supabase = await createClient()
  const { error } = await supabase.from('stores').update({ name, website_url, logo_url }).eq('id', id)

  if (error) {
    return { error: error.code === '23505' ? 'Ya existe una tienda con ese nombre' : error.message }
  }

  revalidatePath('/admin/stores')
  revalidatePath('/') // fallback simple: puede afectar el precio mínimo mostrado en el catálogo (sección 8)
  return { error: null }
}

export async function deleteStore(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('stores').delete().eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/admin/stores')
  revalidatePath('/')
  return { error: null }
}