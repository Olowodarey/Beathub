import { UserTable } from "@/components/users/user-table";

export default function UsersPage() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          People with access to the workspace and creators on the platform.
        </p>
      </div>
      <UserTable />
    </div>
  );
}
