const mongoose = require('mongoose')
const slugify = require('slugify')

const Schema = mongoose.Schema
const CourseModel = new Schema({
    name:{
        type:String,required:true
    },
    slug:{type:String,unique:true},
    description:{
        type:String,
        required:true
    },
    categorie:{
        type:String,
        required:true
    },
    thumbail:{
            type:String,
            required : true
    },
    user:{type:Schema.Types.ObjectId,ref:"Users",required:true},
    prix :{type:Number , required:true},
    promotion :{
        discount:{type:Number,default:0},
        free : {type:Boolean, default:false}
    },
    lessons:[{type:Schema.Types.ObjectId , ref:"Lessons"}],
    averageRating:{type:Number, default:0},
    totalRating:{type:Number, default:0},
    typologie:{type:String, default:"Premium"},
    difficultyLevel:{type:String},
    language :{type:String,default:"Français"},
    approved :{type:String , default:'wait',enum:['no','yes','wait']},
    review :[{type:Schema.Types.ObjectId , ref:"Reviews"}],
    courseTime: {type:String, required:true},
    coursePresentiel: {type:String, required:true},

})

CourseModel.pre('save',async function(next) {
    if(this.isModified('name') || this.isNew){
        let baseUrl = slugify(this.name,{lower:true,strict:true})
        let unique_slug = baseUrl
        let count = 1 
        while(await Course.exists({slug:unique_slug})){
            unique_slug = `${baseUrl}-${count}`
            count++
        }
        this.slug= unique_slug
    }
    next()
})

const Course = mongoose.model("Course",CourseModel)
module.exports = Course