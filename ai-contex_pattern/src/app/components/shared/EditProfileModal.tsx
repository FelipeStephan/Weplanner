import { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  Camera,
  Check,
  ChevronRight,
  Clock,
  Copy,
  Lock,
  Mail,
  Shield,
  ShieldCheck,
  Smartphone,
  Trash2,
  User,
  X,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { cn } from '../ui/utils';

type ProfileTab = 'profile' | '2fa' | 'security';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    name: string;
    image?: string;
    email?: string;
    phone?: string;
    title?: string;
  };
  onSave?: (updates: {
    name?: string;
    image?: string | null;
    title?: string;
    phone?: string;
    email?: string;
    twoFactorEnabled?: boolean;
  }) => void;
}

const TABS: Array<{ id: ProfileTab; label: string; icon: typeof User }> = [
  { id: 'profile', label: 'Perfil', icon: User },
  { id: '2fa', label: 'Autenticação', icon: Shield },
  { id: 'security', label: 'Segurança', icon: Lock },
];

const formatPhone = (value: string): string => {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length === 0) return '';
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10)
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

const generateBackupCodes = (): string[] =>
  Array.from({ length: 8 }, () =>
    Math.random().toString(36).slice(2, 6).toUpperCase() +
    '-' +
    Math.random().toString(36).slice(2, 6).toUpperCase(),
  );

export function EditProfileModal({
  isOpen,
  onClose,
  user,
  onSave,
}: EditProfileModalProps) {
  const [activeTab, setActiveTab] = useState<ProfileTab>('profile');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ─── Profile tab ────────────────────────────────────────────────────────────
  const [name, setName] = useState(user.name);
  const [title, setTitle] = useState(user.title ?? '');
  const [phone, setPhone] = useState(user.phone ?? '');
  const [imagePreview, setImagePreview] = useState<string | null>(user.image ?? null);

  // ─── 2FA tab ─────────────────────────────────────────────────────────────────
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [twoFactorStep, setTwoFactorStep] = useState<'idle' | 'setup' | 'verify' | 'done'>('idle');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [copiedCodes, setCopiedCodes] = useState(false);

  // ─── Security tab ────────────────────────────────────────────────────────────
  const currentEmail = user.email || `${user.name.toLowerCase().replace(/\s+/g, '.')}@weplanner.com`;
  const [secSection, setSecSection] = useState<'idle' | 'password' | 'email' | 'delete'>('idle');
  const [newEmail, setNewEmail] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');

  useEffect(() => {
    if (isOpen) {
      setActiveTab('profile');
      setName(user.name);
      setTitle(user.title ?? '');
      setPhone(user.phone ?? '');
      setImagePreview(user.image ?? null);
      setTwoFactorStep('idle');
      setVerificationCode('');
      setCopiedCodes(false);
      setSecSection('idle');
      setNewEmail('');
      setEmailPassword('');
      setEmailSubmitted(false);
      setEmailError(null);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordError(null);
      setPasswordSuccess(false);
      setDeleteConfirm('');
    }
  }, [isOpen, user]);

  const getInitials = (n: string) =>
    n.split(' ').map((p) => p[0]).join('').toUpperCase().slice(0, 2);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = () => {
    onSave?.({ name, title, phone, image: imagePreview });
    onClose();
  };

  const handleVerify2FA = () => {
    if (verificationCode.length !== 6) return;
    setTwoFactorEnabled(true);
    setBackupCodes(generateBackupCodes());
    setTwoFactorStep('done');
    onSave?.({ twoFactorEnabled: true });
  };

  const handleCopyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'));
    setCopiedCodes(true);
    setTimeout(() => setCopiedCodes(false), 2000);
  };

  const handleDisable2FA = () => {
    setTwoFactorEnabled(false);
    setTwoFactorStep('idle');
    setBackupCodes([]);
    onSave?.({ twoFactorEnabled: false });
  };

  const handleSubmitPassword = () => {
    setPasswordError(null);
    if (currentPassword.length < 4) { setPasswordError('Informe sua senha atual.'); return; }
    if (newPassword.length < 6) { setPasswordError('A nova senha deve ter ao menos 6 caracteres.'); return; }
    if (newPassword !== confirmPassword) { setPasswordError('As senhas não coincidem.'); return; }
    setPasswordSuccess(true);
  };

  const handleSubmitEmail = () => {
    setEmailError(null);
    if (!newEmail.includes('@') || newEmail.length < 5) { setEmailError('Informe um e-mail válido.'); return; }
    if (newEmail === currentEmail) { setEmailError('O novo e-mail deve ser diferente do atual.'); return; }
    if (emailPassword.length < 4) { setEmailError('Confirme sua senha atual.'); return; }
    setEmailSubmitted(true);
  };

  const inputCls = 'h-10 rounded-xl border-[#e5e5e5] bg-[#fafafa] text-sm focus:border-[#ff5623] focus:ring-2 focus:ring-[#ff5623]/20 dark:border-[#2d2f30] dark:bg-[#1a1b1c]';
  const labelCls = 'text-[10px] font-semibold uppercase tracking-wider text-[#a3a3a3]';

  const showFooter =
    (activeTab === 'profile') ||
    (activeTab === 'security' && secSection === 'password' && !passwordSuccess) ||
    (activeTab === 'security' && secSection === 'email' && !emailSubmitted);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="max-w-[560px] gap-0 overflow-hidden rounded-3xl border-[#e5e5e5] bg-white p-0 dark:border-[#2d2f30] dark:bg-[#121313]"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">Editar perfil</DialogTitle>

        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-xl text-[#737373] transition-colors hover:bg-[#f5f5f5] hover:text-[#171717] dark:text-[#A3A3A3] dark:hover:bg-[#1f2122] dark:hover:text-white"
          aria-label="Fechar"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Tabs */}
        <div className="flex justify-center border-b border-[#e5e5e5] dark:border-[#232425]">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'relative flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'text-[#ff5623]'
                    : 'text-[#737373] hover:text-[#171717] dark:text-[#A3A3A3] dark:hover:text-white',
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ff5623]" />
                )}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="max-h-[500px] overflow-y-auto px-6 py-6">

          {/* ─── PERFIL ─────────────────────────────────────────────────────── */}
          {activeTab === 'profile' && (
            <div className="space-y-5">
              {/* Avatar centralizado */}
              <div className="flex flex-col items-center gap-3 pb-2">
                <div className="relative">
                  <div className="h-20 w-20 overflow-hidden rounded-full border-2 border-white shadow-md dark:border-[#1e1e1e]">
                    {imagePreview ? (
                      <img src={imagePreview} alt={name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-[#ff5623] text-xl font-semibold text-white">
                        {getInitials(name)}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#171717] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#2a2a2a] dark:bg-white dark:text-[#121313] dark:hover:bg-[#e5e5e5]"
                  >
                    <Camera className="h-3.5 w-3.5" />
                    Alterar foto
                  </button>
                  {imagePreview && (
                    <button
                      type="button"
                      onClick={() => setImagePreview(null)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#fee2e2] px-3 py-1.5 text-xs font-semibold text-[#dc2626] transition-colors hover:bg-[#fecaca] dark:bg-[#311514] dark:text-[#fca5a5] dark:hover:bg-[#3d1a19]"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remover
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className={labelCls}>Nome completo</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" className={inputCls} />
              </div>

              <div className="space-y-1.5">
                <label className={labelCls}>Cargo</label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Diretor de Arte, Designer" className={inputCls} />
              </div>

              <div className="space-y-1.5">
                <label className={labelCls}>Telefone</label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(formatPhone(e.target.value))}
                  placeholder="(11) 99999-9999"
                  className={inputCls}
                />
              </div>
            </div>
          )}

          {/* ─── AUTENTICAÇÃO 2FA ────────────────────────────────────────────── */}
          {activeTab === '2fa' && (
            <div className="space-y-4">
              {/* Status */}
              <div className="flex items-center justify-between rounded-2xl border border-[#e5e5e5] bg-[#fafafa] p-4 dark:border-[#2d2f30] dark:bg-[#1a1b1c]">
                <div className="flex items-center gap-3">
                  <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', twoFactorEnabled ? 'bg-[#dcfce7] text-[#16a34a] dark:bg-[#12261c] dark:text-[#7ee2b8]' : 'bg-[#f5f5f5] text-[#737373] dark:bg-[#232425] dark:text-[#A3A3A3]')}>
                    {twoFactorEnabled ? <ShieldCheck className="h-5 w-5" /> : <Shield className="h-5 w-5" />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#171717] dark:text-white">Autenticação em duas etapas</p>
                    <p className="mt-0.5 text-xs text-[#737373] dark:text-[#A3A3A3]">
                      {twoFactorEnabled ? 'Sua conta está protegida com 2FA' : 'Adicione uma camada extra de segurança'}
                    </p>
                  </div>
                </div>
                <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold', twoFactorEnabled ? 'bg-[#dcfce7] text-[#16a34a] dark:bg-[#12261c] dark:text-[#7ee2b8]' : 'bg-[#f5f5f5] text-[#737373] dark:bg-[#232425] dark:text-[#A3A3A3]')}>
                  {twoFactorEnabled ? 'Ativado' : 'Desativado'}
                </span>
              </div>

              {/* Método: Email (ativo), App e SMS (em breve) */}
              {twoFactorStep === 'idle' && !twoFactorEnabled && (
                <>
                  <div className="space-y-2">
                    <p className={labelCls}>Método de verificação</p>

                    {/* Email — ativo */}
                    <div className="flex items-center gap-3 rounded-2xl border border-[#ff5623] bg-[#fff7f4] p-4 dark:border-[#ff5623] dark:bg-[#2a1812]">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#ff5623]/10">
                        <Mail className="h-4 w-4 text-[#ff5623]" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-[#171717] dark:text-white">E-mail</p>
                        <p className="mt-0.5 text-xs text-[#737373] dark:text-[#A3A3A3]">Código enviado para {currentEmail}</p>
                      </div>
                      <div className="flex h-4 w-4 items-center justify-center rounded-full border-2 border-[#ff5623]">
                        <div className="h-2 w-2 rounded-full bg-[#ff5623]" />
                      </div>
                    </div>

                    {/* App Authenticator — em breve */}
                    <div className="flex items-center gap-3 rounded-2xl border border-[#e5e5e5] bg-white p-4 opacity-60 dark:border-[#2d2f30] dark:bg-[#1a1b1c]">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f5f5f5] dark:bg-[#232425]">
                        <Shield className="h-4 w-4 text-[#737373] dark:text-[#A3A3A3]" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-[#171717] dark:text-white">App autenticador</p>
                        <p className="mt-0.5 text-xs text-[#737373] dark:text-[#A3A3A3]">Google Authenticator, Authy, 1Password</p>
                      </div>
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#f5f5f5] px-2 py-0.5 text-[10px] font-semibold text-[#737373] dark:bg-[#232425] dark:text-[#A3A3A3]">
                        <Clock className="h-2.5 w-2.5" />
                        Em breve
                      </span>
                    </div>

                    {/* SMS — em breve */}
                    <div className="flex items-center gap-3 rounded-2xl border border-[#e5e5e5] bg-white p-4 opacity-60 dark:border-[#2d2f30] dark:bg-[#1a1b1c]">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f5f5f5] dark:bg-[#232425]">
                        <Smartphone className="h-4 w-4 text-[#737373] dark:text-[#A3A3A3]" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-[#171717] dark:text-white">SMS</p>
                        <p className="mt-0.5 text-xs text-[#737373] dark:text-[#A3A3A3]">Código enviado para seu celular</p>
                      </div>
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#f5f5f5] px-2 py-0.5 text-[10px] font-semibold text-[#737373] dark:bg-[#232425] dark:text-[#A3A3A3]">
                        <Clock className="h-2.5 w-2.5" />
                        Em breve
                      </span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={() => setTwoFactorStep('setup')}
                    className="h-10 w-full rounded-xl bg-[#ff5623] text-sm font-semibold text-white hover:bg-[#e64a1f]"
                  >
                    Ativar 2FA por e-mail
                  </Button>
                </>
              )}

              {/* Setup: envio de código por e-mail */}
              {twoFactorStep === 'setup' && (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-[#e5e5e5] bg-[#fafafa] p-4 dark:border-[#2d2f30] dark:bg-[#1a1b1c]">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#ff5623]/10">
                        <Mail className="h-4 w-4 text-[#ff5623]" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#171717] dark:text-white">Código enviado</p>
                        <p className="mt-0.5 text-xs text-[#737373] dark:text-[#A3A3A3]">
                          Enviamos um código de 6 dígitos para <span className="font-semibold text-[#171717] dark:text-white">{currentEmail}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className={labelCls}>Código de verificação</label>
                    <Input
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="000000"
                      maxLength={6}
                      className="h-12 rounded-xl border-[#e5e5e5] bg-[#fafafa] text-center font-mono text-lg tracking-[0.5em] focus:border-[#ff5623] focus:ring-2 focus:ring-[#ff5623]/20 dark:border-[#2d2f30] dark:bg-[#1a1b1c]"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={() => setTwoFactorStep('idle')} className="h-10 flex-1 rounded-xl text-sm font-semibold">
                      Cancelar
                    </Button>
                    <Button
                      type="button"
                      onClick={handleVerify2FA}
                      disabled={verificationCode.length !== 6}
                      className="h-10 flex-1 rounded-xl bg-[#ff5623] text-sm font-semibold text-white hover:bg-[#e64a1f] disabled:opacity-50"
                    >
                      Verificar e ativar
                    </Button>
                  </div>
                </div>
              )}

              {/* Done — backup codes */}
              {twoFactorStep === 'done' && twoFactorEnabled && (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-[#fef9c3] bg-[#fefce8] p-4 dark:border-[#69511a] dark:bg-[#2a220f]">
                    <div className="flex items-start gap-2.5">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#ca8a04] dark:text-[#fcd34d]" />
                      <div className="flex-1 space-y-2">
                        <p className="text-xs font-semibold text-[#854d0e] dark:text-[#fde68a]">Salve seus códigos de backup</p>
                        <p className="text-xs text-[#a16207] dark:text-[#fcd34d]">
                          Guarde esses códigos em local seguro. Cada um pode ser usado uma vez caso perca acesso ao e-mail.
                        </p>
                        <div className="grid grid-cols-2 gap-1.5 rounded-xl bg-white p-3 font-mono text-xs text-[#171717] dark:bg-[#1a1b1c] dark:text-white">
                          {backupCodes.map((code) => (
                            <div key={code} className="rounded px-2 py-1">{code}</div>
                          ))}
                        </div>
                        <button type="button" onClick={handleCopyBackupCodes} className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#ca8a04] hover:underline dark:text-[#fcd34d]">
                          {copiedCodes ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                          {copiedCodes ? 'Copiado!' : 'Copiar todos'}
                        </button>
                      </div>
                    </div>
                  </div>
                  <button type="button" onClick={handleDisable2FA} className="w-full rounded-xl border border-[#fee2e2] bg-white px-4 py-2.5 text-sm font-semibold text-[#dc2626] transition-colors hover:bg-[#fef2f2] dark:border-[#7c2323] dark:bg-[#1a1b1c] dark:text-[#fca5a5] dark:hover:bg-[#311514]">
                    Desativar 2FA
                  </button>
                </div>
              )}

              {twoFactorStep === 'idle' && twoFactorEnabled && (
                <button type="button" onClick={handleDisable2FA} className="w-full rounded-xl border border-[#fee2e2] bg-white px-4 py-2.5 text-sm font-semibold text-[#dc2626] transition-colors hover:bg-[#fef2f2] dark:border-[#7c2323] dark:bg-[#1a1b1c] dark:text-[#fca5a5] dark:hover:bg-[#311514]">
                  Desativar 2FA
                </button>
              )}
            </div>
          )}

          {/* ─── SEGURANÇA ──────────────────────────────────────────────────── */}
          {activeTab === 'security' && secSection === 'idle' && (
            <div className="space-y-3">
              {/* Alterar senha */}
              <button
                type="button"
                onClick={() => setSecSection('password')}
                className="flex w-full items-center gap-3 rounded-2xl border border-[#e5e5e5] bg-[#fafafa] p-4 text-left transition-colors hover:border-[#d4d4d4] hover:bg-white dark:border-[#2d2f30] dark:bg-[#1a1b1c] dark:hover:border-[#3a3a3a] dark:hover:bg-[#1f2122]"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f5f5f5] text-[#525252] dark:bg-[#232425] dark:text-[#A3A3A3]">
                  <Lock className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[#171717] dark:text-white">Alterar senha</p>
                  <p className="mt-0.5 text-xs text-[#737373] dark:text-[#A3A3A3]">Redefina sua senha de acesso</p>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-[#a3a3a3]" />
              </button>

              {/* Trocar e-mail */}
              <button
                type="button"
                onClick={() => setSecSection('email')}
                className="flex w-full items-center gap-3 rounded-2xl border border-[#e5e5e5] bg-[#fafafa] p-4 text-left transition-colors hover:border-[#d4d4d4] hover:bg-white dark:border-[#2d2f30] dark:bg-[#1a1b1c] dark:hover:border-[#3a3a3a] dark:hover:bg-[#1f2122]"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f5f5f5] text-[#525252] dark:bg-[#232425] dark:text-[#A3A3A3]">
                  <Mail className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[#171717] dark:text-white">Trocar e-mail</p>
                  <p className="mt-0.5 text-xs text-[#737373] dark:text-[#A3A3A3]">{currentEmail}</p>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-[#a3a3a3]" />
              </button>

              {/* Excluir conta */}
              <button
                type="button"
                onClick={() => setSecSection('delete')}
                className="flex w-full items-center gap-3 rounded-2xl border border-[#fee2e2] bg-[#fef2f2] p-4 text-left transition-colors hover:bg-[#fee2e2] dark:border-[#7c2323] dark:bg-[#1f1212] dark:hover:bg-[#311514]"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fee2e2] text-[#dc2626] dark:bg-[#311514] dark:text-[#fca5a5]">
                  <Trash2 className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[#dc2626] dark:text-[#fca5a5]">Excluir conta</p>
                  <p className="mt-0.5 text-xs text-[#ef4444]/70 dark:text-[#fca5a5]/70">Esta ação é permanente e irreversível</p>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-[#ef4444]/50" />
              </button>
            </div>
          )}

          {/* Alterar senha */}
          {activeTab === 'security' && secSection === 'password' && (
            <div className="space-y-4">
              <button type="button" onClick={() => { setSecSection('idle'); setPasswordError(null); setPasswordSuccess(false); }} className="flex items-center gap-1.5 text-xs font-semibold text-[#737373] hover:text-[#171717] dark:hover:text-white">
                <ArrowLeft className="h-3.5 w-3.5" />
                Voltar
              </button>

              {passwordSuccess ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#dcfce7] dark:bg-[#12261c]">
                    <Check className="h-6 w-6 text-[#16a34a] dark:text-[#7ee2b8]" />
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-[#171717] dark:text-white">Senha alterada com sucesso</h3>
                  <p className="mt-2 text-sm text-[#737373] dark:text-[#A3A3A3]">Sua nova senha já está ativa.</p>
                </div>
              ) : (
                <>
                  <div className="space-y-1.5">
                    <label className={labelCls}>Senha atual</label>
                    <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="••••••••" className={inputCls} />
                  </div>
                  <div className="space-y-1.5">
                    <label className={labelCls}>Nova senha</label>
                    <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Mínimo 6 caracteres" className={inputCls} />
                  </div>
                  <div className="space-y-1.5">
                    <label className={labelCls}>Confirmar nova senha</label>
                    <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repita a nova senha" className={inputCls} />
                  </div>
                  {passwordError && (
                    <div className="rounded-xl border border-[#fee2e2] bg-[#fef2f2] px-3 py-2 text-xs text-[#dc2626] dark:border-[#7c2323] dark:bg-[#311514] dark:text-[#fca5a5]">
                      {passwordError}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Trocar e-mail */}
          {activeTab === 'security' && secSection === 'email' && (
            <div className="space-y-4">
              <button type="button" onClick={() => { setSecSection('idle'); setEmailError(null); setEmailSubmitted(false); }} className="flex items-center gap-1.5 text-xs font-semibold text-[#737373] hover:text-[#171717] dark:hover:text-white">
                <ArrowLeft className="h-3.5 w-3.5" />
                Voltar
              </button>

              {emailSubmitted ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#dcfce7] dark:bg-[#12261c]">
                    <Mail className="h-6 w-6 text-[#16a34a] dark:text-[#7ee2b8]" />
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-[#171717] dark:text-white">Confira sua caixa de entrada</h3>
                  <p className="mt-2 max-w-[320px] text-sm text-[#737373] dark:text-[#A3A3A3]">
                    Enviamos um link de confirmação para{' '}
                    <span className="font-semibold text-[#171717] dark:text-white">{newEmail}</span>.
                    Clique no link em até 24h.
                  </p>
                  <button type="button" onClick={() => setEmailSubmitted(false)} className="mt-4 text-xs font-semibold text-[#ff5623] hover:underline">
                    Trocar e-mail destino
                  </button>
                </div>
              ) : (
                <>
                  <div className="rounded-2xl border border-[#e5e5e5] bg-[#fafafa] p-3 dark:border-[#2d2f30] dark:bg-[#1a1b1c]">
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-[#737373] dark:text-[#A3A3A3]" />
                      <div className="flex-1">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-[#a3a3a3]">E-mail atual</p>
                        <p className="mt-0.5 text-sm font-medium text-[#171717] dark:text-white">{currentEmail}</p>
                      </div>
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#dcfce7] px-2 py-0.5 text-[10px] font-semibold text-[#16a34a] dark:bg-[#12261c] dark:text-[#7ee2b8]">
                        <Check className="h-2.5 w-2.5" />
                        Verificado
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className={labelCls}>Novo e-mail</label>
                    <Input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="seu.novo@email.com" className={inputCls} />
                  </div>

                  <div className="space-y-1.5">
                    <label className={labelCls}>Confirme sua senha</label>
                    <Input type="password" value={emailPassword} onChange={(e) => setEmailPassword(e.target.value)} placeholder="••••••••" className={inputCls} />
                  </div>

                  <div className="flex gap-2 rounded-xl border border-[#dbeafe] bg-[#eff6ff] p-3 dark:border-[#1d4d88] dark:bg-[#122033]">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#2563eb] dark:text-[#60a5fa]" />
                    <p className="text-xs text-[#2563eb] dark:text-[#93c5fd]">
                      Você receberá um link de confirmação. Seu login continua com o e-mail atual até confirmar.
                    </p>
                  </div>

                  {emailError && (
                    <div className="rounded-xl border border-[#fee2e2] bg-[#fef2f2] px-3 py-2 text-xs text-[#dc2626] dark:border-[#7c2323] dark:bg-[#311514] dark:text-[#fca5a5]">
                      {emailError}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Excluir conta */}
          {activeTab === 'security' && secSection === 'delete' && (
            <div className="space-y-4">
              <button type="button" onClick={() => { setSecSection('idle'); setDeleteConfirm(''); }} className="flex items-center gap-1.5 text-xs font-semibold text-[#737373] hover:text-[#171717] dark:hover:text-white">
                <ArrowLeft className="h-3.5 w-3.5" />
                Voltar
              </button>

              <div className="rounded-2xl border border-[#fee2e2] bg-[#fef2f2] p-4 dark:border-[#7c2323] dark:bg-[#1f1212]">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#fee2e2] dark:bg-[#311514]">
                    <Trash2 className="h-4 w-4 text-[#dc2626] dark:text-[#fca5a5]" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-[#dc2626] dark:text-[#fca5a5]">Zona de perigo</p>
                    <p className="text-xs text-[#ef4444]/80 dark:text-[#fca5a5]/80">
                      Ao excluir sua conta, todos os seus dados, projetos e histórico serão permanentemente removidos. <strong>Esta ação não pode ser desfeita.</strong>
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className={labelCls}>
                  Digite <span className="text-[#dc2626]">EXCLUIR</span> para confirmar
                </label>
                <Input
                  value={deleteConfirm}
                  onChange={(e) => setDeleteConfirm(e.target.value)}
                  placeholder="EXCLUIR"
                  className="h-10 rounded-xl border-[#fee2e2] bg-[#fef2f2] text-sm focus:border-[#dc2626] focus:ring-2 focus:ring-[#dc2626]/20 dark:border-[#7c2323] dark:bg-[#1f1212]"
                />
              </div>

              <Button
                type="button"
                disabled={deleteConfirm !== 'EXCLUIR'}
                className="h-10 w-full rounded-xl bg-[#dc2626] text-sm font-semibold text-white hover:bg-[#b91c1c] disabled:opacity-40"
              >
                Excluir minha conta permanentemente
              </Button>
            </div>
          )}
        </div>

        {/* Footer */}
        {showFooter && (
          <div className="flex items-center justify-end gap-2 border-t border-[#e5e5e5] px-6 py-4 dark:border-[#232425]">
            <Button type="button" variant="outline" onClick={onClose} className="h-9 rounded-xl px-4 text-sm font-semibold">
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={
                activeTab === 'profile'
                  ? handleSaveProfile
                  : secSection === 'password'
                  ? handleSubmitPassword
                  : handleSubmitEmail
              }
              className="h-9 rounded-xl bg-[#ff5623] px-4 text-sm font-semibold text-white hover:bg-[#e64a1f]"
            >
              {activeTab === 'profile'
                ? 'Salvar alterações'
                : secSection === 'password'
                ? 'Alterar senha'
                : 'Enviar confirmação'}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
