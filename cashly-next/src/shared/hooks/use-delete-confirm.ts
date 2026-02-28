"use client";

import { useCallback, useState } from "react";

interface DeleteTarget {
  id: string;
  label: string;
  onConfirm: () => void;
}

export function useDeleteConfirm() {
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);

  const requestDelete = useCallback(
    (id: string, label: string, onConfirm: () => void) => {
      setDeleteTarget({ id, label, onConfirm });
    },
    [],
  );

  const confirmDelete = useCallback(() => {
    deleteTarget?.onConfirm();
    setDeleteTarget(null);
  }, [deleteTarget]);

  const cancelDelete = useCallback(() => {
    setDeleteTarget(null);
  }, []);

  return {
    deleteTarget,
    requestDelete,
    confirmDelete,
    cancelDelete,
    isDeleteOpen: !!deleteTarget,
  };
}
