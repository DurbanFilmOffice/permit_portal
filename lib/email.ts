import { Resend } from "resend";
import { render } from "@react-email/render";

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailOptions {
  to: string;
  subject: string;
  template: React.ReactElement;
}

export async function sendEmail({ to, subject, template }: SendEmailOptions) {
  const html = await render(template);

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM ?? 'Permit Portal <onboarding@resend.dev>',
      to,
      subject,
      html,
    });

    if (error) throw new Error(error.message);
    return data;
  } catch (err) {
    console.error("Failed to send email:", err);
    throw err;
  }
}
