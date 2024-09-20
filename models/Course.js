const mongoose = require('mongoose')


const Schema = mongoose.Schema
const CourseModel = new Schema({
    name:{
        type:String,required:true
    },
    description:{
        type:String,
    },
    categorie:{
        type:String,
        required:true
    },
    thumbail:{
            type:String,
            required : true
    },
    professeur:{type:Schema.Types.ObjectId,ref:"Users",required:true},
    prix :{type:Number , required:true},
    promotion :{
        discount:{type:Number,default:0},
        free : {type:Boolean, default:false}
    },
    lessons:{type:Schema.Types.ObjectId , ref:"Lessons",required:true},
    averageRating:{type:Number, default:0},
    totalRating:{type:Number, default:0}


})

const Course = mongoose.model("Course",CourseModel)
module.exports = Course