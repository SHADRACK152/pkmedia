// Test script to create a short news post
import 'dotenv/config';

const baseUrl = 'http://localhost:5000';

async function testShortNews() {
  console.log('Testing Short News API...\n');

  // 1. Get all short news (should be empty initially)
  console.log('1. Fetching all short news...');
  const getRes = await fetch(`${baseUrl}/api/short-news`);
  const allNews = await getRes.json();
  console.log('Current short news count:', allNews.length);

  // 2. Login first (required for creating short news)
  console.log('\n2. Logging in as admin...');
  const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'admin',
      password:
        process.env.DEFAULT_ADMIN_PASSWORD ||
        process.env.ADMIN_PASSWORD ||
        'Pkmedia@123',
    }),
  });

  if (!loginRes.ok) {
    console.log('Login failed. Make sure you have an admin account.');
    return;
  }

  const setCookies = loginRes.headers.getSetCookie?.() ?? [
    loginRes.headers.get('set-cookie') || '',
  ];
  const cookies = setCookies
    .map((cookie) => cookie.split(';', 1)[0])
    .filter(Boolean)
    .join('; ');
  if (!cookies) {
    throw new Error('Login succeeded but no session cookie was returned.');
  }
  console.log('Login successful!');

  // 3. Create a test short news post
  console.log('\n3. Creating test short news...');
  const testNews = {
    content: 'Breaking: Mount Kenya News launches quick updates feature! 🎉 Stay informed with bite-sized news.',
    category: 'Technology',
    author: 'Mount Kenya News',
    image: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400',
    linkUrl: '',
    isPinned: true,
    status: 'published'
  };

  const createRes = await fetch(`${baseUrl}/api/short-news`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookies
    },
    body: JSON.stringify(testNews)
  });

  if (!createRes.ok) {
    console.log('Failed to create short news:', await createRes.text());
    return;
  }

  const created = await createRes.json();
  console.log('✅ Short news created successfully!');
  console.log('ID:', created.id);
  console.log('Content:', created.content);

  // 4. Verify it appears in the list
  console.log('\n4. Verifying short news appears in feed...');
  const verifyRes = await fetch(`${baseUrl}/api/short-news`);
  const updatedNews = await verifyRes.json();
  console.log('Short news count now:', updatedNews.length);

  if (updatedNews.length > 0) {
    console.log('\n✅ SUCCESS! Short news is working!');
    console.log('\nYou can now:');
    console.log('- Visit http://localhost:5000 to see the short news on the homepage sidebar');
    console.log('- Go to http://localhost:5000/admin to manage short news posts');
  }
}

testShortNews().catch(console.error);
