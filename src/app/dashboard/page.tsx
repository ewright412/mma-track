import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Welcome to MMA Tracker</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-white/70">
            Your training dashboard will display an overview of your progress, recent sessions, and goals.
          </p>
          <p className="text-white/70 mt-4">
            Phase 1 complete: Navigation and UI foundation ready!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
