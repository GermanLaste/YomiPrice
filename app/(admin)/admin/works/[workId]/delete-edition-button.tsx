// app/(admin)/admin/works/[workId]/delete-edition-button.tsx
'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { deleteEdition } from './actions'

export function DeleteEditionButton({
  id,
  workId,
  workSlug,
  volumeNumber,
}: {
  id: string
  workId: string
  workSlug: string
  volumeNumber: number
}) {
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    const confirmed = window.confirm(
      `¿Borrar el tomo ${volumeNumber}? Esto también borra los precios cargados de este tomo.`
    )
    if (!confirmed) return

    startTransition(async () => {
      const result = await deleteEdition(id, workId, workSlug)
      if (result.error) toast.error(result.error)
      else toast.success('Tomo borrado')
    })
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleDelete} disabled={isPending}>
      {isPending ? 'Borrando...' : 'Borrar'}
    </Button>
  )
}