export default function handler(_req, res) {
  try {
    // Normally you'd validate tokens here. For the demo we just go back home.
    res.redirect('/');
  } catch {
    res.status(400).send('Auth failed');
  }
}