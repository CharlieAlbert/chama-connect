import { JSX } from "react";
import { Resend } from "resend";

const resend = new Resend(process.env.NEXT_PUBLIC_RESEND_API_KEY);

type EmailProps = {
  to: string | string[];
  subject: string;
  react: JSX.Element;
};

export async function sendEmail({ to, subject, react }: EmailProps) {
  try {
    const data = await resend.emails.send({
      from: "Chama Connect <noreply@resend.dev>",
      to: Array.isArray(to) ? to : [to],
      subject,
      react,
    });
    return { success: true, data };
  } catch (error) {
    return { success: false, error };
  }
}

export async function sendBulkEmail(
  users: { email: string }[],
  subject: string,
  react: JSX.Element
) {
  const emails = users.map((user) => user.email);
  return sendEmail({ to: emails, subject, react });
}
