import { readFileSync } from 'fs';
import { createServer } from 'http';
import { google } from 'googleapis';

// Load env vars manually
const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8')
    .split('\n')
    .filter(l => l.includes('='))
    .map(l => [l.split('=')[0].trim(), l.slice(l.indexOf('=') + 1).trim()])
);

const CLIENT_ID = env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = 'http://localhost:3000';

if (!CLIENT_ID || !CLIENT_SECRET || CLIENT_ID === 'your_client_id_here') {
  console.error('ERROR: Fill in GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env.local first.');
  process.exit(1);
}

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  prompt: 'consent',
  scope: ['https://www.googleapis.com/auth/spreadsheets'],
});

console.log('\n--- RevAudit Google Auth ---\n');
console.log('1. Opening your browser...');
console.log('2. Sign in and allow access');
console.log('3. Your refresh token will appear here\n');

// Open the URL
const { exec } = await import('child_process');
exec(`open "${authUrl}"`);

// Temporarily serve on :3000 to catch the redirect
const server = createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost:3000');
  const code = url.searchParams.get('code');

  if (!code) {
    res.end('No code received. Try again.');
    return;
  }

  res.end('<h2>Success! Check your terminal for the refresh token.</h2><p>You can close this tab.</p>');

  const { tokens } = await oauth2Client.getToken(code);

  console.log('✅ GOOGLE_REFRESH_TOKEN=' + tokens.refresh_token);
  console.log('\nPaste that value into your .env.local file.\n');

  server.close();
});

server.listen(3000, () => {
  console.log('Waiting for Google to redirect back...\n');
});
