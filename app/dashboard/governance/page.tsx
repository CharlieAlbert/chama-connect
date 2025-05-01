import UsersTable from "./_components/users-table";
import { getUsers } from "@/lib/supabase/server-extended/governance";

export default async function Governance() {
  const users = await getUsers();
  return (
    <div>
      <UsersTable usersDisplay={users} />
    </div>
  );
}
