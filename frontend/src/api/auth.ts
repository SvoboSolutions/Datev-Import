import { api } from "./client";

export type UserOut = {
  id: number;
  username: string;
  role: string;
};

export async function login(username: string, password: string) {
  return api<UserOut>("/api/auth/login", {
    method: "POST",
    body: { username, password },
  });
}

export async function logout() {
  return api<{ status: string }>("/api/auth/logout", {
    method: "POST",
  });
}

export async function fetchMe() {
  return api<UserOut>("/api/auth/me");
}
