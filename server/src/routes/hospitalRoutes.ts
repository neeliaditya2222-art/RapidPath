import { Router, Request, Response, NextFunction } from 'express';
import { googleMapsService } from '../services/maps/googleMapsService';
import { ValidationError } from '../utils/errors';

const router = Router();

/**
 * GET /api/hospitals/nearby?lat={lat}&lng={lng}&radius={radius}
 */
router.get('/nearby', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const lat = parseFloat(req.query.lat as string);
    const lng = parseFloat(req.query.lng as string);
    const radius = req.query.radius ? parseInt(req.query.radius as string, 10) : 15000;

    if (isNaN(lat) || isNaN(lng)) {
      throw new ValidationError('Valid latitude and longitude are required query parameters');
    }

    const hospitals = await googleMapsService.getNearbyHospitals(lat, lng, radius);
    res.status(200).json({
      success: true,
      count: hospitals.length,
      hospitals,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
