
import DashboardLayout from "@/components/layout/DashboardLayout";
import ForecastAnalyticsClient from "@/components/analytics/ForecastAnalyticsClient";

export default function ForecastAnalyticsPage() {
  return (
    <DashboardLayout>
      <ForecastAnalyticsClient />
    </DashboardLayout>
  );
}
