import {Router} from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import { sendAuthNotification } from '../services/notification.service.js';

const router = Router();

router.get("/google",passport.authenticate("google", { scope: ["profile", "email"] }));

router.get("/google/callback", passport.authenticate('google', { failureRedirect: '/login' }), async (req, res) => {
    try {
        const { id, emails, displayName, photos } = req.user;
        const email = emails[0].value;
        const avatar = photos[0].value;

        // Check if user already exists
        let existingUser = await User.findOne({ googleId: id });

        await sendAuthNotification({
            userId: existingUser._id,
            action: 'google_login',
            timestamp: new Date(),
            email: emails[0].value,
        });

        if (!existingUser) {
            // If user doesn't exist, create a new user
            existingUser = new User({
                googleId: id,
                email: emails[0].value,
                name: displayName,
                avatar: photos[0].value
            });
            await existingUser.save();
        }

        // Generate JWT token
        const token = jwt.sign({id: existingUser._id, email: existingUser.email}, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.cookie('token', token, { httpOnly: true });
        res.redirect('/'); // Redirect to your frontend after successful login
    } catch (error) {
        console.error("Error during Google authentication callback:", error);
        res.redirect('/'); // Redirect to your frontend on error
    }
});

export default router;