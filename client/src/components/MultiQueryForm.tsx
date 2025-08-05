import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Search, AlertCircle, Plus, X, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import BeetleLogo from "@/components/BeetleLogo";

const multiQueryFormSchema = z.object({
  queries: z.array(z.string().min(10, "Each query must be at least 10 characters")).min(1, "At least one query is required"),
  documentId: z.string().min(1, "Please select a document first"),
});

type MultiQueryFormData = z.infer<typeof multiQueryFormSchema>;

interface MultiQueryFormProps {
  selectedDocumentId: string | null;
  onAnalysisComplete: (results: any) => void;
}

export default function MultiQueryForm({ selectedDocumentId, onAnalysisComplete }: MultiQueryFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [queries, setQueries] = useState<string[]>([""]);

  const {
    handleSubmit,
    formState: { errors },
    setValue,
    trigger,
  } = useForm<MultiQueryFormData>({
    resolver: zodResolver(multiQueryFormSchema),
    defaultValues: {
      queries: [""],
      documentId: selectedDocumentId || "",
    },
  });

  // Update form when document is selected
  useEffect(() => {
    if (selectedDocumentId) {
      setValue('documentId', selectedDocumentId);
    }
  }, [selectedDocumentId, setValue]);

  // Update form queries when local state changes
  useEffect(() => {
    setValue('queries', queries.filter(q => q.trim().length > 0));
    trigger('queries');
  }, [queries, setValue, trigger]);

  const bulkAnalyzeMutation = useMutation({
    mutationFn: async (data: { queries: string[]; documentId: string }) => {
      const response = await fetch('/api/claims/bulk-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to analyze claims');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      onAnalysisComplete(data);
      toast({
        title: "Bulk Analysis Complete",
        description: `Successfully analyzed ${data.results.length} queries.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/analyses'] });
    },
    onError: (error: any) => {
      toast({
        title: "Bulk Analysis Failed",
        description: error.message || "Failed to analyze claims.",
        variant: "destructive",
      });
    },
  });

  const addQuery = () => {
    setQueries([...queries, ""]);
  };

  const removeQuery = (index: number) => {
    if (queries.length > 1) {
      const newQueries = queries.filter((_, i) => i !== index);
      setQueries(newQueries);
    }
  };

  const updateQuery = (index: number, value: string) => {
    const newQueries = [...queries];
    newQueries[index] = value;
    setQueries(newQueries);
  };

  const onSubmit = async (data: MultiQueryFormData) => {
    if (!selectedDocumentId) {
      toast({
        title: "No Document Selected",
        description: "Please upload a policy document first.",
        variant: "destructive",
      });
      return;
    }

    const validQueries = queries.filter(q => q.trim().length >= 10);
    if (validQueries.length === 0) {
      toast({
        title: "No Valid Queries",
        description: "Please provide at least one query with 10+ characters.",
        variant: "destructive",
      });
      return;
    }

    try {
      await bulkAnalyzeMutation.mutateAsync({
        queries: validQueries,
        documentId: selectedDocumentId,
      });
    } catch (error) {
      console.error("Bulk analysis error:", error);
    }
  };

  const isLoading = bulkAnalyzeMutation.isPending;

  // Example queries for demonstration
  const exampleQueries = [
    "50M, used air ambulance, 300 km, claim ₹1L",
    "65F, hip replacement, 5-day stay",
    "30M, emergency appendix surgery, midnight admission",
    "45F, maternity delivery with complications, 3-day stay",
    "55M, diabetic treatment, regular medication coverage"
  ];

  const loadExampleQueries = () => {
    setQueries([...exampleQueries]);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <BeetleLogo size={20} className="text-blue-600" />
          <span>Multi-Query Insurance Analysis</span>
        </CardTitle>
        <p className="text-sm text-gray-600">
          Analyze multiple insurance claims simultaneously for faster processing
        </p>
      </CardHeader>
      
      <CardContent>
        {!selectedDocumentId && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-yellow-800">
              Please upload and process policy documents first. The system can only evaluate claims based on information found in uploaded documents.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-medium text-gray-700">
                Insurance Claim Queries ({queries.filter(q => q.trim().length > 0).length})
              </label>
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={loadExampleQueries}
                  disabled={isLoading}
                >
                  Load Examples
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addQuery}
                  disabled={isLoading}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Query
                </Button>
              </div>
            </div>

            {queries.map((query, index) => (
              <div key={index} className="flex space-x-2">
                <div className="flex-1">
                  <Textarea
                    placeholder={`Query ${index + 1}: e.g., 45M, heart surgery, emergency admission, claim ₹2L`}
                    value={query}
                    onChange={(e) => updateQuery(index, e.target.value)}
                    rows={2}
                    className="resize-none"
                    disabled={!selectedDocumentId || isLoading}
                  />
                  {query.trim().length > 0 && query.trim().length < 10 && (
                    <p className="text-xs text-red-600 mt-1">
                      Query must be at least 10 characters
                    </p>
                  )}
                </div>
                {queries.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeQuery(index)}
                    disabled={isLoading}
                    className="mt-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}

            {errors.queries && (
              <p className="text-sm text-red-600">{errors.queries.message}</p>
            )}
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Tips for better results:</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Include age, gender, and medical condition (e.g., "45M, heart surgery")</li>
              <li>• Mention claim amount if applicable (e.g., "claim ₹50,000")</li>
              <li>• Specify urgency level (e.g., "emergency", "routine")</li>
              <li>• Include treatment details (e.g., "5-day hospitalization")</li>
            </ul>
          </div>

          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
            disabled={isLoading || !selectedDocumentId || queries.filter(q => q.trim().length >= 10).length === 0}
          >
            <Search className="w-5 h-5 mr-2" />
            {isLoading 
              ? `Analyzing ${queries.filter(q => q.trim().length >= 10).length} Claims...` 
              : `Analyze ${queries.filter(q => q.trim().length >= 10).length} Claims`
            }
          </Button>

          {isLoading && (
            <div className="text-center text-sm text-gray-600">
              <div className="animate-pulse">Processing multiple queries, please wait...</div>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
