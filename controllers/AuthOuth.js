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
        let userByEmail = await User.findOne({ email: profile.emails[0].value })
        if(userByEmail && !userByEmail.googleId){
            return done( null,false,{redirect_url:"/login?error=vous devez vous connectez par email et password comme la prémiere fois"})
        }
        let user = await User.findOne({ googleId: profile.id })
        if (user) {
            
            return done(null, user)
        }
        else {
            user = new User({
                googleId: profile.id,
                name: profile.displayName,
                email: profile.emails[0].value,
                profilePicture:profile.photos[0].value,
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
const userIdentify = {id:user.id,role:user.role}
    return done(null,userIdentify)
})

passport.deserializeUser(async (userIdentify, done) => {
    try {
        const user = await User.findById(userIdentify.id);
        done(null, user)
    }
    catch (err) {
        return done(err, null)
    }
})

module.exports = passport