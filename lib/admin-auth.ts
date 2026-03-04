import { cookies } from "next/headers";

export const ADMIN_SESSION_COOKIE = "icn_admin_session";

const DEFAULT_ADMIN_ID = "admin";
const DEFAULT_ADMIN_PASSWORD = "1234";

export function getAdminCredentials() {
  return {
    id: process.env.ADMIN_ID ?? DEFAULT_ADMIN_ID,
    password: process.env.ADMIN_PASSWORD ?? DEFAULT_ADMIN_PASSWORD
  };
}

export function isValidAdminLogin(id: string, password: string) {
  const admin = getAdminCredentials();
  return id === admin.id && password === admin.password;
}

export function getAdminSessionToken() {
  const admin = getAdminCredentials();
  return `${admin.id}:${admin.password}`;
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  return token === getAdminSessionToken();
}
