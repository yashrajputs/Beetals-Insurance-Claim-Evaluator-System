import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertDocumentSchema, insertClaimSchema, insertAnalysisSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs";
import { analyzeClaim, processPDF, type AnalysisResult } from "./services/pythonService";

// Configure multer for file uploads
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const upload = multer({
  dest: uploadsDir,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Upload PDF document
  app.post("/api/documents/upload", upload.single('pdf'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const document = await storage.createDocument({
        filename: req.file.filename,
        originalName: req.file.originalname,
        fileSize: req.file.size,
        filePath: req.file.path,
        status: "uploaded",
        sections: null,
      });

      // Process PDF in background
      processPDF(req.file.path)
        .then(async (sections) => {
          await storage.updateDocument(document.id, {
            status: "processed",
            processedAt: new Date(),
            sections: sections,
          });
        })
        .catch(async (error) => {
          console.error("PDF processing error:", error);
          await storage.updateDocument(document.id, {
            status: "error",
          });
        });

      res.json(document);
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ message: "Upload failed" });
    }
  });

  // Get all documents
  app.get("/api/documents", async (req, res) => {
    try {
      const documents = await storage.getAllDocuments();
      res.json(documents);
    } catch (error) {
      console.error("Get documents error:", error);
      res.status(500).json({ message: "Failed to get documents" });
    }
  });

  // Get document by ID
  app.get("/api/documents/:id", async (req, res) => {
    try {
      const document = await storage.getDocument(req.params.id);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      res.json(document);
    } catch (error) {
      console.error("Get document error:", error);
      res.status(500).json({ message: "Failed to get document" });
    }
  });

  // Create claim
  app.post("/api/claims", async (req, res) => {
    try {
      const validatedData = insertClaimSchema.parse(req.body);
      const claim = await storage.createClaim(validatedData);
      res.json(claim);
    } catch (error) {
      console.error("Create claim error:", error);
      res.status(400).json({ message: "Invalid claim data" });
    }
  });

  // Get all claims
  app.get("/api/claims", async (req, res) => {
    try {
      const claims = await storage.getAllClaims();
      res.json(claims);
    } catch (error) {
      console.error("Get claims error:", error);
      res.status(500).json({ message: "Failed to get claims" });
    }
  });

  // Bulk analyze multiple claims
  app.post("/api/claims/bulk-analyze", async (req, res) => {
    try {
      const { queries, documentId } = req.body;
      
      if (!Array.isArray(queries) || queries.length === 0) {
        return res.status(400).json({ message: "Invalid queries array" });
      }
      
      if (!documentId) {
        return res.status(400).json({ message: "Document ID is required" });
      }
      
      const document = await storage.getDocument(documentId);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      if (document.status !== "processed") {
        return res.status(400).json({ message: "Document not yet processed" });
      }
      
      const apiKey = process.env.PERPLEXITY_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ message: "Perplexity API key not configured" });
      }
      
      // Process all queries in parallel
      const analysisPromises = queries.map(async (query: string, index: number) => {
        try {
          // Create claim for each query
          const claimData = {
            documentId: documentId,
            patientAge: 30,
            gender: 'unspecified',
            procedure: query,
            location: null,
            distance: null,
            policyDuration: null,
            claimAmount: null,
            reimbursementPercentage: 100,
          };
          
          const claim = await storage.createClaim(claimData);
          
          // Analyze the claim
          const analysisResult: AnalysisResult = await analyzeClaim(query, document.filePath, apiKey);
          
          if (analysisResult.error) {
            return {
              queryIndex: index,
              query: query,
              error: analysisResult.error,
              claimId: claim.id
            };
          }
          
          // Save analysis result
          const analysis = await storage.createAnalysis({
            claimId: claim.id,
            decision: analysisResult.decision?.decision || "Unknown",
            approvedAmount: analysisResult.decision?.amount || "Not specified",
            justification: analysisResult.decision?.justification || "No justification provided",
            relevantClauses: analysisResult.top_clauses || [],
            aiResponse: analysisResult.ai_response || {},
          });
          
          return {
            queryIndex: index,
            query: query,
            claimId: claim.id,
            analysis: analysis,
            sections: analysisResult.sections,
            topClauses: analysisResult.top_clauses,
          };
        } catch (error) {
          console.error(`Error processing query ${index}:`, error);
          return {
            queryIndex: index,
            query: query,
            error: `Processing failed: ${error}`,
            claimId: null
          };
        }
      });
      
      // Wait for all analyses to complete
      const results = await Promise.all(analysisPromises);
      
      res.json({
        success: true,
        totalQueries: queries.length,
        results: results,
        documentId: documentId
      });
      
    } catch (error) {
      console.error("Bulk analyze error:", error);
      res.status(500).json({ message: "Bulk analysis failed" });
    }
  });

  // Analyze claim
  app.post("/api/claims/:id/analyze", async (req, res) => {
    try {
      const claim = await storage.getClaim(req.params.id);
      if (!claim) {
        return res.status(404).json({ message: "Claim not found" });
      }

      const document = await storage.getDocument(claim.documentId);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }

      if (document.status !== "processed") {
        return res.status(400).json({ message: "Document not yet processed" });
      }

      // Use only the original procedure text as the query to avoid duplication
      // The procedure field already contains the complete user's natural language query
      const query = claim.procedure;

      const apiKey = process.env.PERPLEXITY_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ message: "Perplexity API key not configured" });
      }

      const analysisResult: AnalysisResult = await analyzeClaim(query, document.filePath, apiKey);

      if (analysisResult.error) {
        return res.status(500).json({ message: analysisResult.error });
      }

      // Save analysis result
      const analysis = await storage.createAnalysis({
        claimId: claim.id,
        decision: analysisResult.decision?.decision || "Unknown",
        approvedAmount: analysisResult.decision?.amount || "Not specified",
        justification: analysisResult.decision?.justification || "No justification provided",
        relevantClauses: analysisResult.top_clauses || [],
        aiResponse: analysisResult.ai_response || {},
      });

      res.json({
        analysis,
        sections: analysisResult.sections,
        topClauses: analysisResult.top_clauses,
        query: query, // Use the clean query we passed to analysis, not the result query
      });
    } catch (error) {
      console.error("Analyze claim error:", error);
      res.status(500).json({ message: "Analysis failed" });
    }
  });

  // Get all analyses
  app.get("/api/analyses", async (req, res) => {
    try {
      const analyses = await storage.getAllAnalyses();
      res.json(analyses);
    } catch (error) {
      console.error("Get analyses error:", error);
      res.status(500).json({ message: "Failed to get analyses" });
    }
  });

  // Get analyses by claim
  app.get("/api/claims/:id/analyses", async (req, res) => {
    try {
      const analyses = await storage.getAnalysesByClaim(req.params.id);
      res.json(analyses);
    } catch (error) {
      console.error("Get claim analyses error:", error);
      res.status(500).json({ message: "Failed to get analyses" });
    }
  });

  // Get recent analyses
  app.get("/api/analyses/recent", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const analyses = await storage.getRecentAnalyses(limit);
      res.json(analyses);
    } catch (error) {
      console.error("Get recent analyses error:", error);
      res.status(500).json({ message: "Failed to get recent analyses" });
    }
  });

  // Get statistics
  app.get("/api/stats", async (req, res) => {
    try {
      const analyses = await storage.getAllAnalyses();
      const totalAnalyses = analyses.length;
      const approvedClaims = analyses.filter(a => a.decision === "Yes").length;
      const partialClaims = analyses.filter(a => a.decision === "Partial").length;
      const rejectedClaims = analyses.filter(a => a.decision === "No").length;
      const pendingClaims = 0; // Since we don't have pending status in our simple model

      const approvalRate = totalAnalyses > 0 ? ((approvedClaims + partialClaims) / totalAnalyses) * 100 : 0;

      res.json({
        totalAnalyses,
        approvedClaims,
        partialClaims,
        rejectedClaims,
        pendingClaims,
        approvalRate: Math.round(approvalRate * 10) / 10,
      });
    } catch (error) {
      console.error("Get stats error:", error);
      res.status(500).json({ message: "Failed to get statistics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
