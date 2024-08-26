const mongoose = require("mongoose")
const UserModels = new mongoose.Schema(
    {
        googleId:{
            type:String,
        },
        name:{
            type:String
        },
        email:{
            type:String,
            required:true,
            unique:true
        },
        onboardingIsCompleted:{
            type:Boolean,
            default:false
        },
        password:{
            type:String,
            required:true
        },
        profilePicture:{
            type:String
        },
        DateOfBirth:{
            type:Date,
        },
        role:{
            type:String,
            default:"user",
            enum:["user","admin"]
        },
        emailVerified:{
            type:Boolean,
            default:function(){
                return this.googleId ? true : false
            }
        },
        rest_token:{
            type:String
        },
        expire_token:{
            type:Date
        }

    },{timestamps:true}
)
const User = mongoose.model("Users",UserModels)

module.exports = User