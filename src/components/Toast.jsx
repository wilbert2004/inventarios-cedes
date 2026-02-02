import * as React from 'react';
import { useEffect } from 'react';

/**
 * Toast de notificación (éxito o error).
 * Se oculta automáticamente o al hacer clic en cerrar.
 *
 * @param {Object} props
 * @param {'success'|'error'} props.variant - Tipo de toast
 * @param {string} [props.title] - Título opcional
 * @param {string} props.message - Mensaje principal
 * @param {() => void} props.onClose - Se ejecuta al cerrar
 * @param {number} [props.autoHideMs=4500] - Milisegundos antes de ocultar automáticamente
 */
export function Toast({ variant, title, message, onClose, autoHideMs = 4500 }) {
    useEffect(() => {
        const t = setTimeout(onClose, autoHideMs);
        return () => clearTimeout(t);
    }, [onClose, autoHideMs]);

    const isSuccess = variant === 'success';
    const bg = isSuccess
        ? 'bg-green-500 dark:bg-green-600'
        : 'bg-red-500 dark:bg-red-600';
    const textMuted = isSuccess
        ? 'text-green-50 dark:text-green-100'
        : 'text-red-50 dark:text-red-100';

    return (
        <div
            className={`fixed right-4 top-4 z-[100] min-w-[300px] max-w-md animate-slideInRight rounded-lg p-4 shadow-lg ${bg} text-white`}
        >
            <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                    {isSuccess ? (
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    ) : (
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    {title && <p className="font-semibold">{title}</p>}
                    <p className={`text-sm ${title ? 'mt-0.5' : ''} ${textMuted}`}>{message}</p>
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    className={`flex-shrink-0 transition-colors hover:opacity-80 ${textMuted}`}
                    aria-label="Cerrar"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
