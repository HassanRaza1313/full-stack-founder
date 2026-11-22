import { serverEnv } from "@repo/shared";

export type Email = { to: string; subject: string; html: string };

/** Sends through Resend when RESEND_API_KEY is set; otherwise logs, so local flows never need a mail account. */
export async function sendEmail(email: Email): Promise<void> {
  const env = serverEnv();
  if (!env.RESEND_API_KEY || !env.EMAIL_FROM) {
    console.info(`[email:local] to=${email.to} subject="${email.subject}"`);
    return;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: env.EMAIL_FROM, ...email }),
  });
  if (!res.ok) throw new Error(`Resend rejected the email: ${res.status} ${await res.text()}`);
}
