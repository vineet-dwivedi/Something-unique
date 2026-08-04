import {Router} from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

const router = Router();

router.get("/google",passport.authenticate("google", { scope: ["profile", "email"] }));

router.get("/google/callback", passport.authenticate('google', { failureRedirect: '/login' }), async (req, res) => {
    try {
        const { id, emails, displayName, photos } = req.user;
        const email = emails[0].value;
        const avatar = photos[0].value;

        // Check if user already exists
        let existingUser = await User.findOne({ googleId: id });
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
        res.redirect('/dashboard'); // Redirect to dashboard or any other page
    } catch (error) {
        console.error("Error during Google authentication callback:", error);
        res.redirect('/login'); // Redirect to login on error
    }
});

export default router;