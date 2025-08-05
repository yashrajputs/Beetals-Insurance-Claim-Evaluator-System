import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, AlertCircle, Download, Share } from "lucide-react";

interface AnalysisResultsProps {
  analysis: {
    analysis: {
      decision: string;
      approvedAmount: string;
      justification: string;
    };
    topClauses: Array<{
      id: string;
      title: string;
      text: string;
      page_number: number;
    }>;
    query: string;
  };
}

export default function AnalysisResults({ analysis }: AnalysisResultsProps) {
  const { analysis: result, topClauses, query } = analysis;

  const getDecisionIcon = (decision: string) => {
    switch (decision.toLowerCase()) {
      case 'yes':
        return <CheckCircle className="w-6 h-6 text-success" />;
      case 'no':
        return <XCircle className="w-6 h-6 text-error" />;
      case 'partial':
        return <AlertCircle className="w-6 h-6 text-warning" />;
      default:
        return <AlertCircle className="w-6 h-6 text-neutral-500" />;
    }
  };

  const getDecisionColor = (decision: string) => {
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

  const getDecisionText = (decision: string) => {
    switch (decision.toLowerCase()) {
      case 'yes':
        return 'Claim Approved';
      case 'no':
        return 'Claim Rejected';
      case 'partial':
        return 'Partial Approval';
      default:
        return 'Analysis Complete';
    }
  };

  return (
    <Card className="bg-white shadow-card">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-neutral-800">Coverage Analysis Results</h2>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="p-2 text-neutral-500 hover:text-primary">
              <Download className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="p-2 text-neutral-500 hover:text-primary">
              <Share className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Decision Summary */}
        <div className={`bg-${getDecisionColor(result.decision)} bg-opacity-10 border border-${getDecisionColor(result.decision)} border-opacity-20 rounded-lg p-4 mb-6`}>
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-0.5">
              {getDecisionIcon(result.decision)}
            </div>
            <div className="flex-1">
              <h3 className={`font-semibold text-${getDecisionColor(result.decision)} mb-1`}>
                {getDecisionText(result.decision)}
              </h3>
            </div>
          </div>
        </div>

        {/* Query Summary */}
        <div className="mb-6">
          <h4 className="font-medium text-neutral-800 mb-2">Query Analyzed</h4>
          <div className="bg-neutral-50 rounded-lg p-3">
            <p className="text-sm text-neutral-700">{query}</p>
          </div>
        </div>

        {/* Detailed Justification */}
        <div className="space-y-4 mb-6">
          <h4 className="font-medium text-neutral-800">Analysis Justification</h4>
          <div className="bg-neutral-50 rounded-lg p-4">
            <p className="text-sm text-neutral-700 leading-relaxed">
              {result.justification}
            </p>
          </div>
        </div>

        {/* Relevant Policy Clauses */}
        {topClauses && topClauses.length > 0 && (
          <div>
            <h4 className="font-medium text-neutral-800 mb-4">Relevant Policy Clauses</h4>
            <div className="space-y-3">
              {topClauses.map((clause) => (
                <div key={clause.id} className="border border-neutral-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h5 className="font-medium text-sm text-neutral-800">{clause.title}</h5>
                    <span className="text-xs text-neutral-500 bg-neutral-100 px-2 py-1 rounded">
                      Page {clause.page_number}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-600">
                    {clause.text.length > 200 
                      ? `${clause.text.substring(0, 200)}...` 
                      : clause.text
                    }
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
