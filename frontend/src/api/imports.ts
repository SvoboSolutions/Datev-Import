import { api } from "./client";

export type ImportJob = {
  id: number;
  filename: string;
  period: string | null;
  status: string;
};

export type UploadResult = {
  id: number;
  status: string;
  period: string | null;
  filename: string;
};

export async function listImports() {
  return api<ImportJob[]>("/api/imports", { method: "GET" });
}

export async function uploadImport(file: File) {
  const fd = new FormData();
  fd.append("file", file);

  // Wichtig: KEIN Content-Type manuell setzen bei FormData
  return api<UploadResult>("/api/imports", {
    method: "POST",
    body: fd,
  });
}
