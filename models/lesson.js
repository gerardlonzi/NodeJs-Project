const mongoose = require("mongoose")
const Schema = mongoose.Schema

const lessonsModel = new Schema({
    chapitreName  :{type:String},
    description  :{type:String},
    title:{type:String,required:true},
    fileType:{type:String,enum:['audio','video','text'] , required:true},
    fileUrl :{ type:String},
    comments :[{
        user:{type:Schema.Types.ObjectId,ref:"Users"},
        comment:{type:String},
        createAt:{type:Date, default:Date.now()}
    }]
})

const Lessons = mongoose.model('Lessons',lessonsModel)
module.exports = Lessons