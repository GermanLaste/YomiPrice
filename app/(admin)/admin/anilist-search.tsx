// app/(admin)/admin/anilist-search.tsx
'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { searchAnilist, importWork } from './actions'

type Result = {
  id: number
  title: { romaji: string; native: string | null }
  coverImage: { large: string }
}

export function AnilistSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Result[]>([])
  const [isSearching, startSearch] = useTransition()
  const [importingId, setImportingId] = useState<number | null>(null)

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    startSearch(async () => {
      const { results, error } = await searchAnilist(query)
      if (error) toast.error(error)
      setResults(results)
    })
  }

  async function handleImport(id: number) {
    setImportingId(id)
    const { error } = await importWork(id)
    setImportingId(null)
    if (error) toast.error(error)
    else toast.success('Obra importada')
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar obra en AniList..." />
        <Button type="submit" disabled={isSearching}>
          {isSearching ? 'Buscando...' : 'Buscar'}
        </Button>
      </form>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {results.map((r) => (
          <div key={r.id} className="rounded-xl border bg-card overflow-hidden">
            <div className="aspect-[2/3] bg-muted relative">
              <Image src={r.coverImage.large} alt={r.title.romaji} fill className="object-cover" sizes="200px" unoptimized />
            </div>
            <div className="p-3 space-y-2">
              <p className="text-sm font-medium line-clamp-2">{r.title.romaji}</p>
              <Button size="sm" className="w-full" disabled={importingId === r.id} onClick={() => handleImport(r.id)}>
                {importingId === r.id ? 'Importando...' : 'Importar'}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}