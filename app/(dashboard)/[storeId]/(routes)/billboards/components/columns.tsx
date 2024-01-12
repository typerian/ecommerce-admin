"use client";

import { ColumnDef } from "@tanstack/react-table";

export type BillboardColumn = {
  id: string;
  label: string;
  createdAt: string;
};

export const column: ColumnDef<BillboardColumn>[] = [
  { accessorKey: "label", header: "Etiqueta" },
  { accessorKey: "createdAt", header: "Fecha" },
];
