import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, MoreVertical } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

interface DocumentLibraryProps {
  onDocumentSelect: (documentId: string) => void;
}

export default function DocumentLibrary({ onDocumentSelect }: DocumentLibraryProps) {
  const { data: documents, isLoading } = useQuery({
    queryKey: ['/api/documents'],
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Uploaded today';
    if (diffDays === 2) return 'Uploaded yesterday';
    if (diffDays <= 7) return `Uploaded ${diffDays} days ago`;
    if (diffDays <= 14) return `Uploaded 1 week ago`;
    if (diffDays <= 30) return `Uploaded ${Math.ceil(diffDays / 7)} weeks ago`;
    return `Uploaded ${Math.ceil(diffDays / 30)} months ago`;
  };

  return (
    <Card className="bg-white shadow-card">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-neutral-800">Document Library</h3>
          <Button variant="ghost" className="text-primary hover:text-primary-dark text-sm font-medium">
            View All
          </Button>
        </div>
        
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-3 p-3">
                <Skeleton className="w-10 h-10 rounded-lg" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="w-6 h-6" />
              </div>
            ))}
          </div>
        ) : !documents || !Array.isArray(documents) || documents.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
            <p className="text-sm text-neutral-500">No documents uploaded yet</p>
            <p className="text-xs text-neutral-400 mt-1">Upload a policy document to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.slice(0, 3).map((doc: any) => (
              <div
                key={doc.id}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-neutral-50 transition-colors cursor-pointer"
                onClick={() => onDocumentSelect(doc.id)}
              >
                <div className="w-10 h-10 bg-error bg-opacity-10 rounded-lg flex items-center justify-center">
                  <FileText className="text-error w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-800 truncate">
                    {doc.originalName}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {formatDate(doc.uploadedAt)}
                  </p>
                </div>
                <Button variant="ghost" size="sm" className="p-1 text-neutral-400 hover:text-primary">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
