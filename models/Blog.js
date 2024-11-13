const mongoose = require('mongoose')
const slugify = require('slugify')

const Schema = mongoose.Schema
const BlogModel = new Schema({
    title:{
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
    date:{type:Date,default:new Date()}

},{timestamps:true})

BlogModel.pre('save',async function(next) {
    if(this.isModified('title') || this.isNew){
        let baseUrl = slugify(this.title,{lower:true,strict:true})
        let unique_slug = baseUrl
        let count = 1 
        while(await Blog.exists({slug:unique_slug})){
            unique_slug = `${baseUrl}-${count}`
            count++
        }
        this.slug= unique_slug
    }
    next()
})

const Blog = mongoose.model("Blog",BlogModel)
module.exports = Blog