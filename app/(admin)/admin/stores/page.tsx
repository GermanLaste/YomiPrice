// app/(admin)/admin/stores/page.tsx
import { createClient } from '@/lib/supabase/server'
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table'
import { StoreFormDialog } from './store-form-dialog'
import { DeleteStoreButton } from './delete-store-button'

export default async function StoresPage() {
  const supabase = await createClient()
  const { data: stores } = await supabase.from('stores').select('*').order('name')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-medium">Tiendas</h2>
          <p className="text-sm text-muted-foreground">Comercios donde se cargan precios por tomo.</p>
        </div>
        <StoreFormDialog />
      </div>

      {!stores || stores.length === 0 ? (
        <p className="text-sm text-muted-foreground">Todavía no cargaste ninguna tienda.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Sitio web</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stores.map((store) => (
              <TableRow key={store.id}>
                <TableCell className="font-medium">{store.name}</TableCell>
                <TableCell className="text-muted-foreground">{store.website_url}</TableCell>
                <TableCell className="text-right space-x-2">
                  <StoreFormDialog store={store} />
                  <DeleteStoreButton id={store.id} name={store.name} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}