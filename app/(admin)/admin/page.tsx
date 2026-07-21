// app/(admin)/admin/page.tsx
import { AnilistSearch } from './anilist-search'

export default function AdminHomePage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-medium">Importar obra</h2>
        <p className="text-sm text-muted-foreground">Buscá en AniList y creá o actualizá una obra en el catálogo.</p>
      </div>
      <AnilistSearch />
    </div>
  )
}