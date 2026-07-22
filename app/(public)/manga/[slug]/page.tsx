import Image from 'next/image'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'

export const revalidate = 3600

async function getWork(slug: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('works')
    .select(`
      id, slug, title_romaji, title_native, author, synopsis, cover_image_url, total_volumes,
      editions (
        id, volume_number, title_override, cover_image_url,
        price_listings ( id, price, currency, in_stock, purchase_url, updated_at, stores ( name, logo_url ) )
      )
    `)
    .eq('slug', slug)
    .order('volume_number', { referencedTable: 'editions' })
    .maybeSingle()

  return data
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const work = await getWork(slug)
  if (!work) return {}
  return {
    title: `${work.title_romaji} — MangaCompara`,
    description: work.synopsis?.slice(0, 160) ?? undefined,
    openGraph: { images: [work.cover_image_url] },
  }
}

export default async function WorkDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const work = await getWork(slug)
  if (!work) notFound()

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row gap-6 mb-10">
        <div className="w-40 shrink-0 aspect-[2/3] relative rounded-lg overflow-hidden bg-muted">
          <Image
            src={work.cover_image_url}
            alt={work.title_romaji}
            fill
            className="object-cover"
            sizes="160px"
          />
        </div>
        <div>
          <h1 className="text-xl font-medium">{work.title_romaji}</h1>
          {work.title_native && (
            <p className="text-sm text-muted-foreground">{work.title_native}</p>
          )}
          {work.author && <p className="text-sm mt-2">{work.author}</p>}
          {work.synopsis && (
            <p className="text-sm text-muted-foreground mt-3 max-w-prose line-clamp-4">
              {work.synopsis}
            </p>
          )}
        </div>
      </div>

      <h2 className="text-base font-medium mb-4">Tomos</h2>

      {work.editions.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Todavía no hay tomos cargados para esta obra.
        </p>
      )}

      <div className="space-y-3">
        {work.editions.map((edition) => {
          const listings = [...edition.price_listings].sort((a, b) => a.price - b.price)

          return (
            <div key={edition.id} className="rounded-xl border p-4">
              <p className="text-sm font-medium mb-2">
                Tomo {edition.volume_number}
                {edition.title_override ? ` — ${edition.title_override}` : ''}
              </p>

              {listings.length === 0 ? (
                <p className="text-xs text-muted-foreground">Sin precios cargados</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {listings.map((listing) => (<a
                  
                    
                      key={listing.id}
                      href={listing.purchase_url}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:border-foreground/30 transition-colors"
                    >
                      <span>{listing.stores?.name}</span>
                      <span className="font-medium">
                        {new Intl.NumberFormat('es-AR', {
                          style: 'currency',
                          currency: listing.currency,
                          maximumFractionDigits: 0,
                        }).format(listing.price)}
                      </span>
                      {!listing.in_stock && (
                        <span className="text-xs text-destructive">Sin stock</span>
                      )}
                    </a>
                
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}