import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { CheckCircle, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export type ToastTone = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: number;
  tone: ToastTone;
  message: string;
}

interface ToastContextValue {
  show: (tone: ToastTone, message: string) => void;
  success: (msg: string) => void;
  error: (msg: string) => void;
  warning: (msg: string) => void;
  info: (msg: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const TONE_STYLES: Record<ToastTone, { bg: string; text: string; Icon: typeof CheckCircle }> = {
  success: { bg: 'bg-emerald-500/15 border-emerald-500/40', text: 'text-emerald-200', Icon: CheckCircle },
  error:   { bg: 'bg-red-500/15 border-red-500/40',         text: 'text-red-200',     Icon: AlertCircle },
  warning: { bg: 'bg-amber-500/15 border-amber-500/40',     text: 'text-amber-200',   Icon: AlertTriangle },
  info:    { bg: 'bg-sky-500/15 border-sky-500/40',         text: 'text-sky-200',     Icon: Info },
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback((tone: ToastTone, message: string) => {
    const id = nextId.current++;
    setToasts((prev) => [...prev, { id, tone, message }]);
    setTimeout(() => dismiss(id), 5000);
  }, [dismiss]);

  const value = useMemo<ToastContextValue>(() => ({
    show,
    success: (m) => show('success', m),
    error:   (m) => show('error',   m),
    warning: (m) => show('warning', m),
    info:    (m) => show('info',    m),
  }), [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm"
        role="status"
        aria-live="polite"
      >
        {toasts.map((t) => {
          const { bg, text, Icon } = TONE_STYLES[t.tone];
          return (
            <div
              key={t.id}
              className={`${bg} ${text} border backdrop-blur-md rounded-lg px-4 py-3 shadow-lg flex items-start gap-3 animate-in fade-in slide-in-from-right-2`}
            >
              <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <p className="flex-1 text-sm">{t.message}</p>
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                className="opacity-60 hover:opacity-100 transition-opacity"
                aria-label="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextValue => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
};
