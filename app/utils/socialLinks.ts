export type SocialKind = 'website' | 'twitter' | 'instagram' | 'youtube'

export interface SocialLink {
  kind: SocialKind
  label: string
  href: string
}

interface SocialFields {
  website?: string | null
  twitter?: string | null
  instagram?: string | null
  youtube?: string | null
}

// Redes do perfil como aparecem nas conexões: nome curto (@usuário ou endereço) e link completo
export function socialLinks(profile: SocialFields): SocialLink[] {
  const handle = (value: string) => value.trim().replace(/^@/, '')
  const links: (SocialLink | null)[] = [
    profile.website?.trim()
      ? { kind: 'website', label: profile.website.trim().replace(/^https?:\/\//, '').replace(/\/$/, ''), href: profile.website.trim() }
      : null,
    profile.twitter?.trim()
      ? { kind: 'twitter', label: `@${handle(profile.twitter)}`, href: `https://x.com/${handle(profile.twitter)}` }
      : null,
    profile.instagram?.trim()
      ? { kind: 'instagram', label: `@${handle(profile.instagram)}`, href: `https://instagram.com/${handle(profile.instagram)}` }
      : null,
    profile.youtube?.trim()
      ? { kind: 'youtube', label: profile.youtube.match(/youtube\.com\/(@[^/?#]+)/)?.[1] ?? 'YouTube', href: profile.youtube.trim() }
      : null,
  ]
  return links.filter((link): link is SocialLink => link !== null)
}
