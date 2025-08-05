import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

export default function QuickStats() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['/api/stats'],
    queryFn: async () => {
      const response = await fetch('/api/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <Card className="bg-white shadow-card">
        <CardContent className="p-6">
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-8" />
              </div>
            ))}
            <div className="pt-4 border-t border-neutral-200">
              <Skeleton className="h-4 w-20 mb-1" />
              <div className="flex items-center space-x-2">
                <Skeleton className="h-2 flex-1 rounded-full" />
                <Skeleton className="h-4 w-8" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const defaultStats = {
    totalAnalyses: 0,
    approvedClaims: 0,
    partialClaims: 0,
    rejectedClaims: 0,
    pendingClaims: 0,
    approvalRate: 0,
  };

  const currentStats = stats || defaultStats;

  return (
    <Card className="bg-white shadow-card">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-neutral-800 mb-4">Analysis Summary</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-600">Total Analyses</span>
            <span className="font-semibold text-neutral-800">{currentStats.totalAnalyses}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-600">Approved Claims</span>
            <span className="font-semibold text-success">{currentStats.approvedClaims}</span>
          </div>
          {currentStats.partialClaims > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-600">Partial Approvals</span>
              <span className="font-semibold text-warning">{currentStats.partialClaims}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-600">Pending Review</span>
            <span className="font-semibold text-warning">{currentStats.pendingClaims}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-600">Rejected</span>
            <span className="font-semibold text-error">{currentStats.rejectedClaims}</span>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-neutral-200">
          <div className="text-sm text-neutral-600 mb-1">Approval Rate</div>
          <div className="flex items-center space-x-2">
            <div className="flex-1 bg-neutral-200 rounded-full h-2">
              <div 
                className="bg-success h-2 rounded-full transition-all duration-300" 
                style={{ width: `${currentStats.approvalRate}%` }}
              ></div>
            </div>
            <span className="text-sm font-semibold text-success">
              {currentStats.approvalRate}%
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
