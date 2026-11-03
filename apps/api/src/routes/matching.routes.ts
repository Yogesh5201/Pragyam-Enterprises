import { Router, Request, Response } from 'express';
import { db } from '../db/inMemoryDb';
import { calculateMatchScore } from '@pragyam/shared';
import { authenticateJWT, requireAdmin } from '../middleware/auth.middleware';
import { MatchingResultDTO } from '@pragyam/types';

export const matchingRouter = Router();

// ==========================================
// ADMIN MATCHING ENGINE RECOMMENDATIONS
// ==========================================
matchingRouter.get('/admin/recommendations', authenticateJWT, requireAdmin, (req: Request, res: Response) => {
  try {
    const { requirementId } = req.query;
    const recommendations: MatchingResultDTO[] = [];

    const activeRequirements = requirementId
      ? db.requirements.filter(r => r.id === requirementId)
      : db.requirements.filter(r => r.status === 'OPEN' || r.status === 'UNDER_NEGOTIATION');

    const activeListings = db.listings.filter(
      l => l.status === 'ACTIVE' && !l.moderationFlagged
    );

    for (const reqItem of activeRequirements) {
      for (const stockItem of activeListings) {
        const seller = db.sellerProfiles.find(s => s.id === stockItem.sellerId);
        const buyer = db.buyerProfiles.find(b => b.id === reqItem.buyerId);

        const match = calculateMatchScore(
          {
            id: reqItem.id,
            anonymousCode: reqItem.anonymousCode,
            category: reqItem.category,
            variety: reqItem.variety,
            requiredQuantityMT: reqItem.requiredQuantityMT,
            targetPricePerQuintal: reqItem.targetPricePerQuintal,
            qualitySpecs: reqItem.qualitySpecs,
            deliveryLocation: {
              state: reqItem.deliveryLocation.state,
              district: reqItem.deliveryLocation.district
            },
            buyerCompanyName: buyer?.companyName
          },
          {
            id: stockItem.id,
            anonymousCode: stockItem.anonymousCode,
            category: stockItem.category,
            variety: stockItem.variety,
            availableQuantityMT: stockItem.availableQuantityMT,
            askingPricePerQuintal: stockItem.askingPricePerQuintal,
            qualitySpecs: stockItem.qualitySpecs,
            generalizedLocation: {
              state: stockItem.generalizedState,
              district: stockItem.generalizedDistrict
            },
            sellerCompanyName: seller?.companyName
          }
        );

        if (match && match.overallMatchScore >= 50) {
          recommendations.push(match);
        }
      }
    }

    // Sort by highest match score first
    recommendations.sort((a, b) => b.overallMatchScore - a.overallMatchScore);

    return res.json({
      success: true,
      count: recommendations.length,
      recommendations
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});
