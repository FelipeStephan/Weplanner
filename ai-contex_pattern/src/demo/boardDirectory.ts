import type { ClientRecord, UserRecord } from '../domain/shared/entities';

const AVATAR_URLS = [
  'https://images.unsplash.com/photo-1655249493799-9cee4fe983bb?w=80&h=80&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1672685667592-0392f458f46f?w=80&h=80&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1641808895769-29e63aa2f066?w=80&h=80&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1762708550141-2688121b9ebd?w=80&h=80&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1753162660224-7852bd04f827?w=80&h=80&fit=crop&crop=face',
];

export const BOARD_DIRECTORY_USERS: Array<UserRecord & { color?: string }> = [
  { id: 'user-ana', name: 'Ana Silva', role: 'Gestora de Projetos', image: AVATAR_URLS[0], color: '#ff5623' },
  { id: 'user-carlos', name: 'Carlos Lima', role: 'Desenvolvedor Frontend', image: AVATAR_URLS[1], color: '#987dfe' },
  { id: 'user-mariana', name: 'Mariana Costa', role: 'Designer UI/UX', image: AVATAR_URLS[2], color: '#019364' },
  { id: 'user-rafael', name: 'Rafael Santos', role: 'Desenvolvedor Backend', image: AVATAR_URLS[3], color: '#3b82f6' },
  { id: 'user-julia', name: 'Julia Ferreira', role: 'QA Engineer', image: AVATAR_URLS[4], color: '#f32c2c' },
  { id: 'user-luiza-arcadia', name: 'Luiza Arcadia', role: 'Cliente · Arcadia', image: AVATAR_URLS[0], color: '#feba31' },
  { id: 'user-felipe-weplanner', name: 'Felipe WePlanner', role: 'Cliente · WePlanner', image: AVATAR_URLS[1], color: '#171717' },
  { id: 'user-bruna-ifood', name: 'Bruna iFood', role: 'Cliente · iFood', image: AVATAR_URLS[2], color: '#ff5623' },
  { id: 'user-pedro-nubank', name: 'Pedro Nubank', role: 'Cliente · Nubank', image: AVATAR_URLS[3], color: '#987dfe' },
  { id: 'user-carla-ambev', name: 'Carla Ambev', role: 'Cliente · Ambev', image: AVATAR_URLS[4], color: '#019364' },
];

export const BOARD_DIRECTORY_CLIENTS: ClientRecord[] = [
  { id: 'client-arcadia', name: 'Arcadia', sector: 'Tecnologia' },
  { id: 'client-weplanner', name: 'WePlanner', sector: 'SaaS' },
  { id: 'client-ifood', name: 'iFood', sector: 'Delivery' },
  { id: 'client-nubank', name: 'Nubank', sector: 'Fintech' },
  { id: 'client-ambev', name: 'Ambev', sector: 'Bebidas' },
];
