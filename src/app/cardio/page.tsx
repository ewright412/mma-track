import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

export default function CardioPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Cardio Tracking</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-white/70">
            Log all your conditioning work: running, cycling, jump rope, heavy bag rounds, and more.
          </p>
          <p className="text-white/70 mt-4">
            Coming in Phase 4: Full cardio tracking with pace analysis and weekly summaries.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
