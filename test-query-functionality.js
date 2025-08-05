import fs from 'fs';
import path from 'path';
import FormData from 'form-data';

const BASE_URL = 'http://127.0.0.1:5000';

async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    return { success: response.ok, status: response.status, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function uploadTestDocument() {
  console.log('📄 Testing document upload...');
  
  const pdfPath = path.join(process.cwd(), 'test-policy.pdf');
  
  if (!fs.existsSync(pdfPath)) {
    console.log('❌ test-policy.pdf not found, skipping upload test');
    return null;
  }

  const formData = new FormData();
  formData.append('pdf', fs.createReadStream(pdfPath));

  try {
    const response = await fetch(`${BASE_URL}/api/documents/upload`, {
      method: 'POST',
      body: formData,
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Document uploaded successfully');
      console.log(`   Document ID: ${result.id}`);
      console.log(`   Status: ${result.status}`);
      return result;
    } else {
      const error = await response.json();
      console.log('❌ Document upload failed:', error.message);
      return null;
    }
  } catch (error) {
    console.log('❌ Document upload error:', error.message);
    return null;
  }
}

async function testSingleQuery(documentId) {
  console.log('\n🔍 Testing single query analysis...');
  
  const testQuery = "50M, used air ambulance, 300 km, claim ₹1L";
  
  // First create a claim
  const claimData = {
    documentId: documentId,
    patientAge: 50,
    gender: 'male',
    procedure: testQuery,
    location: null,
    distance: 300,
    policyDuration: null,
    claimAmount: 100000,
    reimbursementPercentage: 100,
  };

  const claimResult = await makeRequest(`${BASE_URL}/api/claims`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(claimData),
  });

  if (!claimResult.success) {
    console.log('❌ Failed to create claim:', claimResult.data?.message || claimResult.error);
    return false;
  }

  console.log('✅ Claim created successfully');
  console.log(`   Claim ID: ${claimResult.data.id}`);

  // Now analyze the claim
  const analysisResult = await makeRequest(`${BASE_URL}/api/claims/${claimResult.data.id}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });

  if (analysisResult.success) {
    console.log('✅ Single query analysis completed');
    console.log(`   Decision: ${analysisResult.data.analysis.decision}`);
    console.log(`   Amount: ${analysisResult.data.analysis.approvedAmount}`);
    console.log(`   Justification: ${analysisResult.data.analysis.justification.substring(0, 100)}...`);
    return true;
  } else {
    console.log('❌ Single query analysis failed:', analysisResult.data?.message || analysisResult.error);
    return false;
  }
}

async function testMultiQuery(documentId) {
  console.log('\n🔍 Testing multi-query analysis...');
  
  const testQueries = [
    "50M, used air ambulance, 300 km, claim ₹1L",
    "65F, hip replacement, 5-day stay",
    "30M, emergency appendix surgery, midnight admission",
    "45F, maternity delivery with complications, 3-day stay",
    "55M, diabetic treatment, regular medication coverage"
  ];

  const bulkData = {
    queries: testQueries,
    documentId: documentId
  };

  const result = await makeRequest(`${BASE_URL}/api/claims/bulk-analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bulkData),
  });

  if (result.success) {
    console.log('✅ Multi-query analysis completed');
    console.log(`   Total queries: ${result.data.totalQueries}`);
    console.log(`   Successful analyses: ${result.data.results.filter(r => r.analysis).length}`);
    console.log(`   Failed analyses: ${result.data.results.filter(r => r.error).length}`);
    
    // Show sample results
    result.data.results.slice(0, 2).forEach((res, index) => {
      console.log(`\n   Query ${index + 1}: "${res.query}"`);
      if (res.analysis) {
        console.log(`   Decision: ${res.analysis.decision}`);
        console.log(`   Amount: ${res.analysis.approvedAmount}`);
      } else if (res.error) {
        console.log(`   Error: ${res.error}`);
      }
    });
    
    return true;
  } else {
    console.log('❌ Multi-query analysis failed:', result.data?.message || result.error);
    return false;
  }
}

async function testPythonProcessor() {
  console.log('\n🐍 Testing Python processor directly...');
  
  const pdfPath = path.join(process.cwd(), 'test-policy.pdf');
  const testQuery = "Emergency surgery for 45-year-old male, claim ₹75000";
  const apiKey = process.env.PERPLEXITY_API_KEY || "test_api_key";

  try {
    const { spawn } = await import('child_process');
    
    return new Promise((resolve) => {
      const pythonProcess = spawn('python', [
        'server/services/pdfProcessor.py',
        testQuery,
        pdfPath,
        apiKey
      ]);

      let stdout = '';
      let stderr = '';

      pythonProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      pythonProcess.on('close', (code) => {
        if (code === 0) {
          try {
            const result = JSON.parse(stdout);
            console.log('✅ Python processor test successful');
            console.log(`   Decision: ${result.decision?.decision || 'Unknown'}`);
            console.log(`   Amount: ${result.decision?.amount || 'Not specified'}`);
            console.log(`   Sections found: ${result.sections?.length || 0}`);
            resolve(true);
          } catch (error) {
            console.log('❌ Failed to parse Python output:', error.message);
            console.log('Raw output:', stdout);
            resolve(false);
          }
        } else {
          console.log('❌ Python processor failed with code:', code);
          console.log('Error:', stderr);
          resolve(false);
        }
      });

      pythonProcess.on('error', (error) => {
        console.log('❌ Failed to start Python process:', error.message);
        resolve(false);
      });
    });
  } catch (error) {
    console.log('❌ Python processor test error:', error.message);
    return false;
  }
}

async function testAPIEndpoints() {
  console.log('\n🌐 Testing API endpoints...');
  
  const endpoints = [
    { path: '/api/documents', method: 'GET' },
    { path: '/api/claims', method: 'GET' },
    { path: '/api/analyses', method: 'GET' },
    { path: '/api/stats', method: 'GET' },
  ];

  let allPassed = true;
  
  for (const endpoint of endpoints) {
    const result = await makeRequest(`${BASE_URL}${endpoint.path}`, {
      method: endpoint.method,
    });
    
    if (result.success) {
      console.log(`✅ ${endpoint.method} ${endpoint.path} - Status: ${result.status}`);
    } else {
      console.log(`❌ ${endpoint.method} ${endpoint.path} - Failed: ${result.error || result.data?.message}`);
      allPassed = false;
    }
  }
  
  return allPassed;
}

async function runAllTests() {
  console.log('🚀 Starting comprehensive query functionality tests...\n');
  
  const results = {
    endpoints: false,
    python: false,
    upload: false,
    single: false,
    multi: false
  };

  // Test API endpoints
  results.endpoints = await testAPIEndpoints();
  
  // Test Python processor
  results.python = await testPythonProcessor();
  
  // Test document upload
  const document = await uploadTestDocument();
  results.upload = !!document;
  
  if (document) {
    // Wait a moment for document processing
    console.log('\n⏳ Waiting for document processing...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Update document status to processed for testing
    document.status = 'processed';
    
    // Test single query
    results.single = await testSingleQuery(document.id);
    
    // Test multi-query
    results.multi = await testMultiQuery(document.id);
  }
  
  // Summary
  console.log('\n📊 Test Results Summary:');
  console.log('========================');
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test.toUpperCase()}: ${passed ? 'PASSED' : 'FAILED'}`);
  });
  
  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(Boolean).length;
  
  console.log(`\n🎯 Overall: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! Query functionality is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Check the output above for details.');
  }
}

// Add fetch polyfill for Node.js if needed
if (!global.fetch) {
  const { default: fetch } = await import('node-fetch');
  global.fetch = fetch;
}

runAllTests().catch(console.error);
