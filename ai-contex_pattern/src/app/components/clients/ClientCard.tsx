import { Building2, Star, CreditCard } from 'lucide-react';
import { cn } from '../ui/utils';
import type { ClientRecord } from '../../../domain/clients/contracts';
import { CLIENT_STATUS_LABELS, CLIENT_STATUS_COLORS } from '../../../domain/clients/contracts';
import type { UserRecord } from '../../../domain/shared/entities';

interface ClientCardProps {
  client: ClientRecord;
  responsible?: UserRecord & { color?: string };
  consumedCredits?: number;
  boardCount?: number;
  onClick?: (client: ClientRecord) => void;
}

function ClientAvatar({ client }: { client: ClientRecord }) {
  const initials = client.name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  if (client.logoUrl) {
    return (
      <img
        src={client.logoUrl}
        alt={client.name}
        className="h-12 w-12 rounded-2xl object-contain bg-white border border-[#E5E7E4] dark:border-[#2D2F30] p-1"
      />
    );
  }

  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ff5623]/10 text-[#ff5623] font-bold text-base dark:bg-[#ff5623]/15">
      {initials}
    </div>
  );
}

export function ClientCard({
  client,
  responsible,
  consumedCredits,
  boardCount = 0,
  onClick,
}: ClientCardProps) {
  const statusColor = CLIENT_STATUS_COLORS[client.status];
  const statusLabel = CLIENT_STATUS_LABELS[client.status];

  const showCredits = client.creditsEnabled;
  const hasContracted = typeof client.contractedCredits === 'number';
  const creditFraction =
    hasContracted && client.contractedCredits! > 0
      ? Math.min((consumedCredits ?? 0) / client.contractedCredits!, 1)
      : 0;
  const isOverBudget = hasContracted && (consumedCredits ?? 0) > client.contractedCredits!;

  return (
    <button
      onClick={() => onClick?.(client)}
      className={cn(
        'group w-full rounded-3xl border bg-white text-left transition-all duration-200',
        'hover:shadow-[0_4px_24px_rgba(0,0,0,0.07)] hover:-translate-y-0.5',
        'border-[#E8EBE8] dark:border-[#232425] dark:bg-[#121313]',
        client.status === 'inactive' && 'opacity-60',
      )}
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <ClientAvatar client={client} />
          {/* Status dot */}
          <div
            className="mt-1 h-2 w-2 flex-shrink-0 rounded-full"
            style={{ backgroundColor: statusColor }}
            title={statusLabel}
          />
        </div>

        {/* Name + sector */}
        <div className="mt-3">
          <p className="font-semibold text-[#171717] dark:text-white leading-tight">{client.name}</p>
          {client.sector && (
            <p className="mt-0.5 text-xs text-[#737373] dark:text-[#A3A3A3]">{client.sector}</p>
          )}
        </div>

        {/* Status badge */}
        <div className="mt-3">
          <span
            className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
            style={{
              backgroundColor: `${statusColor}18`,
              color: statusColor,
            }}
          >
            {statusLabel}
          </span>
        </div>

        {/* Credits */}
        <div className="mt-4 space-y-1.5">
          {showCredits ? (
            <>
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1 text-[#737373] dark:text-[#A3A3A3]">
                  <CreditCard className="h-3 w-3" />
                  Créditos
                </span>
                <span
                  className={cn(
                    'font-semibold',
                    isOverBudget
                      ? 'text-[#dc2626] dark:text-[#fca5a5]'
                      : 'text-[#171717] dark:text-white',
                  )}
                >
                  {consumedCredits ?? 0}
                  {hasContracted ? ` / ${client.contractedCredits}` : ''}
                </span>
              </div>
              {hasContracted && (
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#F0F2F0] dark:bg-[#1E2020]">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all',
                      isOverBudget ? 'bg-[#dc2626]' : 'bg-[#ff5623]',
                    )}
                    style={{ width: `${creditFraction * 100}%` }}
                  />
                </div>
              )}
            </>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#F5F5F5] px-2 py-0.5 text-[11px] text-[#A3A3A3] dark:bg-[#1E2020] dark:text-[#525252]">
              <CreditCard className="h-3 w-3" />
              Sem créditos
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between border-t border-[#F0F2F0] pt-3 dark:border-[#1E2020]">
          {/* Responsible */}
          {responsible ? (
            <div className="flex items-center gap-1.5">
              {responsible.image ? (
                <img
                  src={responsible.image}
                  alt={responsible.name}
                  className="h-5 w-5 rounded-full object-cover"
                />
              ) : (
                <div
                  className="flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold text-white"
                  style={{ backgroundColor: responsible.color ?? '#ff5623' }}
                >
                  {responsible.name[0]}
                </div>
              )}
              <span className="text-[11px] text-[#737373] dark:text-[#A3A3A3]">
                {responsible.name.split(' ')[0]}
              </span>
            </div>
          ) : (
            <span className="text-[11px] text-[#A3A3A3] dark:text-[#525252]">Sem responsável</span>
          )}

          {/* Board count */}
          <div className="flex items-center gap-1 text-[11px] text-[#A3A3A3] dark:text-[#525252]">
            <Star className="h-3 w-3" />
            {boardCount > 0 ? `${boardCount} board${boardCount !== 1 ? 's' : ''}` : 'Sem boards'}
          </div>
        </div>
      </div>
    </button>
  );
}
