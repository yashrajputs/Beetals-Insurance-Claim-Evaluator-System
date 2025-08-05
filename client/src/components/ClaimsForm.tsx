import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Search, AlertCircle } from "lucide-react";

const queryFormSchema = z.object({
  query: z.string().min(10, "Please provide a detailed query about your insurance claim"),
  documentId: z.string().min(1, "Please select a document first"),
});

type QueryFormData = z.infer<typeof queryFormSchema>;

interface ClaimsFormProps {
  selectedDocumentId: string | null;
  onAnalysisComplete: (analysis: any) => void;
}

export default function ClaimsForm({ selectedDocumentId, onAnalysisComplete }: ClaimsFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<QueryFormData>({
    resolver: zodResolver(queryFormSchema),
    defaultValues: {
      query: '',
      documentId: selectedDocumentId || '',
    },
  });

  // Update form when document is selected
  useEffect(() => {
    if (selectedDocumentId) {
      setValue('documentId', selectedDocumentId);
    }
  }, [selectedDocumentId, setValue]);

  const analyzeClaimMutation = useMutation({
    mutationFn: async (data: { query: string; documentId: string }) => {
      // Parse the natural language query to extract information
      const queryText = data.query.toLowerCase();
      
      // Extract age using regex patterns
      const ageMatch = queryText.match(/(\d+)[-\s]?(?:year|yr|y)[-\s]?old|(\d+)m|(\d+)f|age[:\s]*(\d+)|(\d+)[,\s]+(?:male|female)/);
      const extractedAge = ageMatch ? parseInt(ageMatch[1] || ageMatch[2] || ageMatch[3] || ageMatch[4] || ageMatch[5]) : null;
      
      // Extract gender
      let extractedGender = null;
      if (queryText.includes('male') && !queryText.includes('female')) {
        extractedGender = 'male';
      } else if (queryText.includes('female')) {
        extractedGender = 'female';
      } else if (queryText.match(/\d+m[\s,]/)) {
        extractedGender = 'male';
      } else if (queryText.match(/\d+f[\s,]/)) {
        extractedGender = 'female';
      }
      
      // Extract amount
      const amountMatch = queryText.match(/(?:rs\.?|₹|inr)[\s]*([0-9,]+)|([0-9,]+)[\s]*(?:rs\.?|₹|inr)/);
      const extractedAmount = amountMatch ? parseInt((amountMatch[1] || amountMatch[2]).replace(/,/g, '')) : null;
      
      // Create claim with extracted or default data for required fields
      const claimData = {
        documentId: data.documentId,
        patientAge: extractedAge || 30, // Default age if not extracted
        gender: extractedGender || 'unspecified', // Default gender if not extracted
        procedure: data.query,
        location: null,
        distance: null,
        policyDuration: null,
        claimAmount: extractedAmount,
        reimbursementPercentage: 100,
      };
      
      const claimResponse = await fetch('/api/claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(claimData),
      });
      if (!claimResponse.ok) {
        const error = await claimResponse.json();
        throw new Error(error.message || 'Failed to create claim');
      }
      const claim = await claimResponse.json();
      
      // Then analyze the claim
      const analysisResponse = await fetch(`/api/claims/${claim.id}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (!analysisResponse.ok) {
        const error = await analysisResponse.json();
        throw new Error(error.message || 'Failed to analyze claim');
      }
      return analysisResponse.json();
    },
    onSuccess: (data) => {
      onAnalysisComplete(data);
      toast({
        title: "Analysis Complete",
        description: "Claim analysis has been completed successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/analyses'] });
    },
    onError: (error: any) => {
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to analyze claim.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: QueryFormData) => {
    if (!selectedDocumentId) {
      toast({
        title: "No Document Selected",
        description: "Please upload a policy document first.",
        variant: "destructive",
      });
      return;
    }

    try {
      await analyzeClaimMutation.mutateAsync(data);
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  const isLoading = analyzeClaimMutation.isPending;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Submit Your Query</h2>
        
        {!selectedDocumentId && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-yellow-800">
              Please upload and process policy documents first. The system can only evaluate claims based on information found in uploaded documents.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="query" className="block text-sm font-medium text-gray-700 mb-2">
              Natural Language Query
            </label>
            <Textarea
              id="query"
              placeholder="e.g., I need coverage for heart surgery for a 45-year-old patient in Mumbai with a 2-year-old policy"
              rows={4}
              {...register("query")}
              className="w-full resize-none"
              disabled={!selectedDocumentId}
            />
            {errors.query && (
              <p className="text-sm text-red-600 mt-1">{errors.query.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
            disabled={isLoading || !selectedDocumentId}
          >
            <Search className="w-5 h-5 mr-2" />
            {isLoading ? 'Evaluating Claim from Documents...' : 'Evaluate Claim from Documents'}
          </Button>
        </form>
      </div>
    </div>
  );
}
