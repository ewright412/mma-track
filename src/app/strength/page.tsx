import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

export default function StrengthPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Strength & Gym Training</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-white/70">
            Track your weight training, personal records, and strength progress over time.
          </p>
          <p className="text-white/70 mt-4">
            Coming in Phase 5: Complete gym tracking with PR detection and workout templates.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
