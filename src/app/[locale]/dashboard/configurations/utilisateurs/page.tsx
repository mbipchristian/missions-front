import { UsersList } from "@/components/config/admin-users";

export default function UsersPage() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <UsersList />
    </div>
  )
}