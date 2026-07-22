// app/(admin)/admin/works/page.tsx
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function WorksPage() {
  const supabase = await createClient()
  const { data: works } = await supabase
    .from('works')
    .select('id, slug, title_romaji, cover_image_url, editions(count)')
    .order('title_romaji')

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-medium">Obras</h2>
        <p className="text-sm text-muted-foreground">
          Elegí una obra para cargar sus tomos y precios.
        </p>
      </div>

      {!works || works.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Todavía no importaste ninguna obra desde AniList.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {works.map((work) => (
            <Link
              key={work.id}
              href={`/admin/works/${work.id}`}
              className="rounded-xl border bg-card overflow-hidden hover:border-foreground/30 transition-colors"
            >
              <div className="aspect-[2/3] bg-muted relative">
                <Image
                  src={work.cover_image_url}
                  alt={work.title_romaji}
                  fill
                  className="object-cover"
                  sizes="200px"
                />
              </div>
              <div className="p-3">
                <p className="text-sm font-medium line-clamp-2">{work.title_romaji}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {work.editions[0]?.count ?? 0} tomo(s)
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}