'use client';

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Delete',
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-3xl bg-white p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-heading text-xl font-extrabold text-[#111111]">
          {title}
        </h2>
        <p className="mt-2 text-sm text-[#666]">{message}</p>
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="font-heading flex-1 rounded-xl border border-[#e5e5e5] bg-white py-3 text-sm font-semibold text-[#111111]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="font-heading flex-1 rounded-xl bg-red-500 hover:bg-red-700 py-3 text-sm font-semibold text-white"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
