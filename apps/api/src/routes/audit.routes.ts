import { Router, Request, Response } from 'express';
import { db } from '../db/inMemoryDb';
import { authenticateJWT, requireAdmin } from '../middleware/auth.middleware';

export const auditRouter = Router();

auditRouter.get('/admin/logs', authenticateJWT, requireAdmin, (req: Request, res: Response) => {
  try {
    const { action, entityType, limit } = req.query;
    let logs = [...db.auditLogs];

    if (action) {
      logs = logs.filter(l => l.action.toLowerCase() === String(action).toLowerCase());
    }
    if (entityType) {
      logs = logs.filter(l => l.entityType.toLowerCase() === String(entityType).toLowerCase());
    }

    const maxLimit = limit ? parseInt(String(limit), 10) : 100;
    const paginated = logs.slice(0, maxLimit);

    return res.json({
      success: true,
      total: logs.length,
      count: paginated.length,
      logs: paginated
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});
