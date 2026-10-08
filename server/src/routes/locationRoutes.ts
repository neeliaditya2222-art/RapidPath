import { Router, Request, Response, NextFunction } from 'express';
import { googleMapsService } from '../services/maps/googleMapsService';
import { ValidationError } from '../utils/errors';

const router = Router();

/**
 * GET /api/location/reverse-geocode?lat={lat}&lng={lng}
 */
router.get('/reverse-geocode', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const lat = parseFloat(req.query.lat as string);
    const lng = parseFloat(req.query.lng as string);

    if (isNaN(lat) || isNaN(lng)) {
      throw new ValidationError('Valid latitude and longitude are required query parameters');
    }

    const result = await googleMapsService.reverseGeocode(lat, lng);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/location/geocode
 */
router.post('/geocode', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { address } = req.body;
    if (!address || typeof address !== 'string') {
      throw new ValidationError('Address string is required');
    }

    const result = await googleMapsService.geocodeAddress(address);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
