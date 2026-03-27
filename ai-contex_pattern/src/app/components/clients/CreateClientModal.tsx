import { useState } from 'react';
import { X, Building2, ChevronDown } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../ui/utils';
import type { ClientCreateInput } from '../../../domain/clients/contracts';
import { CLIENT_STATUS_LABELS } from '../../../domain/clients/contracts';
import type { UserRecord } from '../../../domain/shared/entities';

interface CreateClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ClientCreateInput) => void;
  managers: Array<UserRecord & { id: string; color?: string }>;
}

const SECTORS = [
  'Tecnologia', 'SaaS', 'E-commerce', 'Varejo', 'Fintech',
  'Saúde', 'Educação', 'Delivery', 'Bebidas', 'Moda',
  'Imobiliário', 'Agronegócio', 'Entretenimento', 'Serviços', 'Outro',
];

export function CreateClientModal({ isOpen, onClose, onSubmit, managers }: CreateClientModalProps) {
  const [name, setName] = useState('');
  const [sector, setSector] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [responsibleUserId, setResponsibleUserId] = useState('');
  const [status, setStatus] = useState<'active' | 'onboarding' | 'inactive'>('onboarding');
  const [creditsEnabled, setCreditsEnabled] = useState(true);
  const [contractedCredits, setContractedCredits] = useState('');
  const [logoPreviewError, setLogoPreviewError] = useState(false);

  const canSubmit = name.trim().length > 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    onSubmit({
      name: name.trim(),
      sector: sector || undefined,
      logoUrl: logoUrl.trim() || undefined,
      responsibleUserId: responsibleUserId || undefined,
      status,
      creditsEnabled,
      contractedCredits: creditsEnabled && contractedCredits ? Number(contractedCredits) : undefined,
    });
    handleClose();
  }

  function handleClose() {
    setName('');
    setSector('');
    setLogoUrl('');
    setResponsibleUserId('');
    setStatus('onboarding');
    setCreditsEnabled(true);
    setContractedCredits('');
    setLogoPreviewError(false);
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-lg rounded-3xl border border-[#E8EBE8] bg-white shadow-2xl dark:border-[#232425] dark:bg-[#121313]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#F0F2F0] px-6 py-5 dark:border-[#1E2020]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#ff5623]/10">
              <Building2 className="h-4.5 w-4.5 text-[#ff5623]" />
            </div>
            <div>
              <h2 className="font-semibold text-[#171717] dark:text-white">Novo cliente</h2>
              <p className="text-xs text-[#737373] dark:text-[#A3A3A3]">
                Biblioteca criada automaticamente
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-[#A3A3A3] hover:bg-[#F5F5F5] hover:text-[#525252] dark:hover:bg-[#1E2020]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5 px-6 py-6">
          {/* Nome */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#171717] dark:text-white">
              Nome <span className="text-[#ff5623]">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Arcadia, iFood, Nubank..."
              className="w-full rounded-2xl border border-[#E5E7E4] bg-[#FAFAFA] px-4 py-2.5 text-sm text-[#171717] placeholder-[#A3A3A3] focus:border-[#ff5623] focus:outline-none focus:ring-2 focus:ring-[#ff5623]/20 dark:border-[#2D2F30] dark:bg-[#1A1B1C] dark:text-white"
              autoFocus
            />
          </div>

          {/* Setor */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#171717] dark:text-white">
              Setor
            </label>
            <div className="relative">
              <select
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                className="w-full appearance-none rounded-2xl border border-[#E5E7E4] bg-[#FAFAFA] px-4 py-2.5 text-sm text-[#171717] focus:border-[#ff5623] focus:outline-none focus:ring-2 focus:ring-[#ff5623]/20 dark:border-[#2D2F30] dark:bg-[#1A1B1C] dark:text-white"
              >
                <option value="">Selecionar setor...</option>
                {SECTORS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A3A3A3]" />
            </div>
          </div>

          {/* Logo URL */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#171717] dark:text-white">
              Logo (URL)
            </label>
            <div className="flex items-center gap-3">
              {logoUrl && !logoPreviewError ? (
                <img
                  src={logoUrl}
                  alt="preview"
                  onError={() => setLogoPreviewError(true)}
                  className="h-10 w-10 flex-shrink-0 rounded-xl border border-[#E5E7E4] object-contain p-1 dark:border-[#2D2F30]"
                />
              ) : (
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-dashed border-[#D4D4D4] dark:border-[#2D2F30]">
                  <Building2 className="h-4 w-4 text-[#D4D4D4] dark:text-[#525252]" />
                </div>
              )}
              <input
                type="url"
                value={logoUrl}
                onChange={(e) => { setLogoUrl(e.target.value); setLogoPreviewError(false); }}
                placeholder="https://..."
                className="flex-1 rounded-2xl border border-[#E5E7E4] bg-[#FAFAFA] px-4 py-2.5 text-sm text-[#171717] placeholder-[#A3A3A3] focus:border-[#ff5623] focus:outline-none focus:ring-2 focus:ring-[#ff5623]/20 dark:border-[#2D2F30] dark:bg-[#1A1B1C] dark:text-white"
              />
            </div>
          </div>

          {/* Responsável + Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#171717] dark:text-white">
                Responsável
              </label>
              <div className="relative">
                <select
                  value={responsibleUserId}
                  onChange={(e) => setResponsibleUserId(e.target.value)}
                  className="w-full appearance-none rounded-2xl border border-[#E5E7E4] bg-[#FAFAFA] px-4 py-2.5 text-sm text-[#171717] focus:border-[#ff5623] focus:outline-none focus:ring-2 focus:ring-[#ff5623]/20 dark:border-[#2D2F30] dark:bg-[#1A1B1C] dark:text-white"
                >
                  <option value="">Nenhum</option>
                  {managers.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A3A3A3]" />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#171717] dark:text-white">
                Status
              </label>
              <div className="relative">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as typeof status)}
                  className="w-full appearance-none rounded-2xl border border-[#E5E7E4] bg-[#FAFAFA] px-4 py-2.5 text-sm text-[#171717] focus:border-[#ff5623] focus:outline-none focus:ring-2 focus:ring-[#ff5623]/20 dark:border-[#2D2F30] dark:bg-[#1A1B1C] dark:text-white"
                >
                  {(Object.keys(CLIENT_STATUS_LABELS) as Array<keyof typeof CLIENT_STATUS_LABELS>).map((key) => (
                    <option key={key} value={key}>{CLIENT_STATUS_LABELS[key]}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A3A3A3]" />
              </div>
            </div>
          </div>

          {/* Créditos */}
          <div className="rounded-2xl border border-[#E8EBE8] p-4 dark:border-[#232425]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#171717] dark:text-white">Sistema de créditos</p>
                <p className="text-xs text-[#737373] dark:text-[#A3A3A3]">
                  Acompanhar consumo de créditos deste cliente
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCreditsEnabled((v) => !v)}
                className={cn(
                  'relative h-6 w-11 flex-shrink-0 rounded-full overflow-hidden transition-colors duration-200',
                  creditsEnabled ? 'bg-[#ff5623]' : 'bg-[#D4D4D4] dark:bg-[#2D2F30]',
                )}
              >
                <span
                  className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all duration-200"
                  style={{ left: creditsEnabled ? 'calc(100% - 22px)' : '2px' }}
                />
              </button>
            </div>
            {creditsEnabled && (
              <div className="mt-3">
                <label className="mb-1.5 block text-xs font-medium text-[#525252] dark:text-[#A3A3A3]">
                  Créditos contratados
                </label>
                <input
                  type="number"
                  min="0"
                  value={contractedCredits}
                  onChange={(e) => setContractedCredits(e.target.value)}
                  placeholder="Ex: 300"
                  className="w-full rounded-xl border border-[#E5E7E4] bg-[#FAFAFA] px-3 py-2 text-sm text-[#171717] placeholder-[#A3A3A3] focus:border-[#ff5623] focus:outline-none dark:border-[#2D2F30] dark:bg-[#1A1B1C] dark:text-white"
                />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="rounded-2xl border-[#E5E7E4] dark:border-[#2D2F30]"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!canSubmit}
              className="rounded-2xl bg-[#ff5623] text-white hover:bg-[#c2410c] disabled:opacity-50"
            >
              Criar cliente
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
