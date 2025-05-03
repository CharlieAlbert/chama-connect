"use client";
import { Button } from "@/components/ui/button";

interface LoanApprovalTableProps {
  loans: any[];
  onApprove: (loanId: string) => void;
  onReject: (loanId: string) => void;
}

export default function LoanApprovalTable({ loans, onApprove, onReject }: LoanApprovalTableProps) {
  return (
    <table className="min-w-full text-sm">
      <thead>
        <tr>
          <th className="p-2">Applicant</th>
          <th className="p-2">Amount</th>
          <th className="p-2">Type</th>
          <th className="p-2">Status</th>
          <th className="p-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        {loans.map(loan => (
          <tr key={loan.id}>
            <td className="p-2">{loan.users?.[0]?.name || "Unknown"}</td>
            <td className="p-2">Ksh{loan.amount}</td>
            <td className="p-2">{loan.loan_type}</td>
            <td className="p-2">{loan.status}</td>
            <td className="p-2 space-x-2">
              <Button onClick={() => onApprove(loan.id)} size="sm" variant="outline">Approve</Button>
              <Button onClick={() => onReject(loan.id)} size="sm" variant="destructive">Reject</Button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
