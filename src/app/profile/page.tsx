import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile & Goals</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-white/70">
            Manage your profile, set training goals, and track body metrics.
          </p>
          <p className="text-white/70 mt-4">
            Coming in Phase 6: Goal setting and body metrics tracking.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
