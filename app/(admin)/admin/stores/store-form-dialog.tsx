// app/(admin)/admin/stores/store-form-dialog.tsx
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
import { createStore, updateStore } from './actions'

type Store = {
  id: string
  name: string
  website_url: string
  logo_url: string | null
}

export function StoreFormDialog({ store }: { store?: Store }) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const isEdit = !!store

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = isEdit
        ? await updateStore(store.id, formData)
        : await createStore(formData)

      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success(isEdit ? 'Tienda actualizada' : 'Tienda creada')
      setOpen(false)
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      // ✅ patrón de Base UI
<DialogTrigger
  render={
    <Button variant={isEdit ? 'outline' : 'default'} size={isEdit ? 'sm' : 'default'}>
      {isEdit ? 'Editar' : 'Nueva tienda'}
    </Button>
  }
/>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar tienda' : 'Nueva tienda'}</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">Nombre</label>
            <Input id="name" name="name" required defaultValue={store?.name} />
          </div>
          <div className="space-y-2">
            <label htmlFor="website_url" className="text-sm font-medium">Sitio web</label>
            <Input
              id="website_url"
              name="website_url"
              type="url"
              required
              placeholder="https://..."
              defaultValue={store?.website_url}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="logo_url" className="text-sm font-medium">Logo (URL, opcional)</label>
            <Input id="logo_url" name="logo_url" type="url" defaultValue={store?.logo_url ?? ''} />
          </div>
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Guardando...' : 'Guardar'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}