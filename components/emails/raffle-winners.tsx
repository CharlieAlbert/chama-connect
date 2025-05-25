import * as React from "react";

interface RaffleWinnersEmailProps {
  userName: string;
  month: string;
  year: number;
  winners: Array<{ name: string; position: number }>;
}

export function RaffleWinnersEmail({
  userName,
  month,
  year,
  winners,
}: RaffleWinnersEmailProps) {
  return (
    <div>
      <h1>Raffle Winners Announcement</h1>
      <p>Dear {userName},</p>
      <p>
        The raffle winners for {month} {year} have been drawn. Here are the
        results:
      </p>
      <ul>
        {winners.map((winner) => (
          <li key={winner.position}>
            Position {winner.position}: {winner.name}
          </li>
        ))}
      </ul>
      <p>Congratulations to all winners!</p>
      <p>
        Best regards,
        <br />
        Chama Connect Team
      </p>
    </div>
  );
}
