import * as React from "react";

interface LoanStatusEmailProps {
  userName: string;
  status: "approved" | "rejected";
  amount: number;
  reason?: string;
}

export function LoanStatusEmail({
  userName,
  status,
  amount,
  reason,
}: LoanStatusEmailProps) {
  return (
    <div>
      <h1>
        Loan Application {status === "approved" ? "Approved" : "Rejected"}
      </h1>
      <p>Dear {userName},</p>
      <p>
        Your loan application for KES {amount.toLocaleString()} has been{" "}
        {status}.
        {status === "rejected" && reason && (
          <>
            <br />
            Reason: {reason}
          </>
        )}
      </p>
      <p>
        {status === "approved"
          ? "The funds will be disbursed to your account shortly."
          : "Feel free to apply again in the future."}
      </p>
      <p>
        Best regards,
        <br />
        Chama Connect Team
      </p>
    </div>
  );
}
