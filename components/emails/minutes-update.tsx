import * as React from "react";

interface MinutesUpdateEmailProps {
  userName: string;
  month: string;
  year: number;
}

export function MinutesUpdateEmail({
  userName,
  month,
  year,
}: MinutesUpdateEmailProps) {
  return (
    <div>
      <h1>Minutes Updated</h1>
      <p>Dear {userName},</p>
      <p>
        The minutes for {month} {year} have been updated and are now available
        for review.
      </p>
      <p>
        You can view the minutes by logging into your Chama Connect account and
        navigating to the Minutes section.
      </p>
      <p>
        Best regards,
        <br />
        Chama Connect Team
      </p>
    </div>
  );
}
