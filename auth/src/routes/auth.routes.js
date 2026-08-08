import { Router } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import { sendAuthNotification } from '../config/mq.js';

const router = Router();

// Initiate Google OAuth login flow
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google OAuth callback
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), async (req, res) => {
    try {
        const { id, emails, displayName, photos } = req.user;
        const email = emails?.[0]?.value || '';
        const avatar = photos ? photos[0].value : '';

        // 1. Check if user already exists in DB
        let user = await User.findOne({ googleId: id });
        let actionType = 'google_login';

        // 2. If user doesn't exist, create and save user
        if (!user) {
            user = new User({
                googleId: id,
                email: email,
                name: displayName || 'User',
                avatar: avatar
            });
            await user.save();
            actionType = 'google_signup';
        }

        // 3. Send notification (async/safe)
        sendAuthNotification({
            userId: user._id,
            action: actionType,
            timestamp: new Date(),
            email: email,
        }).catch(err => console.warn('Auth notification dispatch error:', err));

        // 4. Generate JWT token with full profile info
        const jwtSecret = process.env.JWT_SECRET || 'fallback-dev-secret';
        const token = jwt.sign(
            { 
                id: user._id, 
                email: user.email,
                name: user.name,
                avatar: user.avatar 
            }, 
            jwtSecret, 
            { expiresIn: '7d' }
        );

        // 5. Set httpOnly cookie and redirect to frontend
        res.cookie('token', token, { 
            httpOnly: true, 
            sameSite: 'lax',
            path: '/',
            maxAge: 7 * 24 * 60 * 60 * 1000 
        });

        const targetFrontend = process.env.FRONTEND_URL || 'http://localhost:5173';
        res.redirect(targetFrontend);
    } catch (error) {
        console.error("Error during Google authentication callback:", error);
        const targetFrontend = process.env.FRONTEND_URL || 'http://localhost:5173';
        res.redirect(targetFrontend);
    }
});

// Fetch logged-in user profile status
router.get('/me', async (req, res) => {
    try {
        const token = req.cookies?.token || req.headers['authorization']?.split(' ')[1];
        if (!token) {
            return res.status(200).json({ authenticated: false, user: null });
        }

        const jwtSecret = process.env.JWT_SECRET || 'fallback-dev-secret';
        const decoded = jwt.verify(token, jwtSecret);

        const user = await User.findById(decoded.id).select('-googleId -__v');
        if (!user) {
            return res.status(200).json({ authenticated: false, user: null });
        }

        return res.json({
            authenticated: true,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                avatar: user.avatar
            }
        });
    } catch (err) {
        return res.status(200).json({ authenticated: false, user: null, error: err.message });
    }
});

// Logout user
router.all('/logout', (req, res) => {
    res.clearCookie('token', { path: '/' });
    if (req.logout) {
        req.logout(() => {});
    }
    return res.json({ success: true, message: 'Logged out successfully' });
});

export default router;