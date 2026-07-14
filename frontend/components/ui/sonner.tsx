"use client"

import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CheckCircle2, Info, Loader2, TriangleAlert, XCircle } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      offset={{ top: 16, right: 16 }}
      gap={8}
      icons={{
        success: <CheckCircle2 className="h-5 w-5 text-emerald-400" />,
        info: <Info className="h-5 w-5 text-sky-400" />,
        warning: <TriangleAlert className="h-5 w-5 text-amber-400" />,
        error: <XCircle className="h-5 w-5 text-rose-400" />,
        loading: (
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        ),
      }}
      toastOptions={{
        unstyled: false,
        classNames: {
          toast:
            "group !rounded-xl !border !bg-popover/95 !text-popover-foreground !shadow-lg !backdrop-blur-sm !p-4 !gap-3 flex items-start w-full",
          title: "!text-sm !font-semibold !leading-tight",
          description:
            "!text-xs !text-muted-foreground !mt-1 !leading-relaxed",
          actionButton:
            "!rounded-md !bg-brand !text-brand-foreground !text-xs !font-medium !px-3 !py-1.5 hover:!bg-brand/90",
          cancelButton:
            "!rounded-md !bg-muted !text-foreground !text-xs !font-medium !px-3 !py-1.5",
          success:
            "!border-emerald-500/40 [box-shadow:inset_3px_0_0_0_oklch(0.75_0.17_155)]",
          info: "!border-sky-500/40 [box-shadow:inset_3px_0_0_0_oklch(0.75_0.14_235)]",
          warning:
            "!border-amber-500/40 [box-shadow:inset_3px_0_0_0_oklch(0.78_0.15_75)]",
          error:
            "!border-rose-500/40 [box-shadow:inset_3px_0_0_0_oklch(0.7_0.19_20)]",
          icon: "flex h-6 w-6 shrink-0 items-center justify-center pt-0.5",
          content: "min-w-0 flex-1",
          closeButton:
            "!bg-muted/60 !text-muted-foreground hover:!text-foreground !border-0",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
