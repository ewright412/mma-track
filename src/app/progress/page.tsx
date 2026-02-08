import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

export default function ProgressPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Progress & Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-white/70">
            Visualize your training trends, discipline breakdowns, and performance analytics.
          </p>
          <p className="text-white/70 mt-4">
            Coming in Phase 7: Comprehensive charts and insights dashboard.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
