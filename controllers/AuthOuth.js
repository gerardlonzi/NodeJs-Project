const passport = require('passport')
const GoogleStrtegy = require('passport-google-oauth20').Strategy
const User = require('../models/User')
const dotenv = require('dotenv')

dotenv.config()

passport.use(new GoogleStrtegy({
    clientID: process.env.ID_CLIENT,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:5000/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await User.findOne({ googleId: profile.id })
        if (user) {
            return done(null, user)
        }
        else {
            user = new user({
                googleId: profile.id,
                name: profile.displayName,
                email: profile.emails[0].value,
                role: 'user'
            })
            await user.save()
            return done(null, user)
        }
    }
    catch (err) {
        console.log(err);
        return done(err, null)

    }


}
))

passport.serializeUser((user, done) => {
    return done(null, user.id)
})

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findOne(id);
        done(null, user)
    }
    catch (err) {
        return done(err, null)
    }
})

module.exports = passport