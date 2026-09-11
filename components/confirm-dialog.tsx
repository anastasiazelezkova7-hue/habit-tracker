"use client";

import { useState } from "react";
import Modal from "./modal";

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Удалить",
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}) {
  const [busy, setBusy] = useState(false);

  return (
    <Modal open={open} onClose={onCancel} title={title} maxWidth="max-w-sm">
      <p className="text-[15px] text-muted">{message}</p>
      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-border bg-surface-muted px-5 py-2.5 font-bold text-muted transition-colors hover:border-border-strong hover:text-foreground"
        >
          Отмена
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            try {
              await onConfirm();
            } finally {
              setBusy(false);
            }
          }}
          className="rounded-xl bg-error px-5 py-2.5 font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {busy ? "..." : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}