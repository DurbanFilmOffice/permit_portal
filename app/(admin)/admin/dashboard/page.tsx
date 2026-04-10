export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Overview of all permit applications
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total applications", value: "—" },
          { label: "Pending review", value: "—" },
          { label: "Approved", value: "—" },
          { label: "Returned", value: "—" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-lg border bg-card p-6">
            <p className="text-sm font-medium text-muted-foreground">
              {stat.label}
            </p>
            <p className="text-3xl font-bold mt-2">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
