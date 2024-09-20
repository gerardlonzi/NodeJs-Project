const mongoose = require("mongoose")

const Shema = mongoose.Schema 
const UserModels = new Shema(
    {
        googleId:{
            type:String,
        },
        name:{
            type:String,
            default:function(){
                return this.email.split('@')[0]
            }
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
            required:function(){
                return this.googleId ? false : true
            }
        },
        profilePicture:{
            type:String,
            default:function(){
                return this.googleId ? String : '/images/profile-picture.jpg'
            } 
        },
        DateOfBirth:{
            type:Date,
        },
        role:{
            type:String,
            default:"user",
            enum:["user","admin","professeur"]
        },
        emailVerified:{
            type:Boolean,
            default:function(){
                return this.googleId ? true : false
            }
        },
        emailVerifiedToken :{
            type:String
        },
        emailVerifiedTokenExpire :{
            type:Date
        },
        resetPasswordtoken:{
            type:String
        },
        resetPasswordtokenExpire:{
            type:Date
        },
        approved:{type:Boolean,default:false},
        purchaseCourse :[{type:Shema.Types.ObjectId,ref:"Course"}]

    },{timestamps:true}
)
const User = mongoose.model("Users",UserModels)

module.exports = User