export function parseMpesaMessage(message: string): {
  amount: number;
  payment_date: string;
} {
  const amountMatch = message.match(/Ksh([\d,]+\.\d{2})/i);
  if (!amountMatch) throw new Error("Invalid message format. Amount not found");
  const amount = parseFloat(amountMatch[1].replace(/,/g, ""));

  const dateMatch = message.match(
    /on (\d{1,2})\/(\d{1,2})\/(\d{2}) at (\d{1,2}):(\d{2}) ([AP]M)/i
  );
  if (!dateMatch)
    throw new Error("Invalid message format. Date and time not found");
  const [, monthStr, dayStr, yearStr, hourStr, minuteStr, ampm] = dateMatch;

  const month = Number(monthStr);
  const day = Number(dayStr);
  const year = 2000 + Number(yearStr);
  let hour = Number(hourStr);
  const minute = Number(minuteStr);

  if (ampm.toUpperCase() === "PM" && hour !== 12) hour += 12;
  if (ampm.toUpperCase() === "AM" && hour === 12) hour = 0;

  const formattedDate = new Date(year, month - 1, day, hour, minute);
  const payment_date = formattedDate.toISOString();

  return {
    amount,
    payment_date,
  };
}
