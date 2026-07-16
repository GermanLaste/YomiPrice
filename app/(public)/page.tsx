// app/(public)/page.tsx
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Input } from '@/components/ui/input'

export const revalidate = 3600

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ genero?: string; q?: string }>
}) {
  const { genero, q } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('works')
    .select(`
      id, slug, title_romaji, cover_image_url,
      work_genres ( genres ( name, slug ) ),
      editions ( price_listings ( price ) )
    `)
    .order('title_romaji')

  if (q) query = query.ilike('title_romaji', `%${q}%`)

  const { data: works, error } = await query
  const { data: genres } = await supabase.from('genres').select('name, slug').order('name')

  const filtered = genero
    ? (works ?? []).filter((w) => w.work_genres.some((wg) => wg.genres?.slug === genero))
    : (works ?? [])

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <header className="flex flex-wrap items-center justify-between gap-3 mb-8">
        <h1 className="text-lg font-medium">MangaCompara</h1>
        <form className="flex gap-2">
          <select
            name="genero"
            defaultValue={genero ?? ''}
            className="h-9 rounded-md border bg-background px-3 text-sm"
          >
            <option value="">Todos los géneros</option>
            {genres?.map((g) => (
              <option key={g.slug} value={g.slug}>{g.name}</option>
            ))}
          </select>
          <Input name="q" placeholder="Buscar obra..." defaultValue={q ?? ''} className="w-48" />
        </form>
      </header>

      {error && (
        <p className="text-sm text-destructive">No pudimos cargar el catálogo. Intentá de nuevo.</p>
      )}

      {!error && filtered.length === 0 && (
        <p className="text-sm text-muted-foreground">No encontramos obras con ese filtro.</p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {filtered.map((work) => {
          const prices = work.editions.flatMap((e) => e.price_listings.map((p) => p.price))
          const minPrice = prices.length ? Math.min(...prices) : null

          return (
            <Link
              key={work.id}
              href={`/manga/${work.slug}`}
              className="rounded-xl border bg-card overflow-hidden hover:border-foreground/30 transition-colors"
            >
              <div className="aspect-[2/3] bg-muted relative">
                <Image
                  src={work.cover_image_url}
                  alt={work.title_romaji}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              </div>
              <div className="p-3">
                <p className="text-sm font-medium line-clamp-1">{work.title_romaji}</p>
                {minPrice !== null ? (
                  <p className="text-sm mt-1">
                    <span className="text-xs text-muted-foreground">desde </span>
                    <span className="font-medium">
                      {new Intl.NumberFormat('es-AR', {
                        style: 'currency',
                        currency: 'ARS',
                        maximumFractionDigits: 0,
                      }).format(minPrice)}
                    </span>
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground mt-1">Sin precios cargados</p>
                )}
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}