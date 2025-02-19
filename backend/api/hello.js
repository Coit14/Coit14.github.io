// Using Node.js native http module to avoid any framework issues
module.exports = (req, res) => {
  return res.json({ message: 'Hello from Vercel!' });
};