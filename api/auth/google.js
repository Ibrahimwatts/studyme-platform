export default async function handler(req, res) {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ error: 'No code provided' });
  }

  try {
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: `${req.headers.origin || 'https://studymekenya.vercel.app'}/admin/`,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      return res.status(400).json({ error: tokenData.error_description });
    }

    // For Decap CMS, we can store token or redirect with it
    // Simple version: redirect to dashboard with token in hash (insecure for production)
    const redirectUrl = `/admin/?access_token=${tokenData.access_token}&token_type=${tokenData.token_type}`;

    res.redirect(redirectUrl);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal error' });
  }
}