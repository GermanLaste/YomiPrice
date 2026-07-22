// app/(admin)/admin/works/[workId]/page.tsx
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table'
import { EditionFormDialog } from './edition-form-dialog'
import { DeleteEditionButton } from './delete-edition-button'

export default async function WorkEditionsPage({
  params,
}: {
  params: Promise<{ workId: string }>
}) {
  const { workId } = await params
  const supabase = await createClient()

  const { data: work } = await supabase
    .from('works')
    .select('id, slug, title_romaji, cover_image_url')
    .eq('id', workId)
    .maybeSingle()

  if (!work) notFound()

  const { data: editions } = await supabase
    .from('editions')
    .select('id, volume_number, title_override, isbn')
    .eq('work_id', workId)
    .order('volume_number')

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-16 aspect-[2/3] relative rounded-lg overflow-hidden bg-muted shrink-0">
          <Image src={work.cover_image_url} alt={work.title_romaji} fill className="object-cover" sizes="64px" />
        </div>
        <div>
          <h2 className="text-base font-medium">{work.title_romaji}</h2>
          <p className="text-sm text-muted-foreground">Tomos de esta obra</p>
        </div>
      </div>

      <div className="flex justify-end">
        <EditionFormDialog workId={work.id} workSlug={work.slug} />
      </div>

      {!editions || editions.length === 0 ? (
        <p className="text-sm text-muted-foreground">Todavía no cargaste tomos para esta obra.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tomo</TableHead>
              <TableHead>Subtítulo</TableHead>
              <TableHead>ISBN</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {editions.map((edition) => (
              <TableRow key={edition.id}>
                <TableCell className="font-medium">{edition.volume_number}</TableCell>
                <TableCell className="text-muted-foreground">{edition.title_override ?? '—'}</TableCell>
                <TableCell className="text-muted-foreground">{edition.isbn ?? '—'}</TableCell>
                <TableCell className="text-right space-x-2">
                  <EditionFormDialog workId={work.id} workSlug={work.slug} edition={edition} />
                  <DeleteEditionButton
                    id={edition.id}
                    workId={work.id}
                    workSlug={work.slug}
                    volumeNumber={edition.volume_number}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}