// app/(admin)/admin/works/[workId]/edition-form-dialog.tsx
'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { createEdition, updateEdition } from './actions'

type Edition = {
  id: string
  volume_number: number
  title_override: string | null
  isbn: string | null
}

export function EditionFormDialog({
  workId,
  workSlug,
  edition,
}: {
  workId: string
  workSlug: string
  edition?: Edition
}) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const isEdit = !!edition

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = isEdit
        ? await updateEdition(edition.id, workId, workSlug, formData)
        : await createEdition(workId, workSlug, formData)

      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success(isEdit ? 'Tomo actualizado' : 'Tomo agregado')
      setOpen(false)
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant={isEdit ? 'outline' : 'default'} size={isEdit ? 'sm' : 'default'}>
            {isEdit ? 'Editar' : 'Agregar tomo'}
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar tomo' : 'Agregar tomo'}</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="volume_number" className="text-sm font-medium">Número de tomo</label>
            <Input
              id="volume_number"
              name="volume_number"
              type="number"
              min={1}
              required
              defaultValue={edition?.volume_number}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="title_override" className="text-sm font-medium">
              Subtítulo (opcional)
            </label>
            <Input id="title_override" name="title_override" defaultValue={edition?.title_override ?? ''} />
          </div>
          <div className="space-y-2">
            <label htmlFor="isbn" className="text-sm font-medium">ISBN (opcional)</label>
            <Input id="isbn" name="isbn" defaultValue={edition?.isbn ?? ''} />
          </div>
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Guardando...' : 'Guardar'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}