import { printifyController } from '../controllers/printifyController.js';

export async function handler(req, res) {
  if (req.method === 'GET') {
    await printifyController.testConnection(req, res);
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
} 