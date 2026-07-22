// app/(admin)/admin/stores/delete-store-button.tsx
'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { deleteStore } from './actions'

export function DeleteStoreButton({ id, name }: { id: string; name: string }) {
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    const confirmed = window.confirm(
      `¿Borrar "${name}"? Esto también borra todos los precios cargados de esta tienda.`
    )
    if (!confirmed) return

    startTransition(async () => {
      const result = await deleteStore(id)
      if (result.error) toast.error(result.error)
      else toast.success('Tienda borrada')
    })
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleDelete} disabled={isPending}>
      {isPending ? 'Borrando...' : 'Borrar'}
    </Button>
  )
}