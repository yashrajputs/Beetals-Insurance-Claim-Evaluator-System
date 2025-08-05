import { spawn } from 'child_process';
import path from 'path';

export interface AnalysisResult {
  success?: boolean;
  sections?: any[];
  top_clauses?: any[];
  ai_response?: any;
  decision?: {
    decision: string;
    amount: string;
    justification: string;
  };
  query?: string;
  error?: string;
}

export async function analyzeClaim(query: string, pdfPath: string, apiKey: string): Promise<AnalysisResult> {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(process.cwd(), 'server/services/pdfProcessor.py');
    const pythonProcess = spawn('python', [pythonScript, query, pdfPath, apiKey]);
    
    let stdout = '';
    let stderr = '';
    
    pythonProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    pythonProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Python process exited with code ${code}: ${stderr}`));
        return;
      }
      
      try {
        const result = JSON.parse(stdout);
        resolve(result);
      } catch (error) {
        reject(new Error(`Failed to parse Python output: ${error}`));
      }
    });
    
    pythonProcess.on('error', (error) => {
      reject(new Error(`Failed to start Python process: ${error}`));
    });
  });
}

export async function processPDF(pdfPath: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(process.cwd(), 'server/services/pdfProcessor.py');
    const pythonProcess = spawn('python', ['-c', `
import sys
sys.path.append(r'${path.dirname(pythonScript)}')
from pdfProcessor import extract_structured_sections
import json

sections = extract_structured_sections(r'${pdfPath}')
print(json.dumps(sections))
`]);
    
    let stdout = '';
    let stderr = '';
    
    pythonProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    pythonProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Python process exited with code ${code}: ${stderr}`));
        return;
      }
      
      try {
        const sections = JSON.parse(stdout);
        resolve(sections);
      } catch (error) {
        reject(new Error(`Failed to parse Python output: ${error}`));
      }
    });
    
    pythonProcess.on('error', (error) => {
      reject(new Error(`Failed to start Python process: ${error}`));
    });
  });
}
