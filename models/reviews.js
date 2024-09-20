const mongoose = require('mongoose')
const Schema = mongoose.Schema
const reviewsModel = new Schema({
    course:{type:Schema.Types.ObjectId, ref:"Course", required:true},
    user:{type:Schema.Types.ObjectId,required:true},
    comment :{type:String},
    rating:{type:Number,required:true}
})