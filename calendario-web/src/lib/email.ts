import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY!)
const FROM = "Calendarier <onboarding@resend.dev>"
const BASE_URL = process.env.BASE_URL || "http://localhost:3000"

function wrapHtml(body: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
<table role="presentation" style="width:100%;max-width:480px;margin:0 auto;padding:24px 16px">
<tr><td style="text-align:center;padding-bottom:16px">
<img src="https://ddtlaewydeheestowdmy.supabase.co/storage/v1/object/public/assets/calendarier-icon.png" alt="Calendarier" width="48" height="48" style="border-radius:12px">
</td></tr>
<tr><td style="background:#fff;border-radius:16px;padding:32px 24px;box-shadow:0 1px 3px rgba(0,0,0,0.08)">
${body}
</td></tr>
<tr><td style="text-align:center;padding-top:16px;font-size:12px;color:#999">
Calendarier &mdash; Coordinacion de grupos
</td></tr>
</table>
</body>
</html>`
}

export async function sendWelcomeEmail(email: string, username: string) {
  const loginUrl = `${BASE_URL}/login`
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: `Bienvenido a Calendarier, ${username}`,
    html: wrapHtml(`
      <h1 style="font-size:20px;font-weight:700;margin:0 0 8px">Bienvenido a Calendarier</h1>
      <p style="color:#666;font-size:14px;line-height:1.6;margin:0 0 16px">
        Tu cuenta ha sido creada correctamente.
      </p>
      <div style="background:#f9fafb;border-radius:10px;padding:12px 16px;margin-bottom:16px;font-size:13px">
        <div style="color:#999;margin-bottom:4px">Tu usuario:</div>
        <div style="font-weight:700;font-size:15px">${username}</div>
      </div>
      <a href="${loginUrl}" style="display:block;text-align:center;background:#22C55E;color:#fff;text-decoration:none;padding:12px;border-radius:10px;font-weight:600;font-size:14px">
        Iniciar sesion
      </a>
    `),
  })
}

export async function sendInvitationEmail(
  email: string,
  calendarName: string,
  invitedBy: string,
  inviteLink: string
) {
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: `${invitedBy} te ha anadido a "${calendarName}"`,
    html: wrapHtml(`
      <h1 style="font-size:20px;font-weight:700;margin:0 0 8px">Has sido anadido a un calendario</h1>
      <p style="color:#666;font-size:14px;line-height:1.6;margin:0 0 16px">
        <strong>${invitedBy}</strong> te ha anadido al calendario <strong>${calendarName}</strong> en Calendarier.
      </p>
      <a href="${inviteLink}" style="display:block;text-align:center;background:#22C55E;color:#fff;text-decoration:none;padding:12px;border-radius:10px;font-weight:600;font-size:14px">
        Ver calendario
      </a>
    `),
  })
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${BASE_URL}/reset-password?token=${token}`
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Restablece tu contrasena de Calendarier",
    html: wrapHtml(`
      <h1 style="font-size:20px;font-weight:700;margin:0 0 8px">Restablecer contrasena</h1>
      <p style="color:#666;font-size:14px;line-height:1.6;margin:0 0 16px">
        Has solicitado restablecer tu contrasena. Haz clic en el enlace para crear una nueva.
      </p>
      <a href="${resetUrl}" style="display:block;text-align:center;background:#22C55E;color:#fff;text-decoration:none;padding:12px;border-radius:10px;font-weight:600;font-size:14px">
        Restablecer contrasena
      </a>
      <p style="color:#999;font-size:12px;margin-top:16px;text-align:center">
        Si no has solicitado esto, ignora este mensaje.
      </p>
    `),
  })
}
