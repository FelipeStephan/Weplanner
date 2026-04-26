/**
 * Badge "Novo" — exibido em tasks recém-criadas (≤ 24h após createdAt).
 * Animação pulse com opacidade variável em azul.
 */
export function NewTaskBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold bg-[#dbeafe] text-[#2563eb] dark:bg-[#122033] dark:text-[#3b82f6] dark:border dark:border-[#1d4d88] animate-pulse-soft">
      <span className="size-1.5 rounded-full bg-current" />
      Novo
    </span>
  );
}

/**
 * Helper: determina se uma task deve ser considerada "nova" com base no createdAt.
 * Threshold padrão: 24 horas.
 */
export function isTaskNew(createdAt?: string | null, thresholdHours = 24): boolean {
  if (!createdAt) return false;
  const created = new Date(createdAt).getTime();
  if (Number.isNaN(created)) return false;
  const diffHours = (Date.now() - created) / (1000 * 60 * 60);
  return diffHours <= thresholdHours;
}
