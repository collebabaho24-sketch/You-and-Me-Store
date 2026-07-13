import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = process.env.EMAIL_FROM || "You & Me Store <onboarding@resend.dev>";

async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  if (!resend) {
    console.log(`[dev email] To: ${to}\nSubject: ${subject}\n${html}`);
    return;
  }

  await resend.emails.send({ from: FROM, to, subject, html });
}

export async function sendVerificationEmail(to: string, link: string) {
  await sendEmail({
    to,
    subject: "Verify your email — You & Me Store",
    html: `<p>Welcome to You &amp; Me Store! Please verify your email address to start buying and selling.</p>
<p><a href="${link}">${link}</a></p>
<p>This link will expire in 24 hours.</p>`,
  });
}

export async function sendPasswordResetEmail(to: string, link: string) {
  await sendEmail({
    to,
    subject: "Reset your password — You & Me Store",
    html: `<p>We received a request to reset your password.</p>
<p><a href="${link}">${link}</a></p>
<p>This link will expire in 1 hour. If you didn't request this, you can ignore this email.</p>`,
  });
}
