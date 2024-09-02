const passport = require('passport')
const GoogleStrtegy = require('passport-google-oauth20')
const User = require('../models/User') 
const dotenv = require('dotenv')

dotenv.config()

passport.use(new GoogleStrtegy({
    cliendID:process.env.ID_CLIENT,
    clientSecret: process.env.CLIENT_SECRET,
    callbackUrl : "http://localhost:3000/auth/google/callback"
}))

async(accessToken,refreshToken,profile,done)=>{
 try{
    let user = await User.findOne({googleId:profile.id})
    if(user){
        return done(null,user)
    }
    else{
        user= new user({
            googleId:profile.id,
            name:profile.displayName,
            email:profile.emails[0].value,
            role:'user'
        })
        await user.save()
        return done(null,user)
    }
}
catch(err){
console.log(err);
return done(eer)

}
}