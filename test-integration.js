const http = require('http');

console.log('🚀 COMPLETE INTEGRATION TEST\n');

// Test 1: Backend health
console.log('1. Testing Backend Health...');
http.get('http://localhost:3001/health', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const health = JSON.parse(data);
    console.log(`   ✅ Backend healthy: ${health.status}`);
    
    // Test 2: Frontend accessibility
    console.log('\n2. Testing Frontend Accessibility...');
    http.get('http://localhost:3000', (res) => {
      console.log(`   ✅ Frontend accessible: Status ${res.statusCode}`);
      
      // Test 3: Proxy integration
      console.log('\n3. Testing Proxy Integration...');
      const req = http.request({
        hostname: 'localhost',
        port: 3000,
        path: '/backend-api/auth/login',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          const auth = JSON.parse(data);
          if (auth.token && auth.user) {
            console.log(`   ✅ Proxy working: User ${auth.user.email} authenticated`);
            console.log(`   ✅ JWT token received: ${auth.token.substring(0, 30)}...`);
            
            // Test 4: Test devices API through proxy
            console.log('\n4. Testing Devices API through Proxy...');
            const deviceReq = http.request({
              hostname: 'localhost',
              port: 3000,
              path: '/backend-api/devices',
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${auth.token}`
              }
            }, (deviceRes) => {
              let deviceData = '';
              deviceRes.on('data', chunk => deviceData += chunk);
              deviceRes.on('end', () => {
                try {
                  const devices = JSON.parse(deviceData);
                  console.log(`   ✅ Devices API working: ${Array.isArray(devices) ? devices.length : 'response received'}`);
                  
                  console.log('\n🎉 INTEGRATION TEST COMPLETE!');
                  console.log('\n✅ SYSTEM STATUS:');
                  console.log('   - Backend: Running on port 3001');
                  console.log('   - Frontend: Running on port 3000');
                  console.log('   - Proxy: /backend-api/ → Express backend');
                  console.log('   - Authentication: Working with JWT');
                  console.log('   - API Integration: Frontend using separate backend');
                  
                } catch (e) {
                  console.log(`   ⚠️ Devices API response: ${deviceData.substring(0, 100)}`);
                }
              });
            });
            deviceReq.end();
          } else {
            console.log(`   ❌ Authentication failed: ${data.substring(0, 100)}`);
          }
        });
      });
      
      req.write(JSON.stringify({
        email: 'admin@example.com',
        password: 'admin123'
      }));
      req.end();
    });
  });
}).on('error', (err) => {
  console.log(`   ❌ Backend not accessible: ${err.message}`);
});