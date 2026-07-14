const http = require('http');

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhNDczNmEwZWY2OTBlZTEyZmNkYTQ1NSIsImlhdCI6MTc4MzA1MjAzMCwiZXhwIjoxNzg1NjQ0MDMwfQ.JnLhj75Ne7sNWm3NtcrW5a30XcZGQTt5dq89D0AsHgY';
const tiny1x1PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
const boundary = '----TestBoundary123';

let body = '';
body += `--${boundary}\r\n`;
body += `Content-Disposition: form-data; name="title"\r\n\r\nTest Image\r\n`;
body += `--${boundary}\r\n`;
body += `Content-Disposition: form-data; name="category"\r\n\r\nTest\r\n`;
body += `--${boundary}\r\n`;
body += `Content-Disposition: form-data; name="image"; filename="test.png"\r\n`;
body += `Content-Type: image/png\r\n\r\n`;

const bodyStart = Buffer.from(body);
const bodyEnd = Buffer.from(`\r\n--${boundary}--\r\n`);
const fullBody = Buffer.concat([bodyStart, tiny1x1PNG, bodyEnd]);

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/gallery',
  method: 'POST',
  headers: {
    'Content-Type': `multipart/form-data; boundary=${boundary}`,
    'Content-Length': fullBody.length,
    'Authorization': `Bearer ${token}`
  }
};

console.log('Sending POST /api/gallery with auth token...');

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Headers:', JSON.stringify(res.headers));
    console.log('Body:', data.substring(0, 500));
    process.exit(0);
  });
});

req.on('error', e => { console.error('Error:', e.message); process.exit(1); });
req.write(fullBody);
req.end();
