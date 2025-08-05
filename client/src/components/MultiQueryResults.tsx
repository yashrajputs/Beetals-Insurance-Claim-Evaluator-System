import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertCircle, Clock, FileText } from "lucide-react";

interface MultiQueryResultsProps {
  results: {
    success: boolean;
    totalQueries: number;
    results: Array<{
      queryIndex: number;
      query: string;
      claimId: string | null;
      analysis?: {
        decision: string;
        approvedAmount: string;
        justification: string;
      };
      error?: string;
    }>;
    documentId: string;
  };
}

export default function MultiQueryResults({ results }: MultiQueryResultsProps) {
  const getDecisionIcon = (decision: string) => {
    switch (decision?.toLowerCase()) {
      case 'yes':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'no':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'partial':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getDecisionColor = (decision: string) => {
    switch (decision?.toLowerCase()) {
      case 'yes':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'no':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'partial':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const successfulAnalyses = results.results.filter(r => r.analysis && !r.error);
  const failedAnalyses = results.results.filter(r => r.error);
  const approvedClaims = successfulAnalyses.filter(r => r.analysis?.decision?.toLowerCase() === 'yes');
  const rejectedClaims = successfulAnalyses.filter(r => r.analysis?.decision?.toLowerCase() === 'no');
  const partialClaims = successfulAnalyses.filter(r => r.analysis?.decision?.toLowerCase() === 'partial');

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="w-5 h-5" />
          <span>Multi-Query Analysis Results</span>
        </CardTitle>
        <div className="flex flex-wrap gap-2 mt-2">
          <Badge variant="secondary">
            Total: {results.totalQueries}
          </Badge>
          <Badge className="bg-green-100 text-green-800">
            Approved: {approvedClaims.length}
          </Badge>
          <Badge className="bg-red-100 text-red-800">
            Rejected: {rejectedClaims.length}
          </Badge>
          <Badge className="bg-yellow-100 text-yellow-800">
            Partial: {partialClaims.length}
          </Badge>
          {failedAnalyses.length > 0 && (
            <Badge variant="destructive">
              Failed: {failedAnalyses.length}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {results.results.map((result, index) => (
          <Card key={index} className="border-l-4 border-l-gray-200">
            <CardContent className="pt-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-sm font-medium text-gray-500">
                      Query #{result.queryIndex + 1}
                    </span>
                    {result.analysis && (
                      <div className="flex items-center space-x-1">
                        {getDecisionIcon(result.analysis.decision)}
                        <Badge className={getDecisionColor(result.analysis.decision)}>
                          {result.analysis.decision}
                        </Badge>
                      </div>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg mb-3">
                    "{result.query}"
                  </p>

                  {result.error ? (
                    <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                      <div className="flex items-center space-x-2 mb-1">
                        <XCircle className="w-4 h-4 text-red-600" />
                        <span className="text-sm font-medium text-red-800">Analysis Failed</span>
                      </div>
                      <p className="text-sm text-red-700">{result.error}</p>
                    </div>
                  ) : result.analysis ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <h4 className="text-sm font-medium text-gray-700 mb-1">Decision</h4>
                          <div className="flex items-center space-x-2">
                            {getDecisionIcon(result.analysis.decision)}
                            <span className="text-sm font-semibold">
                              {result.analysis.decision}
                            </span>
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <h4 className="text-sm font-medium text-gray-700 mb-1">Amount</h4>
                          <p className="text-sm font-semibold text-green-600">
                            {result.analysis.approvedAmount}
                          </p>
                        </div>
                      </div>

                      <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                        <h4 className="text-sm font-medium text-blue-800 mb-2">Justification</h4>
                        <p className="text-sm text-blue-700 leading-relaxed">
                          {result.analysis.justification}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-600" />
                        <span className="text-sm text-gray-600">Processing...</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {result.claimId && (
                <div className="text-xs text-gray-500 mt-2">
                  Claim ID: {result.claimId}
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {results.results.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No analysis results to display</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
