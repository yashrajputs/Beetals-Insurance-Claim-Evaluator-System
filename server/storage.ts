import { type Document, type InsertDocument, type Claim, type InsertClaim, type Analysis, type InsertAnalysis } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Documents
  createDocument(document: InsertDocument): Promise<Document>;
  getDocument(id: string): Promise<Document | undefined>;
  getAllDocuments(): Promise<Document[]>;
  updateDocument(id: string, updates: Partial<Document>): Promise<Document | undefined>;
  
  // Claims
  createClaim(claim: InsertClaim): Promise<Claim>;
  getClaim(id: string): Promise<Claim | undefined>;
  getClaimsByDocument(documentId: string): Promise<Claim[]>;
  getAllClaims(): Promise<Claim[]>;
  
  // Analyses
  createAnalysis(analysis: InsertAnalysis): Promise<Analysis>;
  getAnalysis(id: string): Promise<Analysis | undefined>;
  getAnalysesByClaim(claimId: string): Promise<Analysis[]>;
  getAllAnalyses(): Promise<Analysis[]>;
  getRecentAnalyses(limit?: number): Promise<Analysis[]>;
}

export class MemStorage implements IStorage {
  private documents: Map<string, Document>;
  private claims: Map<string, Claim>;
  private analyses: Map<string, Analysis>;

  constructor() {
    this.documents = new Map();
    this.claims = new Map();
    this.analyses = new Map();
  }

  // Documents
  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const id = randomUUID();
    const document: Document = {
      ...insertDocument,
      id,
      uploadedAt: new Date(),
      processedAt: null,
      status: insertDocument.status || "uploaded",
      sections: insertDocument.sections || null,
    };
    this.documents.set(id, document);
    return document;
  }

  async getDocument(id: string): Promise<Document | undefined> {
    return this.documents.get(id);
  }

  async getAllDocuments(): Promise<Document[]> {
    return Array.from(this.documents.values()).sort((a, b) => 
      new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    );
  }

  async updateDocument(id: string, updates: Partial<Document>): Promise<Document | undefined> {
    const existing = this.documents.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updates };
    this.documents.set(id, updated);
    return updated;
  }

  // Claims
  async createClaim(insertClaim: InsertClaim): Promise<Claim> {
    const id = randomUUID();
    const claim: Claim = {
      ...insertClaim,
      id,
      createdAt: new Date(),
      location: insertClaim.location || null,
      distance: insertClaim.distance || null,
      policyDuration: insertClaim.policyDuration || null,
      claimAmount: insertClaim.claimAmount || null,
      reimbursementPercentage: insertClaim.reimbursementPercentage || null,
    };
    this.claims.set(id, claim);
    return claim;
  }

  async getClaim(id: string): Promise<Claim | undefined> {
    return this.claims.get(id);
  }

  async getClaimsByDocument(documentId: string): Promise<Claim[]> {
    return Array.from(this.claims.values())
      .filter(claim => claim.documentId === documentId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getAllClaims(): Promise<Claim[]> {
    return Array.from(this.claims.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  // Analyses
  async createAnalysis(insertAnalysis: InsertAnalysis): Promise<Analysis> {
    const id = randomUUID();
    const analysis: Analysis = {
      ...insertAnalysis,
      id,
      createdAt: new Date(),
      approvedAmount: insertAnalysis.approvedAmount || null,
      relevantClauses: insertAnalysis.relevantClauses || null,
      aiResponse: insertAnalysis.aiResponse || null,
    };
    this.analyses.set(id, analysis);
    return analysis;
  }

  async getAnalysis(id: string): Promise<Analysis | undefined> {
    return this.analyses.get(id);
  }

  async getAnalysesByClaim(claimId: string): Promise<Analysis[]> {
    return Array.from(this.analyses.values())
      .filter(analysis => analysis.claimId === claimId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getAllAnalyses(): Promise<Analysis[]> {
    return Array.from(this.analyses.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getRecentAnalyses(limit: number = 10): Promise<Analysis[]> {
    const all = await this.getAllAnalyses();
    return all.slice(0, limit);
  }
}

export const storage = new MemStorage();
