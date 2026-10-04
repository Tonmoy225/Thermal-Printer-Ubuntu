import nodemailer from "nodemailer";

// Gmail: SMTP_USER = your gmail, SMTP_PASS = Gmail App Password
export async function sendMail({ to, subject, text, html }) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    // Email is not configured: print the link in the server log (useful for local testing)
    console.log("[mail not configured] To:", to, "|", subject, "|", text);
    return;
  }
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT || 465),
    secure: Number(process.env.SMTP_PORT || 465) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  await transporter.sendMail({
    from: process.env.MAIL_FROM || "PrintHub <" + process.env.SMTP_USER + ">",
    to,
    subject,
    text,
    html,
  });
}
