const mongoose = require('mongoose')
const slugify = require('slugify')

const Schema = mongoose.Schema
const BlogModel = new Schema({
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
    Date:{type:Date}

})

BlogModel.pre('save',async function(next) {
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

const Blog = mongoose.model("Course",BlogModel)
module.exports = Blog