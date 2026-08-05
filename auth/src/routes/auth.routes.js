import { Router } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import { sendAuthNotification } from '../config/mq.js';

const router = Router();

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get("/google/callback", passport.authenticate('google', { failureRedirect: '/login' }), async (req, res) => {
    try {
        const { id, emails, displayName, photos } = req.user;
        const email = emails[0].value;
        const avatar = photos ? photos[0].value : '';

        // 1. Check if user already exists in the database
        let user = await User.findOne({ googleId: id });
        let actionType = 'google_login';

        // 2. If user doesn't exist, create and save them first
        if (!user) {
            user = new User({
                googleId: id,
                email: email,
                name: displayName,
                avatar: avatar
            });
            await user.save();
            actionType = 'google_signup';
        }

        // 3. Now 'user' is guaranteed to exist and possess a valid _id
        await sendAuthNotification({
            userId: user._id,
            action: actionType,
            timestamp: new Date(),
            email: email,
        });

        // 4. Generate JWT token
        const token = jwt.sign(
            { id: user._id, email: user.email }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1h' }
        );

        res.cookie('token', token, { httpOnly: true });
        res.redirect('/'); // Redirect to your frontend after successful login
    } catch (error) {
        console.error("Error during Google authentication callback:", error);
        res.redirect('/'); // Redirect to your frontend on error
    }
});

export default router;