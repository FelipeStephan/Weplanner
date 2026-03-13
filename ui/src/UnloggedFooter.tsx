'use client';

export const UnloggedFooter = ({ brand }: { brand?: string }) => {
    return (
        <div className="w-full text-center pointer-events-none mt-auto shrink-0">
            <p className="text-white/60 text-[10px] tracking-widest uppercase">
                {brand ?? 'Loopera'} © {new Date().getFullYear()}
            </p>
        </div>
    );
};
