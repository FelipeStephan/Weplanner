import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "./lib/utils"

const buttonVariants = cva(
  "cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap font-['SF_Pro_Display',system-ui,sans-serif] font-medium text-[14px] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#ff5623] disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-[#ff5623] text-white rounded-[10px] hover:bg-[#e84d1f] active:bg-[#d44418] shadow-sm hover:shadow-md",
        outline:
          "bg-[rgba(30,30,30,0.3)] border border-[#2a2a2a] text-[#f5f5f5] rounded-[10px] hover:bg-[#1e1e1e] hover:border-[#3a3a3a] active:bg-[#161616]",
        ghost:
          "bg-transparent text-[#f5f5f5] rounded-[10px] hover:bg-[#1e1e1e] active:bg-[#141414]",
        success:
          "bg-[#019364] text-white rounded-[10px] hover:bg-[#017a53] active:bg-[#016244] shadow-sm hover:shadow-md",
        info:
          "bg-[#987dfe] text-white rounded-[10px] hover:bg-[#8267fd] active:bg-[#6b4ffc] shadow-sm hover:shadow-md",
        danger:
          "bg-[rgba(243,44,44,0.6)] text-white rounded-[10px] hover:bg-[rgba(243,44,44,0.8)] active:bg-[#f32c2c] shadow-sm hover:shadow-md",
        dark:
          "bg-[#171717] text-white rounded-[10px] hover:bg-[#222] active:bg-[#111] shadow-sm hover:shadow-md",
        pill:
          "bg-[#ff5623] text-white rounded-full hover:bg-[#e84d1f] active:bg-[#d44418] shadow-sm hover:shadow-md",
        "pill-dark":
          "bg-[#171717] text-white rounded-full hover:bg-[#222] active:bg-[#111] shadow-sm",
        secondary:
          "bg-[#feba31] text-[#171717] rounded-[10px] hover:bg-[#f0ad1e] active:bg-[#e09e0f] shadow-sm hover:shadow-md",
        // Mantém retrocompatibilidade com shadcn
        default:
          "bg-[#ff5623] text-white rounded-[10px] hover:bg-[#e84d1f] active:bg-[#d44418] shadow-sm hover:shadow-md",
        destructive:
          "bg-[rgba(243,44,44,0.6)] text-white rounded-[10px] hover:bg-[rgba(243,44,44,0.8)] active:bg-[#f32c2c] shadow-sm",
        link: "text-[#ff5623] underline-offset-4 hover:underline bg-transparent",
      },
      size: {
        sm: "h-8 px-3 text-[12px]",
        default: "h-9 px-4",
        lg: "h-11 px-6 text-[15px]",
        icon: "h-9 w-9 p-0",
        "icon-sm": "h-7 w-7 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
