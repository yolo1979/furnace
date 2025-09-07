export default function handler(req, res) {
  const flow = process.env.NEXT_PUBLIC_DESCOPE_FLOW_URL;
  const redirect = process.env.DESCOPE_REDIRECT_URI;
  if (!flow || !redirect) {
    return res.status(500).send('Descope not configured');
  }
  res.redirect(`${flow}?redirect_uri=${encodeURIComponent(redirect)}`);
}