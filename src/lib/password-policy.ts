import { getSettings } from "@/lib/settings";

// Password and account rules from Admin > Settings > Security, enforced on the
// server wherever a password is set or a console user is created.

export async function minPasswordLength(): Promise<number> {
  const n = Number((await getSettings())["security.minPassword"]);
  return Number.isInteger(n) && n >= 8 ? n : 8;
}

export async function passwordProblem(password: string): Promise<string | null> {
  const min = await minPasswordLength();
  if (password.length < min) return `Password must be at least ${min} characters.`;
  if (password.length > 72) return "Password must be at most 72 characters.";
  return null;
}

export async function inviteDomainProblem(email: string): Promise<string | null> {
  const domain = (await getSettings())["security.inviteDomain"];
  if (!domain) return null;
  return email.toLowerCase().endsWith(`@${domain}`) ? null : `New users must have an @${domain} email address.`;
}
