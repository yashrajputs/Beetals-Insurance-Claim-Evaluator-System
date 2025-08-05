import { useState } from "react";
import { FileText, Upload } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FileUpload from "@/components/FileUpload";
import ClaimsForm from "@/components/ClaimsForm";
import MultiQueryForm from "@/components/MultiQueryForm";
import AnalysisResults from "@/components/AnalysisResults";
import MultiQueryResults from "@/components/MultiQueryResults";
import BeetleLogo from "@/components/BeetleLogo";

export default function Dashboard() {
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [currentAnalysis, setCurrentAnalysis] = useState<any>(null);
  const [multiQueryResults, setMultiQueryResults] = useState<any>(null);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center p-1">
              <BeetleLogo size={40} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Beetals Document-Based Insurance Claim Evaluator</h1>
              <p className="text-blue-100 text-sm">AI-powered system using only uploaded policy documents</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        
        {/* Document Upload Section */}
        <FileUpload onDocumentUploaded={setSelectedDocumentId} />
        
        {/* Analysis Section with Tabs */}
        <Tabs defaultValue="single" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="single">Single Query Analysis</TabsTrigger>
            <TabsTrigger value="multi">Multi-Query Analysis</TabsTrigger>
          </TabsList>
          
          <TabsContent value="single" className="space-y-6">
            <ClaimsForm 
              selectedDocumentId={selectedDocumentId}
              onAnalysisComplete={setCurrentAnalysis}
            />
            
            {currentAnalysis && (
              <AnalysisResults analysis={currentAnalysis} />
            )}
          </TabsContent>
          
          <TabsContent value="multi" className="space-y-6">
            <MultiQueryForm 
              selectedDocumentId={selectedDocumentId}
              onAnalysisComplete={setMultiQueryResults}
            />
            
            {multiQueryResults && (
              <MultiQueryResults results={multiQueryResults} />
            )}
          </TabsContent>
        </Tabs>
        
        {/* Default Results Section */}
        {!currentAnalysis && !multiQueryResults && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-6 h-6 border-2 border-gray-400 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                </div>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">AI Evaluation Results</h3>
              <p className="text-gray-500">Submit queries to see AI-powered evaluation results</p>
              <p className="text-sm text-gray-400 mt-2">Choose between single query or multi-query analysis above</p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white mt-16">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="text-center">
            <p className="text-sm text-gray-300">
              © 2025 Beetals Document-Based Insurance Claim Evaluator System. All rights reserved.
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Powered by Document Analysis, Policy Text Processing & Evidence-Based Decision Making
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
