const multer = require("multer")
const storage = multer.memoryStorage()
const cloudinary = require("../config/cloudinary")
const User = require('../models/User')
const Course = require("../models/Course")
const Blog = require("../models/Blog")
const sharp = require("sharp")


exports.upload = multer({ storage: storage })


exports.updateProfileUsers = async (req, res) => {
  const {
    DateOfBirth,
    name,
    aboutYou
  } = req.body;

  const id = req.params.id;
console.log("req.file"+req.file);


  try {
    const user = await User.findById(id)

    
    if (!user) {
      req.session.message ={error:"veuillez vous reconnecté"}
      return res.redirect("/login")
    }
    name && (user.name=name);
      DateOfBirth && (user.DateOfBirth = DateOfBirth),
      aboutYou && (user.aboutYou= aboutYou)
      
    if(!req.file){
      
      user.save()
        console.log("Téléversement réussi");
        req.session.message ={success:"Profile mis à jour avec succès"}
        return res.redirect("/profile");
      
    }

    if (user.profilePicture && user.profilePicture !== "/images/profile-picture.jpg") {
      const publicId = user.profilePicture.split('/').pop().split('.')[0]
      await cloudinary.uploader.destroy(`maneSchool/${publicId}`)
    }

    const imageConverter = await sharp(req.file.buffer).webp().toBuffer()
    const result = await cloudinary.uploader.upload_stream({
      folder: "maneSchool",
      allowed_formats: ['jpg', 'jpeg', 'png', 'avif', 'webp'],
      transformation: [
        { width: 800, height: 600, crop: "limit" },  
        { quality: "auto:good" } 
      ]

    }, (error, result) => {
      if (error) {
        req.session.message = {error:"Une erreur est survenue lors du téléversement"}
        return res.redirect("/profile");
      }

      user.profilePicture = result.secure_url
       
      user.save()
        req.session.message ={success:"Profile mis à jour avec succès"}
        return res.redirect("/profile");
     
    });


    result.end(imageConverter);
  }
  catch (err) {
    req.session.message ={error:"une erreur ces produit veuiller ressayé"}
    return res.redirect("/profile")
  }

}


exports.UploadCourse = async(req, res) => {
  const { name,
    courseTime,
    description,
    categorie,
    user,
    prix,
    thumbail,
    typologie,
    difficultyLevel,
    language } = req.body
  const id = req.user.id

  if (!name || !description || !prix  || !courseTime  || !categorie || !typologie || ! difficultyLevel || !language ) {
    req.session.message = {
      error: "veuillez renseigner tous les champs s'il vous plait",
      data: {
        name,
        thumbail:thumbail || "",
         description,
         categorie,
         user,
         prix,
         typologie,
         difficultyLevel,
         language,
         courseTime
      }

    }
    return res.redirect("/upload-course")
  }
  if(!req.file) {
    req.session.message ={error: "Erreur : l'image ou la video n'a pas été telecharger veuillez ressayer s'il vous plait"}
    return res.redirect("/upload-course")

  }

  try {
    
    const user = await User.findById(id)
    

    if (!user || user.role!=="professeur") {
      return res.redirect("/login")
    }
  
    const imageConverter = await sharp(req.file.buffer).webp().toBuffer()
    const result = cloudinary.uploader.upload_stream({
      folder: "maneSchool",
      allowed_formats: ['jpg', 'jpeg', 'png', 'avif', 'webp','mp4','heic'],
      transformation: [
        { width: 800, height: 600, crop: "limit" },  // Limiter la taille à 500x500 pixels
        { quality: "auto:good" }  // Compression automatique pour maintenir une bonne qualité
      ]
    },async(err, url) => {
      

      if (err) {
        req.session.message ={error:"une erreur est survenue lors de la mise a jour de votre miniature ! veuillez ressayer"}
        return res.redirect("/upload-course")

      }
     const course =  new Course({
        name,
        description,
        categorie,
        thumbail:url.secure_url,
        user: user._id,
        prix:prix.replace(/[a-zA-Z]/g, ''),
        typologie,
        difficultyLevel,
        language,
        courseTime:courseTime.replace(/[a-zA-Z]/g, '')
      })
      try {
        await course.save();
        req.session.message = {
          success: "Cours publié avec succès et en cours de traitement"
        };    
        return res.redirect("/profile");
      } catch (err) {
        req.session.message = {
          error: "Une erreur est survenue lors du téléversement du cours. Veuillez réessayer."
        };
        return res.redirect("/upload-course");
      }
    })

    result.end(imageConverter)
  }
  catch (err) {
  
    req.session.message = {error:"une erreur est survenu ! veuillez ressayer"}
    return res.redirect("/upload-course");
  }
}

exports.updateCourse = async(req,res)=>{
const {name,
  description,
  categorie,
  prix,
  typologie,
  difficultyLevel,
  language,
  courseTime} = req.body
  const slug = req.params.slug

  if(!name || !description|| !categorie|| !prix || !typologie|| !difficultyLevel||!language|| !courseTime){
    
    req.session.message = 'aucun champs ne doit être vide'
    return res.redirect( `/cours/${slug}`)
  }

  try{

    const user = await User.findById(req.user.id)
    if(!user && (user.role!=='professeur' || user.role!=='admin')){
      req.session.message={error:"veuillez vous connectez"}
      return res.redirect("/login")
    }
    else{

      const course = await Course.findOne({slug:slug})
      if(!course){
        req.session.message={error:"ce cours n'existe pas"}
        return res.redirect('/profile')
      }

      name !== course.name && (course.name = name)
        description !== course.description && (course.description = description)
        categorie !== course.categorie && (course.categorie = categorie)
        prix !== course.prix && (course.prix = prix.replace(/[a-zA-Z]/g, ''))
        typologie !== course.typologie && (course.typologie = typologie)
        difficultyLevel !== course.difficultyLevel && (course.difficultyLevel = difficultyLevel)
        language !== course.language && (course.language = language)
        courseTime !== course.courseTime && (course.courseTime = courseTime.replace(/[a-zA-Z]/g, ''))

      if(!req.file){
        await course.save()
        return res.redirect(`/cours/${slug}`)
       
      }
      if(req.file){

           const image_cloudId = course.thumbail.split('/').pop().split('.')[0]
           await cloudinary.uploader.destroy(`maneSchool/${image_cloudId}`)
           const imageConverter = await sharp(req.file.buffer).webp().toBuffer()
           const result = await cloudinary.uploader.upload_stream({
            folder: "maneSchool",
            allowed_formats: ['jpg', 'jpeg', 'png', 'avif', 'webp'],
            transformation: [
              { width: 800, height: 600, crop: "limit" },  // Limiter la taille à 500x500 pixels
              { quality: "auto:good" }  // Compression automatique pour maintenir une bonne qualité
            ]
      
          }, (error, result) => {
            if (error) {

              req.session.message ={error:"Une erreur est survenue lors du téléversement"}
              return res.redirect(`/cours/${slug}`);
            }
      
            course.thumbail = result.secure_url

            course.save()
              req.session.message ={success:"cours mis à jour avec succès"}
              return res.redirect(`/cours/${slug}`);
           
          });
          result.end(imageConverter)
    }

  }
}

catch(err){
  req.session.message ={error:"une erreur survenue veuillez ressayer"}
  return res.redirect(`/cours/${slug}`)

}
}



exports.DeleteCourse = async(req,res)=>{
  const slug = req.params.slug

  if(!req.user){
    req.session.message ={error:'veuillez vous connectez'}
    return res.redirect('/login')
  }

  try{
    const user = await User.findById(req.user.id)
    if(!user){
      req.session.message ={error:'veuillez vous connectez'}
      return res.redirect(`/cours/${slug}`)
    }
     const course = await Course.findOneAndDelete({slug})
     const id_cloudImage = course.thumbail.split("/").pop().split(".")[0]
      await cloudinary.uploader.destroy(`maneSchool/${id_cloudImage}`)
      req.session.message = {
        success: "Cours supprimer avec success"
      }

      return res.redirect(`/profile`)
  }
  catch(err){
    req.session.message ={error: 'une erreur ces produit veuillez ressayer'}
    return res.redirect(`/cours/${slug}`)
}

}

//blog

exports.UploadBlog = async(req, res) => {
  console.log("hello world")
  const { title,
    description,
    categorie,
    thumbail,
     } = req.body
  
console.log(req.body);

  if (!title || !description   || !categorie ) {
    req.session.message = {
      error: "veuillez renseigner tous les champs s'il vous plait",
      data: {
        title,
        thumbail:thumbail || "",
         description,
         categorie
      }

    }
    return res.redirect("/blog/create-blog")
  }
  if(!req.file) {
    req.session.message ={error: "Erreur : l'image ou la video n'a pas été telecharger veuillez ressayer s'il vous plait"}
    return res.redirect("/blog/create-blog")

  }
  let user
  try {
    if( req.user && req.user.id !=='undefined'){
       user = await User.findById(req.user.id)
       if (!user || user.role!=="admin") {
        return res.redirect("/login")
      }
    
    }
  const imageConverter = await sharp(req.file.buffer).webp().toBuffer()

    const result = cloudinary.uploader.upload_stream({
      folder: "maneSchool",
      allowed_formats: ['jpg', 'jpeg', 'png', 'avif', 'webp','mp4','heic'],
      transformation: [
        { width: 800, height: 600, crop: "limit" },  
        { quality: "auto:good" }  
      ]
    },async(err, url) => {
      

      if (err) {
        req.session.message ={error:"une erreur est survenue lors de la mise a jour de votre miniature ! veuillez ressayer"}
        return res.redirect("/blog/create-blog")

      }
     const blog =  new Blog({
        title,
        description,
        categorie,
        thumbail:url.secure_url,
        user: user._id,
        date: new Date()
    })
        blog.save();
        req.session.message = {
          success: "Cours publié avec succès et en cours de traitement"
        }
  
        return res.redirect("/blog");
      
    })

    result.end(imageConverter)
  }
  catch (err) {
  
    req.session.message = {error:"une erreur est survenu ! veuillez ressayer"}
    return res.redirect("/blog/create-blog");
  }
}

exports.updateBlog = async(req,res)=>{
  const {title,
    description,
    categorie} = req.body
    const slug = req.params.slug
  
    if(!title || !description|| !categorie){
      req.session.message = 'Veuillez renseigner tous les champs'
      return res.redirect( `/blog/${slug}`)
    }
  
    try{
      const user = await User.findById(req.user.id)
      if(!user ||  user.role!=='admin'){
        req.session.message={error:"veuillez vous connectez"}
        return res.redirect("/login")
      }
      else{
        const blog = await Blog.findOne({slug:slug})
        if(!blog){
          req.session.message={error:"ce blog n'existe pas"}
          return res.redirect(`/blog/${slug}`)
        }
  
        title !== blog.title && (blog.title = title)
          description !== blog.description && (blog.description = description)
          categorie !== blog.categorie && (blog.categorie = categorie)
          
  
        if(!req.file){
          await blog.save()

          return res.redirect(`/blog/${slug}`)
         
        }
        if(req.file){
             const image_cloudId = blog.thumbail.split('/').pop().split('.')[0]
             await cloudinary.uploader.destroy(`maneSchool/${image_cloudId}`)
             const imageConverter = await sharp(req.file.buffer).webp().toBuffer()
             const result = await cloudinary.uploader.upload_stream({
              folder: "maneSchool",
              allowed_formats: ['jpg', 'jpeg', 'png', 'avif', 'webp'],
              transformation: [
                { width: 800, height: 600, crop: "limit" },  // Limiter la taille à 500x500 pixels
                { quality: "auto:good" }  // Compression automatique pour maintenir une bonne qualité
              ]
        
            }, (error, result) => {
              if (error) {
                req.session.message ={error: "Une erreur est survenue lors du téléversement"}

                return res.redirect(`blog/${slug}`);
              }
        
              blog.thumbail = result.secure_url
               
              blog.save()
                req.session.message ={success: "blog mis à jour avec succès"}
                return res.redirect(`/blog/${slug}`);

            });
            result.end(imageConverter)
      }
  
    }
  }
  
  catch(err){
    req.session.message ={error: 'une erreur survenue veuillez ressayer'}

    return res.redirect(`/blog/${slug}`)
  
  }
  }
  
  
  
  exports.DeleteBlog = async(req,res)=>{
    const slug = req.params.slug
  
    if(!req.user){
      req.session.message ={error: 'veuillez vous connectez'}
      return res.redirect('/login')
    }
  
    try{
      const user = await User.findById(req.user.id)
      if(!user ||  user.role!=='admin'){
        req.session.message ={error: 'veuillez vous connectez'}
        return res.redirect(`/blog/${slug}`)
      }
       const blog = await Blog.findOneAndDelete({slug})
       const id_cloudImage = blog.thumbail.split("/").pop().split(".")[0]
        await cloudinary.uploader.destroy(`maneSchool/${id_cloudImage}`)
        return res.redirect(`/blog`)
    }
    catch(err){
      req.session.message ={error: 'une erreur ces produit veuillez ressaye'}
      return res.redirect(`/blog/${slug}`)
  }
  
  }
  
