import { Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import WePlannerLogo from '../../../assets/logo-weplanner.png';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { cn } from '../ui/utils';

interface LoginPageProps {
  onLoginSuccess: () => void;
  darkMode?: boolean;
}

// Dummy data for the floating cards to match Image 2
const FLOATING_CARDS = [
  { name: 'Ana Silva', initials: 'AS', message: 'This is the future!', bgColor: 'bg-emerald-500' },
  { name: 'Carlos Lima', initials: 'CL', message: 'Typing ...', bgColor: 'bg-indigo-500', isTyping: true },
  { name: 'Maria Souza', initials: 'MS', message: 'Yes.', bgColor: 'bg-rose-500' },
  { name: 'Pedro Rosa', initials: 'PR', message: 'They’re just a fad.', bgColor: 'bg-sky-500' },
  { name: 'João Santos', initials: 'JS', message: 'No way!', bgColor: 'bg-amber-500' },
  { name: 'Lucia Costa', initials: 'LC', message: 'Is there proven value?', bgColor: 'bg-fuchsia-500' },
  { name: 'Julia Ferreira', initials: 'JF', message: 'I wouldn’t.', bgColor: 'bg-teal-500' },
  { name: 'Mariana Costa', initials: 'MC', message: 'I agree, it’s the future!', bgColor: 'bg-violet-500' },
  { name: 'Rafael Silva', initials: 'RS', message: 'Aesthetic is great.', bgColor: 'bg-pink-500' },
  { name: 'Gabriel Souza', initials: 'GS', message: 'Perfect layout.', bgColor: 'bg-blue-500' },
  { name: 'Isabela Rosa', initials: 'IR', message: 'Amazing work!', bgColor: 'bg-orange-500' },
];

// Helper to repeat items to make seamless infinite scroll
const createMarqueeRow = (items: typeof FLOATING_CARDS, count = 2) => {
  return Array(count).fill(items).flat();
};

export function LoginPage({ onLoginSuccess, darkMode }: LoginPageProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      onLoginSuccess();
    }
  };

  return (
    <div className="min-h-screen w-full bg-white dark:bg-[#0a0a0a] flex flex-col lg:flex-row overflow-hidden">
      {/* === Left Side: Login Form === */}
      <div className="w-full lg:w-1/2 xl:w-[45%] flex flex-col justify-between px-8 py-10 md:px-14 xl:px-24 h-screen shrink-0 relative z-10 overflow-y-auto">
        
        {/* Top Logo */}
        <div className="flex items-center gap-2 mt-2 lg:mt-8">
          <img src={WePlannerLogo} alt="WePlanner Logo" className="w-8 h-8 object-contain drop-shadow-sm" />
          <span className="font-[900] text-xl tracking-tight text-[#171717] dark:text-white" style={{ fontFamily: 'var(--font-rounded)' }}>
            WePlanner
          </span>
        </div>

        {/* Form Content */}
        <div className="flex-1 flex flex-col justify-center max-w-[400px] w-full mx-auto">
            <div className="mb-10 text-center lg:text-left">
              <h1 className="text-3xl md:text-[40px] font-bold text-[#171717] dark:text-white tracking-tight leading-tight mb-2">
                Welcome back<span className="inline-block ml-2 wave-emoji">👋</span>
              </h1>
              <p className="text-[#737373] text-[15px] font-medium mt-4">
                Please enter your details.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-4">
                <div className="relative">
                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-[52px] rounded-full px-5 border-[#E5E5E5] bg-transparent text-[#171717] placeholder:text-[#A3A3A3] focus-visible:ring-[#ff5623]/20 focus-visible:border-[#ff5623] dark:border-[#333] dark:text-white dark:focus-visible:ring-[#ff5623]/30"
                    required
                  />
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 text-[#A3A3A3]">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2" ry="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                  </div>
                </div>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-[52px] rounded-full px-5 border-[#E5E5E5] bg-transparent text-[#171717] placeholder:text-[#A3A3A3] focus-visible:ring-[#ff5623]/20 focus-visible:border-[#ff5623] dark:border-[#333] dark:text-white pr-12 dark:focus-visible:ring-[#ff5623]/30"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-[#A3A3A3] hover:text-[#171717] dark:hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm py-1">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className={cn(
                    "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                    rememberMe 
                      ? "bg-[#171717] border-[#171717] dark:bg-white dark:border-white" 
                      : "border-[#D4D4D4] group-hover:border-[#A3A3A3] dark:border-[#525252]"
                  )}>
                    {rememberMe && <CheckCircle2 className="w-3 h-3 text-white dark:text-[#171717]" strokeWidth={3} />}
                  </div>
                  <input type="checkbox" className="hidden" checked={rememberMe} onChange={() => setRememberMe(!rememberMe)} />
                  <span className="text-[#525252] dark:text-[#A3A3A3] font-medium group-hover:text-[#171717] dark:group-hover:text-white transition-colors">
                    Remember for 30 days
                  </span>
                </label>

                <a href="#" className="font-semibold text-[#171717] hover:text-[#ff5623] dark:text-white dark:hover:text-[#ff5623] transition-colors">
                  Forgot password?
                </a>
              </div>

              <Button
                type="submit"
                className="w-full h-[52px] rounded-full bg-[#ff5623] hover:bg-[#c2410c] text-white font-semibold text-[15px] transition-all hover:shadow-[0_8px_20px_-8px_rgba(255,86,35,0.6)]"
              >
                Log In
              </Button>
            </form>

            <div className="mt-8 text-center text-sm">
              <span className="text-[#737373]">Don't have an account? </span>
              <a href="#" className="font-bold text-[#171717] hover:text-[#ff5623] dark:text-white dark:hover:text-[#ff5623] transition-colors">
                Sign Up
              </a>
            </div>
          </div>
          
          <div className="mb-2 lg:mb-8 hidden lg:block opacity-0">Spacer</div>
        </div>

        {/* === Right Side: Visual Animation Area === */}
        <div className="hidden lg:flex flex-1 p-4 lg:p-6 xl:p-8 h-screen">
          <div className="w-full h-full rounded-[2.5rem] xl:rounded-[3rem] bg-[#EBE5DE] dark:bg-[#1E1E1E] overflow-hidden relative flex flex-col justify-center gap-5 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.05)]">
            
            {/* Overlay Gradient for smooth fading edges */}
            <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#EBE5DE] dark:from-[#1E1E1E] to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#EBE5DE] dark:from-[#1E1E1E] to-transparent z-10 pointer-events-none" />

            {/* Marquee Row 1 */}
            <div className="flex w-[200%] gap-5 animate-marquee pause-on-hover px-5">
              {createMarqueeRow(FLOATING_CARDS.slice(0, 4)).map((card, i) => (
                <FloatingPill key={`r1-${i}`} {...card} index={i} />
              ))}
            </div>

            {/* Marquee Row 2 (Reverse) */}
            <div className="flex w-[200%] gap-5 animate-marquee-reverse pause-on-hover px-5 ml-[-100px]">
              {createMarqueeRow(FLOATING_CARDS.slice(4, 8)).map((card, i) => (
                <FloatingPill key={`r2-${i}`} {...card} index={i} />
              ))}
            </div>

            {/* Marquee Row 3 */}
            <div className="flex w-[200%] gap-5 animate-marquee pause-on-hover px-5 ml-24">
              {createMarqueeRow(FLOATING_CARDS.slice(8, 12)).map((card, i) => (
                <FloatingPill key={`r3-${i}`} {...card} index={i} />
              ))}
            </div>
            
            {/* Optional Marquee Row 4 (Reverse) */}
            <div className="flex w-[200%] gap-5 animate-marquee-reverse pause-on-hover px-5 mt-2">
              {createMarqueeRow(FLOATING_CARDS.slice(0, 5).reverse()).map((card, i) => (
                <FloatingPill key={`r4-${i}`} {...card} index={i} />
              ))}
            </div>

          </div>
        </div>
    </div>
  );
}

// A single Pill Card 
function FloatingPill({ name, initials, message, bgColor, isTyping, index }: any) {
  return (
    <div className="shrink-0 flex items-center gap-3 bg-white dark:bg-[#202020] rounded-full py-2.5 px-3.5 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.06)] dark:shadow-none transition-transform hover:scale-105 cursor-default">
      <Avatar className={cn("h-11 w-11 border-2 border-white dark:border-[#202020] shadow-sm", bgColor)}>
        <AvatarFallback className="text-white text-xs font-semibold bg-transparent">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="pr-3">
        {isTyping ? (
          <div className="flex items-center gap-1.5 h-full opacity-60">
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        ) : (
          <span className="text-[15px] font-medium text-[#171717] dark:text-[#E0E0E0] tracking-tight">
            {message}
          </span>
        )}
      </div>
    </div>
  );
}
