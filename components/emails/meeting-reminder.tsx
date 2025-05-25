import * as React from "react";

interface MeetingReminderEmailProps {
  userName: string;
  meetingTitle: string;
  dateTime: string;
  meetingLink: string;
}

export function MeetingReminderEmail({
  userName,
  meetingTitle,
  dateTime,
  meetingLink,
}: MeetingReminderEmailProps) {
  return (
    <div>
      <h1>Meeting Reminder</h1>
      <p>Dear {userName},</p>
      <p>
        This is a reminder that the meeting "{meetingTitle}" is scheduled for
        tomorrow, {dateTime}.
      </p>
      <p>
        You can join the meeting using this link:{" "}
        <a href={meetingLink} style={{ color: "#0066cc" }}>
          Join Meeting
        </a>
      </p>
      <p>We look forward to seeing you there!</p>
      <p>
        Best regards,
        <br />
        Chama Connect Team
      </p>
    </div>
  );
}
