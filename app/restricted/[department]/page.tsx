import ProtectedRoute from "@/components/ProtectedRoute";
import VolunteeringPanel from "@/components/panels/VolunteeringPanel";
import ActivitiesPanel from "@/components/panels/ActivitiesPanel";
import TeamPanel from "@/components/panels/TeamPanel";
import ClubsPanel from "@/components/panels/ClubsPanel";
import NewsPanel from "@/components/panels/NewsPanel";

export default async function DepartmentDashboard({ params }: { params: Promise<{ department: string }> }) {
  const { department } = await params;
  const normalizedDepartment = department === "volunteer" ? "volunteering" : department;

  return (
    <ProtectedRoute department={department}>
      <div className="max-w-4xl mx-auto px-4 py-14">
        <h1 className="font-black uppercase text-3xl text-blue-900 dark:text-blue-100 capitalize">{normalizedDepartment} dashboard</h1>
        <div className="mt-8 space-y-10">
          {normalizedDepartment === "activities" && <ActivitiesPanel />}
          {(normalizedDepartment === "volunteering" || department === "volunteer") && <VolunteeringPanel />}
          {normalizedDepartment === "council" && <TeamPanel />}
          {normalizedDepartment === "clubs" && <ClubsPanel />}
          {normalizedDepartment === "news" && <NewsPanel />}
        </div>
      </div>
    </ProtectedRoute>
  );
}