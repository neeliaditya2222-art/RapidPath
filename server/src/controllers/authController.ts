import { Request, Response, NextFunction } from 'express';
import { UserModel, SettingsModel } from '../models/User';
import { logger } from '../utils/logger';

export const authController = {
  /**
   * Sync Firebase Authenticated User into MongoDB
   * Creates or updates the user profile in MongoDB upon Firebase sign-in / registration
   */
  syncUser: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const {
        firebaseUid,
        email,
        name,
        role,
        badgeNumber,
        jurisdiction,
        phone,
        organization,
        photoURL,
        memberSince,
        lastLogin,
        preferences,
      } = req.body;

      if (!email) {
        res.status(400).json({ success: false, message: 'User email is required for sync.' });
        return;
      }

      const normalizedEmail = email.trim().toLowerCase();
      const now = new Date();
      const formattedTimestamp =
        lastLogin ||
        now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
          ' • ' +
          now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

      // Upsert user into MongoDB
      let user = await UserModel.findOne({
        $or: [{ email: normalizedEmail }, { firebaseUid: firebaseUid || '' }],
      });

      if (user) {
        // Update existing user with latest credentials and telemetry
        if (firebaseUid) user.firebaseUid = firebaseUid;
        if (name) user.name = name;
        if (role) user.role = role;
        if (badgeNumber) user.badgeNumber = badgeNumber;
        if (jurisdiction) user.jurisdiction = jurisdiction;
        if (phone) user.phone = phone;
        if (organization) user.organization = organization;
        if (photoURL) user.photoURL = photoURL;
        if (preferences) user.preferences = { ...user.preferences, ...preferences };
        user.lastLogin = formattedTimestamp;
        await user.save();
        logger.info(`MongoDB: Synced existing user profile for ${normalizedEmail}`);
      } else {
        // Create new user record in MongoDB
        user = await UserModel.create({
          firebaseUid: firebaseUid || `fb_${Date.now()}`,
          email: normalizedEmail,
          name: name || normalizedEmail.split('@')[0],
          role: role || 'Dispatcher',
          badgeNumber: badgeNumber || `RP-${Date.now().toString(36).slice(-4).toUpperCase()}`,
          jurisdiction: jurisdiction || 'Metropolitan Emergency Dispatch Center 01',
          phone: phone || '+91 98765 43210',
          organization: organization || 'Emergency Operations Center',
          photoURL: photoURL || '',
          memberSince: memberSince || 'October 2026',
          lastLogin: formattedTimestamp,
          preferences: preferences || {
            notifications: true,
            emailNotifications: true,
            routeAlerts: true,
          },
        });
        logger.info(`MongoDB: Created new synchronized user record for ${normalizedEmail}`);
      }

      // Ensure default settings exist in MongoDB
      const existingSettings = await SettingsModel.findOne({ userId: user._id.toString() });
      if (!existingSettings) {
        await SettingsModel.create({
          userId: user._id.toString(),
          refreshIntervalSeconds: 30,
          defaultVehicleType: 'ambulance',
          defaultEmergencyPriority: 'critical',
          mapTheme: 'tactical',
          autoRerouteOnCongestion: true,
          soundAlertsEnabled: true,
          simulationMode: false,
        });
      }

      res.status(200).json({
        success: true,
        message: 'User synchronized with MongoDB successfully',
        user: {
          id: user._id.toString(),
          firebaseUid: user.firebaseUid,
          email: user.email,
          name: user.name,
          role: user.role,
          badgeNumber: user.badgeNumber,
          jurisdiction: user.jurisdiction,
          phone: user.phone,
          organization: user.organization,
          photoURL: user.photoURL,
          memberSince: user.memberSince,
          lastLogin: user.lastLogin,
          preferences: user.preferences,
        },
      });
    } catch (err: any) {
      logger.error('Error synchronizing Firebase user to MongoDB:', err);
      res.status(500).json({
        success: false,
        message: 'Failed to sync user with MongoDB database',
        error: err.message,
      });
    }
  },

  /**
   * Get MongoDB profile for authenticated user
   */
  getProfile: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const email = req.query.email as string;
      const firebaseUid = req.query.firebaseUid as string;

      if (!email && !firebaseUid) {
        res.status(400).json({ success: false, message: 'Email or Firebase UID required.' });
        return;
      }

      const query: any = {};
      if (email) query.email = email.trim().toLowerCase();
      if (firebaseUid) query.firebaseUid = firebaseUid;

      const user = await UserModel.findOne(query);
      if (!user) {
        res.status(404).json({ success: false, message: 'User not found in MongoDB' });
        return;
      }

      res.status(200).json({
        success: true,
        user,
      });
    } catch (err: any) {
      next(err);
    }
  },

  /**
   * Update User Profile in MongoDB
   */
  updateProfile: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, firebaseUid, name, phone, organization, role, preferences } = req.body;

      if (!email && !firebaseUid) {
        res.status(400).json({ success: false, message: 'Email or Firebase UID is required.' });
        return;
      }

      const query: any = {};
      if (email) query.email = email.trim().toLowerCase();
      if (firebaseUid) query.firebaseUid = firebaseUid;

      const user = await UserModel.findOne(query);
      if (!user) {
        res.status(404).json({ success: false, message: 'User not found in MongoDB' });
        return;
      }

      if (name) user.name = name;
      if (phone) user.phone = phone;
      if (organization) user.organization = organization;
      if (role) user.role = role;
      if (preferences) user.preferences = { ...user.preferences, ...preferences };

      await user.save();
      logger.info(`MongoDB: Updated profile for ${user.email}`);

      res.status(200).json({
        success: true,
        message: 'Profile updated in MongoDB successfully',
        user,
      });
    } catch (err: any) {
      next(err);
    }
  },
};
