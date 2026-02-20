import { api } from "./client";

export type ImportJobRow = {
  id: number;
  filename: string;
  period: string | null;
  source_type: string;
  status: string;
  created_at: string | null;
  row_count: number;
};

export type UploadResult = {
  id: number;
  status: string;
  period: string | null;
  filename: string;
  source_type: string;
  created_at: string | null;
};

export async function listImports() {
  return api<ImportJobRow[]>("/api/imports", { method: "GET" });
}

export async function uploadImport(file: File) {
  const fd = new FormData();
  fd.append("file", file);
  return api<UploadResult>("/api/imports", {
    method: "POST",
    body: fd,
  });
}

export async function deleteImport(id: number) {
  return api<{ status: string; deleted_id: number }>(`/api/imports/${id}`, {
    method: "DELETE",
  });
}