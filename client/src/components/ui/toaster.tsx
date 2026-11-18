import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { CircleAlert, Fish } from "lucide-react"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider duration={3000}>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        const isDestructive = variant === "destructive"
        const NotificationIcon = isDestructive ? CircleAlert : Fish

        return (
          <Toast
            key={id}
            variant={variant}
            {...props}
            className={`w-[calc(100vw-2rem)] max-w-[420px] items-start gap-3 rounded-2xl border px-4 py-3.5 pr-12 text-white shadow-xl ${
              isDestructive
                ? "border-[#a76344] border-l-4 border-l-[#e8883a] bg-[#542813]"
                : "border-[#a76344] border-l-4 border-l-[#e8a45b] bg-[#542813]"
            }`}
          >
            <div className="flex min-w-0 flex-1 items-start gap-3">
              <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white ${isDestructive ? "bg-[#a44728]" : "bg-[#c8651b]"}`}>
                <NotificationIcon className="h-5 w-5" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                {title && (
                  <ToastTitle className="break-words font-display text-sm font-bold leading-snug text-white">
                    {title}
                  </ToastTitle>
                )}
                {description && (
                  <ToastDescription className="mt-1 break-words text-xs leading-relaxed text-white/85">
                    {description}
                  </ToastDescription>
                )}
              </div>
            </div>
            {action}
            <ToastClose aria-label="Dismiss notification" />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
