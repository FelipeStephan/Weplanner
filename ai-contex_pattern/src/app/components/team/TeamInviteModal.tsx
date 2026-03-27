import { useState } from 'react';
import { X, Mail, Building2, Users } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { cn } from '../ui/utils';
import type { TeamInvite } from '../../../domain/team/contracts';
import type { ClientRecord } from '../../../domain/shared/entities';

interface TeamInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Pick<TeamInvite, 'email' | 'role' | 'clientId'>) => void;
  clients: ClientRecord[];
  inviterName?: string;
}

type InviteRole = 'manager' | 'collaborator' | 'client';

export function TeamInviteModal({
  isOpen,
  onClose,
  onSubmit,
  clients,
  inviterName = 'Gestor',
}: TeamInviteModalProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<InviteRole>('collaborator');
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!email.trim() || !email.includes('@')) {
      setError('Informe um e-mail válido');
      return;
    }
    if (role === 'client' && !selectedClientId) {
      setError('Selecione o cliente (empresa) do usuário');
      return;
    }
    setError('');
    onSubmit({
      email: email.trim().toLowerCase(),
      role,
      clientId: role === 'client' ? selectedClientId : null,
    });
    // Reset
    setEmail('');
    setRole('collaborator');
    setSelectedClientId('');
    onClose();
  };


  if (!isOpen) return null;

  const ROLE_OPTIONS: Array<{ value: InviteRole; label: string; description: string }> = [
    { value: 'collaborator', label: 'Colaborador', description: 'Acessa boards e executa tarefas' },
    { value: 'manager', label: 'Gestor', description: 'Acesso completo ao sistema' },
    { value: 'client', label: 'Cliente', description: 'Acesso restrito ao próprio board e visão geral' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-[#E8EBE8] bg-white shadow-2xl dark:border-[#232425] dark:bg-[#121313]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#F0F2F0] p-6 dark:border-[#1E2020]">
          <div>
            <h2 className="text-[17px] font-semibold text-[#171717] dark:text-white">
              Convidar membro
            </h2>
            <p className="mt-0.5 text-sm text-[#737373] dark:text-[#A3A3A3]">
              O convite expira em 7 dias
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-[#A3A3A3] hover:bg-[#F4F4F4] dark:hover:bg-[#1C1C1C]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-5 p-6">
          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#A3A3A3]">
              E-mail
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A3A3A3]" />
              <Input
                type="email"
                placeholder="nome@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-2xl border-[#E8EBE8] pl-10 dark:border-[#2D2F30]"
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              />
            </div>
          </div>

          {/* Papel */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#A3A3A3]">
              Papel no sistema
            </label>
            <div className="space-y-2">
              {ROLE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setRole(opt.value)}
                  className={cn(
                    'flex w-full items-start gap-3 rounded-2xl border p-3.5 text-left transition-colors',
                    role === opt.value
                      ? 'border-[#ff5623]/30 bg-[#FFF4EE] dark:border-[#ff8c69]/30 dark:bg-[#26150f]'
                      : 'border-[#E8EBE8] bg-white hover:border-[#D4D4D4] dark:border-[#2D2F30] dark:bg-[#171819] dark:hover:border-[#3a3c3d]',
                  )}
                >
                  <span
                    className={cn(
                      'mt-0.5 h-4 w-4 shrink-0 rounded-full border-2 transition-colors',
                      role === opt.value
                        ? 'border-[#ff5623] bg-[#ff5623]'
                        : 'border-[#D4D4D4] dark:border-[#525252]',
                    )}
                  />
                  <div>
                    <p className="text-[13px] font-semibold text-[#171717] dark:text-white">{opt.label}</p>
                    <p className="text-[12px] text-[#737373] dark:text-[#A3A3A3]">{opt.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Vínculo de cliente (só quando role === 'client') */}
          {role === 'client' && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#A3A3A3]">
                Empresa (cliente)
              </label>
              <div className="relative">
                <Building2 className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A3A3A3]" />
                <select
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="w-full rounded-2xl border border-[#E8EBE8] bg-white py-2.5 pl-10 pr-4 text-sm text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#ff5623]/30 dark:border-[#2D2F30] dark:bg-[#171819] dark:text-white"
                >
                  <option value="">Selecionar empresa...</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id ?? ''}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {error && (
            <p className="rounded-2xl bg-[#FEF2F2] px-4 py-2.5 text-sm text-[#dc2626] dark:bg-[#291516] dark:text-[#fca5a5]">
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-[#F0F2F0] px-6 py-4 dark:border-[#1E2020]">
          <Button
            variant="outline"
            onClick={onClose}
            className="rounded-2xl border-[#E8EBE8] dark:border-[#2D2F30]"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            className="rounded-2xl bg-[#ff5623] text-white hover:bg-[#c2410c]"
          >
            <Users className="mr-1.5 h-4 w-4" />
            Enviar convite
          </Button>
        </div>
      </div>
    </div>
  );
}
