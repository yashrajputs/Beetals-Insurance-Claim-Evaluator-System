import http from 'http';

async function testEndpoint(path, method = 'GET') {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: '127.0.0.1',
      port: 5000,
      path: path,
      method: method,
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          path: path,
          method: method,
          contentLength: data.length,
          success: res.statusCode < 400
        });
      });
    });

    req.on('error', (err) => {
      resolve({
        status: 'ERROR',
        path: path,
        method: method,
        error: err.message,
        success: false
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        status: 'TIMEOUT',
        path: path,
        method: method,
        error: 'Request timeout',
        success: false
      });
    });

    req.end();
  });
}

async function runTests() {
  console.log('🔍 Testing server endpoints...\n');
  
  const endpoints = [
    { path: '/', method: 'GET' },
    { path: '/dashboard', method: 'GET' },
    { path: '/api/documents', method: 'GET' },
    { path: '/api/claims', method: 'GET' },
    { path: '/api/stats', method: 'GET' },
    { path: '/nonexistent', method: 'GET' }
  ];

  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint.path, endpoint.method);
    const statusIcon = result.success ? '✅' : '❌';
    console.log(`${statusIcon} ${result.method} ${result.path} - Status: ${result.status}`);
    
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    } else if (result.contentLength !== undefined) {
      console.log(`   Content length: ${result.contentLength} bytes`);
    }
  }
  
  console.log('\n✨ Test complete!');
}

runTests().catch(console.error);
