import {Router} from 'express';
import passport from 'passport';
import user from '../models/user.model.js';

const router = Router();

router.get("/google",passport.authenticate("google", { scope: ["profile", "email"] }));

router.get("/google/callback", passport.authenticate('google', { failureRedirect: '/login' }), async (req, res) => {
    try {
        const { id, emails, displayName, photos } = req.user;
        const email = emails[0].value;
        const avatar = photos[0].value;

        // Check if user already exists
        let user = await user.findOne({ googleId: id });
        if (!user) {
            // If user doesn't exist, create a new user
            user = new user({
                googleId: id,
                email: emails[0].value,
                name: displayName,
                avatar: photos[0].value
            });
            await user.save();
        }

        // Generate JWT token
        const token = jwt.sign({id: user._id, email: user.email}, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.cookie('token', token, { httpOnly: true });
        res.redirect('/dashboard'); // Redirect to dashboard or any other page
    } catch (error) {
        console.error("Error during Google authentication callback:", error);
        res.redirect('/login'); // Redirect to login on error
    }
});

export default router;