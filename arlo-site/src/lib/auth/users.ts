/**
 * Server-only login list for the ARLO demo.
 *
 * There is no database or self-serve signup -- per the project owner's
 * instructions, only a handful of known people should ever be able to log
 * in, and this is test data, not a production account system. Add more
 * users by adding another entry here and redeploying; never import this
 * file from client code.
 */

export interface AuthUser {
  email: string;
  name: string;
  password: string;
}

export const AUTH_USERS: AuthUser[] = [
  {
    email: "zeb24benson@gmail.com",
    name: "Zeb Benson",
    password: "arlo-demo-2026",
  },
];

export function findUserByEmail(email: string): AuthUser | undefined {
  const normalized = email.trim().toLowerCase();
  return AUTH_USERS.find((u) => u.email.toLowerCase() === normalized);
}

export function verifyCredentials(email: string, password: string): AuthUser | null {
  const user = findUserByEmail(email);
  if (!user || user.password !== password) return null;
  return user;
}
