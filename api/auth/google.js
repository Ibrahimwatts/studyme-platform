export default async function handler(req, res) {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ error: 'No authorization code provided' });
  }

  console.log('Received Google code:', code.substring(0, 10) + '...');

  try {
    const body = new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: 'https://studymekenya.vercel.app/api/auth/google',
      grant_type: 'authorization_code',
    });

    console.log('Sending token request with redirect_uri:', body.get('redirect_uri'));

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });

    const tokenData = await tokenResponse.json();

    console.log('Google token response status:', tokenResponse.status);
    console.log('Google token response:', tokenData);

    if (!tokenResponse.ok || tokenData.error) {
      return res.status(tokenResponse.status || 400).json({
        error: tokenData.error || 'Token exchange failed',
        error_description: tokenData.error_description,
        status: tokenResponse.status,
      });
    }

    // Success – redirect to admin with token in hash
    const redirectUrl = `/admin/?access_token=${tokenData.access_token}&token_type=${tokenData.token_type}&expires_in=${tokenData.expires_in}`;

    res.redirect(redirectUrl);
  } catch (err) {
    console.error('Token exchange error:', err);
    res.status(500).json({ error: 'Internal server error during token exchange' });
  }
}