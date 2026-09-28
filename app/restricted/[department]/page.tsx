import ProtectedRoute from "@/components/ProtectedRoute";
import VolunteeringPanel from "@/components/panels/VolunteeringPanel";
import ActivitiesPanel from "@/components/panels/ActivitiesPanel";
import TeamPanel from "@/components/panels/TeamPanel";
import ClubsPanel from "@/components/panels/ClubsPanel";
import NewsPanel from "@/components/panels/NewsPanel";

export default async function DepartmentDashboard({ params }: { params: Promise<{ department: string }> }) {
  const { department } = await params;
  return (
    <ProtectedRoute department={department}>
      <div className="max-w-4xl mx-auto px-4 py-14">
        <h1 className="font-black uppercase text-3xl text-blue-900 dark:text-blue-100 capitalize">{department} dashboard</h1>
        <div className="mt-8 space-y-10">
          {department === "activities" && <ActivitiesPanel />}
          {department === "volunteering" && <VolunteeringPanel />}
          {department === "council" && <TeamPanel />}
          {department === "clubs" && <ClubsPanel />}
          {department === "news" && <NewsPanel />}
        </div>
      </div>
    </ProtectedRoute>
  );
}