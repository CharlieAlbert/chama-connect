import { sendEmail, sendBulkEmail } from "./email";
import { LoanStatusEmail } from "@/components/emails/loan-status";
import { MinutesUpdateEmail } from "@/components/emails/minutes-update";
import { RaffleWinnersEmail } from "@/components/emails/raffle-winners";
import { MeetingReminderEmail } from "@/components/emails/meeting-reminder";

type User = {
  email: string;
  name: string;
};

export async function sendLoanStatusEmail(
  user: User,
  status: "approved" | "rejected",
  amount: number,
  reason?: string
) {
  return sendEmail({
    to: user.email,
    subject: `Loan Application ${
      status === "approved" ? "Approved" : "Rejected"
    }`,
    react: LoanStatusEmail({ userName: user.name, status, amount, reason }),
  });
}

export async function sendMinutesUpdateEmail(
  users: User[],
  month: string,
  year: number
) {
  return Promise.all(
    users.map((user) =>
      sendEmail({
        to: user.email,
        subject: `Minutes Updated - ${month} ${year}`,
        react: MinutesUpdateEmail({ userName: user.name, month, year }),
      })
    )
  );
}

export async function sendRaffleWinnersEmail(
  users: User[],
  month: string,
  year: number,
  winners: Array<{ name: string; position: number }>
) {
  return Promise.all(
    users.map((user) =>
      sendEmail({
        to: user.email,
        subject: `Raffle Winners Announcement - ${month} ${year}`,
        react: RaffleWinnersEmail({
          userName: user.name,
          month,
          year,
          winners,
        }),
      })
    )
  );
}

export async function sendMeetingReminderEmail(
  users: User[],
  meetingTitle: string,
  dateTime: string,
  meetingLink: string
) {
  return Promise.all(
    users.map((user) =>
      sendEmail({
        to: user.email,
        subject: `Meeting Reminder: ${meetingTitle}`,
        react: MeetingReminderEmail({
          userName: user.name,
          meetingTitle,
          dateTime,
          meetingLink,
        }),
      })
    )
  );
}
