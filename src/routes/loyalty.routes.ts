// backend/src/routes/loyalty.routes.ts
import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Get all loyalty transactions
router.get('/transactions', authMiddleware, async (req, res) => {
  try {
    // Importer le modèle ici pour éviter les dépendances circulaires
    const { LoyaltyTransaction } = await import('../models/LoyaltyTransaction.model');
    const transactions = await LoyaltyTransaction.find()
      .populate('clientId')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: transactions });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get client transactions
router.get('/transactions/client/:clientId', authMiddleware, async (req, res) => {
  try {
    const { LoyaltyTransaction } = await import('../models/LoyaltyTransaction.model');
    const transactions = await LoyaltyTransaction.find({ 
      clientId: req.params.clientId 
    }).sort({ createdAt: -1 });
    res.json({ success: true, data: transactions });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;