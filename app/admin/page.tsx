import { AdminDashboard } from "@/components/admin/dashboard";

export default function AdminPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">KpopPulse overview</p>
        </div>
      </div>
      <AdminDashboard />
    </div>
  );
}
