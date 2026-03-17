export interface ClientLibraryResource {
  id: string;
  label: string;
  href?: string;
  type: 'drive' | 'brand' | 'social' | 'links';
}

export const CLIENT_LIBRARY_CATALOG: Record<string, ClientLibraryResource[]> = {
  'client-arcadia': [
    { id: 'arcadia-drive', label: 'Banco de imagens', type: 'drive', href: 'https://drive.google.com/' },
    { id: 'arcadia-brand', label: 'Identidade visual', type: 'brand', href: 'https://www.figma.com/' },
    { id: 'arcadia-instagram', label: 'Instagram / Redes sociais', type: 'social', href: 'https://www.instagram.com/' },
    { id: 'arcadia-links', label: 'Links importantes', type: 'links', href: 'https://www.notion.so/' },
  ],
  'client-weplanner': [
    { id: 'weplanner-drive', label: 'Banco de imagens', type: 'drive', href: 'https://drive.google.com/' },
    { id: 'weplanner-brand', label: 'Identidade visual', type: 'brand', href: 'https://www.figma.com/' },
    { id: 'weplanner-social', label: 'Instagram / Redes sociais', type: 'social', href: 'https://www.instagram.com/' },
    { id: 'weplanner-links', label: 'Links importantes', type: 'links', href: 'https://www.notion.so/' },
  ],
  'client-ifood': [
    { id: 'ifood-drive', label: 'Banco de imagens', type: 'drive', href: 'https://drive.google.com/' },
    { id: 'ifood-brand', label: 'Identidade visual', type: 'brand', href: 'https://www.figma.com/' },
    { id: 'ifood-social', label: 'Instagram / Redes sociais', type: 'social', href: 'https://www.instagram.com/' },
    { id: 'ifood-links', label: 'Links importantes', type: 'links', href: 'https://www.notion.so/' },
  ],
  'client-nubank': [
    { id: 'nubank-drive', label: 'Banco de imagens', type: 'drive', href: 'https://drive.google.com/' },
    { id: 'nubank-brand', label: 'Identidade visual', type: 'brand', href: 'https://www.figma.com/' },
    { id: 'nubank-social', label: 'Instagram / Redes sociais', type: 'social', href: 'https://www.instagram.com/' },
    { id: 'nubank-links', label: 'Links importantes', type: 'links', href: 'https://www.notion.so/' },
  ],
  'client-ambev': [
    { id: 'ambev-drive', label: 'Banco de imagens', type: 'drive', href: 'https://drive.google.com/' },
    { id: 'ambev-brand', label: 'Identidade visual', type: 'brand', href: 'https://www.figma.com/' },
    { id: 'ambev-social', label: 'Instagram / Redes sociais', type: 'social', href: 'https://www.instagram.com/' },
    { id: 'ambev-links', label: 'Links importantes', type: 'links', href: 'https://www.notion.so/' },
  ],
};
