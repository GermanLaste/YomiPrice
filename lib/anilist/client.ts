// lib/anilist/client.ts
import { GraphQLClient } from 'graphql-request'

export const anilistClient = new GraphQLClient('https://graphql.anilist.co')

export const SEARCH_QUERY = `
  query ($search: String) {
    Page(page: 1, perPage: 10) {
      media(search: $search, type: MANGA) {
        id
        title { romaji native }
        coverImage { large }
      }
    }
  }
`

export const DETAIL_QUERY = `
  query ($id: Int) {
    Media(id: $id, type: MANGA) {
      id
      title { romaji native }
      description
      coverImage { large }
      volumes
      staff {
        edges {
          role
          node { name { full } }
        }
      }
    }
  }
`

type StaffEdge = { role: string; node: { name: { full: string } } }

export function extractAuthor(staff: { edges: StaffEdge[] }): string | null {
  const match = staff.edges.find((e) => /story|art/i.test(e.role))
  return match?.node.name.full ?? null
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}