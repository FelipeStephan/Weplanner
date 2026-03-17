import { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  Building2,
  ExternalLink,
  Image as ImageIcon,
  Link2,
  Palette,
  Pencil,
  Plus,
  Save,
  Trash2,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { cn } from '../ui/utils';
import {
  clientLibraryRepository,
  type ClientLibraryItem,
} from '../../../repositories/clientLibraryRepository';

type EditableResource = ClientLibraryItem['resources'][number];

const RESOURCE_TYPE_OPTIONS: Array<{
  value: EditableResource['type'];
  label: string;
}> = [
  { value: 'drive', label: 'Banco de imagens' },
  { value: 'brand', label: 'Identidade visual' },
  { value: 'social', label: 'Redes sociais' },
  { value: 'links', label: 'Links importantes' },
];

const RESOURCE_ICON = {
  drive: ImageIcon,
  brand: Palette,
  social: Building2,
  links: Link2,
} as const;

const openInNewTab = (href?: string) => {
  if (!href || typeof window === 'undefined') {
    return;
  }

  window.open(href, '_blank', 'noopener,noreferrer');
};

interface ClientLibraryModalProps {
  isOpen: boolean;
  clientId?: string | null;
  onClose: () => void;
  onSaved?: () => void;
}

const createEmptyResource = (): EditableResource => ({
  id: `resource-${Math.random().toString(36).slice(2, 10)}`,
  label: '',
  href: '',
  type: 'links',
});

export function ClientLibraryModal({
  isOpen,
  clientId,
  onClose,
  onSaved,
}: ClientLibraryModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftResources, setDraftResources] = useState<EditableResource[]>([]);

  const library = useMemo(
    () => (clientId ? clientLibraryRepository.getByClientId(clientId) : null),
    [clientId, isOpen],
  );

  useEffect(() => {
    if (!isOpen) {
      setIsEditing(false);
      setDraftResources([]);
      return;
    }

    setDraftResources(library?.resources ?? []);
    setIsEditing((library?.resources.length ?? 0) === 0);
  }, [isOpen, library]);

  if (!library) {
    return null;
  }

  const resources = isEditing ? draftResources : library.resources;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[760px] rounded-[32px] border-[#E5E7E4] bg-[#F8FAF8] p-0 dark:border-[#2D2F30] dark:bg-[#111214]">
        <DialogHeader className="border-b border-[#E5E7E4] px-6 py-5 text-left dark:border-[#232425]">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF1EA] text-sm font-bold text-[#ff5623] dark:bg-[#26150f] dark:text-[#ffb39c]">
                {library.name
                  .split(' ')
                  .map((part) => part[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
              <div>
                <DialogTitle className="text-xl font-bold tracking-[-0.03em] text-[#171717] dark:text-white">
                  Biblioteca do cliente
                </DialogTitle>
                <DialogDescription className="mt-1 text-sm text-[#737373] dark:text-[#A3A3A3]">
                  {library.name}
                  {library.sector ? ` · ${library.sector}` : ''}
                </DialogDescription>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-2xl dark:border-[#2D2F30]"
                onClick={() => {
                  if (isEditing) {
                    setDraftResources(library.resources);
                    setIsEditing(false);
                    return;
                  }

                  setDraftResources(library.resources);
                  setIsEditing(true);
                }}
              >
                <Pencil className="h-4 w-4" />
                {library.resources.length > 0 ? 'Editar biblioteca' : 'Cadastrar biblioteca'}
              </Button>
              {isEditing ? (
                <Button
                  type="button"
                  className="rounded-2xl bg-[#171717] text-white hover:bg-[#2c2c2c] dark:bg-white dark:text-[#171717] dark:hover:bg-[#ececec]"
                  onClick={() => {
                    clientLibraryRepository.saveByClientId(
                      library.id,
                      draftResources.filter((resource) => resource.label.trim()),
                    );
                    setIsEditing(false);
                    onSaved?.();
                  }}
                >
                  <Save className="h-4 w-4" />
                  Salvar biblioteca
                </Button>
              ) : null}
            </div>
          </div>
        </DialogHeader>

        <div className="max-h-[72vh] overflow-y-auto px-6 py-5">
          {resources.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-[#D8DDD8] bg-white px-5 py-10 text-center dark:border-[#2A2C2D] dark:bg-[#171819]">
              <BookOpen className="mx-auto h-8 w-8 text-[#c8ceca] dark:text-[#4A4D4F]" />
              <p className="mt-4 text-base font-semibold text-[#171717] dark:text-white">
                Nenhum recurso cadastrado
              </p>
              <p className="mt-1 text-sm text-[#737373] dark:text-[#A3A3A3]">
                Adicione links úteis deste cliente para centralizar referências e acessos rápidos.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {resources.map((resource, index) => {
                const Icon = RESOURCE_ICON[resource.type];
                const selectionTypeLabel =
                  RESOURCE_TYPE_OPTIONS.find((option) => option.value === resource.type)?.label ||
                  'Recurso';

                return (
                  <div
                    key={resource.id}
                    className="rounded-[24px] border border-[#E5E7E4] bg-white p-4 dark:border-[#232425] dark:bg-[#171819]"
                  >
                    {isEditing ? (
                      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_200px_auto] md:items-center">
                        <Input
                          value={resource.label}
                          onChange={(event) => {
                            const next = [...draftResources];
                            next[index] = {
                              ...next[index],
                              label: event.target.value,
                            };
                            setDraftResources(next);
                          }}
                          placeholder="Nome do recurso"
                          className="h-11 rounded-2xl border-[#E5E7E4] bg-white dark:border-[#2D2F30] dark:bg-[#121313]"
                        />
                        <select
                          value={resource.type}
                          onChange={(event) => {
                            const next = [...draftResources];
                            next[index] = {
                              ...next[index],
                              type: event.target.value as EditableResource['type'],
                            };
                            setDraftResources(next);
                          }}
                          className="h-11 rounded-2xl border border-[#E5E7E4] bg-white px-3 text-sm text-[#171717] dark:border-[#2D2F30] dark:bg-[#121313] dark:text-white"
                        >
                          {RESOURCE_TYPE_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <Button
                          type="button"
                          variant="outline"
                          className="rounded-2xl border-[#fecaca] text-[#dc2626] hover:bg-[#fff1f2] dark:border-[#5f1d22] dark:text-[#ffb4b8] dark:hover:bg-[#2a1316]"
                          onClick={() => {
                            setDraftResources((current) =>
                              current.filter((draftResource) => draftResource.id !== resource.id),
                            );
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <div className="md:col-span-3">
                          <Input
                            value={resource.href ?? ''}
                            onChange={(event) => {
                              const next = [...draftResources];
                              next[index] = {
                                ...next[index],
                                href: event.target.value,
                              };
                              setDraftResources(next);
                            }}
                            placeholder="https://"
                            className="h-11 rounded-2xl border-[#E5E7E4] bg-white dark:border-[#2D2F30] dark:bg-[#121313]"
                          />
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => openInNewTab(resource.href)}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-[20px] text-left transition-all duration-200',
                          resource.href
                            ? 'group hover:-translate-y-0.5'
                            : 'cursor-default',
                        )}
                      >
                        <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#F6F8F6] text-[#525252] dark:bg-[#1D1F20] dark:text-[#D4D4D4]">
                          <Icon className="h-4.5 w-4.5" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-[#171717] dark:text-white">
                            {resource.label}
                          </p>
                          <p className="mt-1 text-xs text-[#737373] dark:text-[#A3A3A3]">
                            {resource.href || selectionTypeLabel}
                          </p>
                        </div>
                        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#E5E7E4] text-[#525252] transition-colors group-hover:bg-white group-hover:text-[#171717] dark:border-[#2D2F30] dark:text-[#D4D4D4] dark:group-hover:bg-[#121313] dark:group-hover:text-white">
                          <ExternalLink className="h-4 w-4" />
                        </span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {isEditing ? (
          <div className="border-t border-[#E5E7E4] px-6 py-4 dark:border-[#232425]">
            <Button
              type="button"
              variant="outline"
              className="rounded-2xl dark:border-[#2D2F30]"
              onClick={() => setDraftResources((current) => [...current, createEmptyResource()])}
            >
              <Plus className="h-4 w-4" />
              Adicionar item
            </Button>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
