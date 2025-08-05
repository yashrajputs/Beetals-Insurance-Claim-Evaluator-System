import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

export default function AnalysisHistory() {
  const { data: analyses, isLoading } = useQuery({
    queryKey: ['/api/analyses/recent'],
    queryFn: async () => {
      const response = await fetch('/api/analyses/recent?limit=4');
      if (!response.ok) throw new Error('Failed to fetch analyses');
      return response.json();
    },
  });

  const getStatusColor = (decision: string) => {
    switch (decision.toLowerCase()) {
      case 'yes':
        return 'success';
      case 'no':
        return 'error';
      case 'partial':
        return 'warning';
      default:
        return 'neutral-500';
    }
  };

  const getStatusText = (decision: string) => {
    switch (decision.toLowerCase()) {
      case 'yes':
        return 'Approved';
      case 'no':
        return 'Rejected - Not Covered';
      case 'partial':
        return 'Partially Approved';
      default:
        return 'Under Review';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffHours < 48) return 'Yesterday';
    return `${Math.ceil(diffHours / 24)} days ago`;
  };

  return (
    <Card className="bg-white shadow-card">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-neutral-800">Recent Analyses</h3>
          <Button variant="ghost" className="text-primary hover:text-primary-dark text-sm font-medium">
            View All
          </Button>
        </div>
        
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-start space-x-3">
                <Skeleton className="w-2 h-2 rounded-full mt-2" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-3 w-20 mb-1" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            ))}
          </div>
        ) : !analyses || analyses.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-neutral-500">No analyses performed yet</p>
            <p className="text-xs text-neutral-400 mt-1">Start by uploading a document and submitting a claim</p>
          </div>
        ) : (
          <div className="space-y-4">
            {analyses.map((analysis: any) => (
              <div key={analysis.id} className="flex items-start space-x-3">
                <div className={`w-2 h-2 bg-${getStatusColor(analysis.decision)} rounded-full mt-2 flex-shrink-0`}></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-800 truncate">
                    Analysis #{analysis.id.slice(-8)}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {formatDate(analysis.createdAt)}
                  </p>
                  <p className={`text-xs text-${getStatusColor(analysis.decision)}`}>
                    {getStatusText(analysis.decision)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
