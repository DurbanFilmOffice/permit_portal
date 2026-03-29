export default function ApplicationsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          My applications
        </h1>
        <p className="text-sm text-muted-foreground">
          View and manage your permit applications
        </p>
      </div>
      <div className="rounded-lg border border-dashed p-12 text-center">
        <p className="text-sm text-muted-foreground">
          No applications yet — submit your first permit application
        </p>
      </div>
    </div>
  );
}
