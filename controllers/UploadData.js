const multer = require("multer")
const storage = multer.memoryStorage()
// const {CloudinaryStorage}= require("multer-storage-cloudinary")
const cloudinary = require("../config/cloudinary")
const User = require('../models/User')
const Course = require("../models/Course")


// const storage = new CloudinaryStorage({
//     cloudinary:cloudinary,
//     params:{
//     folder:"maneSchool",
//     allowed_formats : ['jpg','jpeg','png','mp4','mp3','avif','webp']
//     }
// })


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
      req.session.message = "veuillez vous reconnecté"
      return res.redirect("/login")
    }
    if(!req.file){
      name && (user.name=name);
      DateOfBirth && (user.DateOfBirth = DateOfBirth),
      aboutYou && (user.aboutYou= aboutYou)
      
      user.save()
        console.log("Téléversement réussi");
        req.session.message = "Profile mis à jour avec succès";
        return res.redirect("/profile");
      
    }

    if (user.profilePicture && user.profilePicture !== "/images/profile-picture.jpg") {
      const publicId = user.profilePicture.split('/').pop().split('.')[0]
      await cloudinary.uploader.destroy(`maneSchool/${publicId}`)
    }

    name && (user.name=name);
    DateOfBirth && (user.DateOfBirth = DateOfBirth),
    aboutYou && (user.aboutYou= aboutYou)

    const result = await cloudinary.uploader.upload_stream({
      folder: "maneSchool",
      allowed_formats: ['jpg', 'jpeg', 'png', 'mp4', 'mp3', 'avif', 'webp'],
      transformation: [
        { width: 800, height: 600, crop: "limit" },  // Limiter la taille à 500x500 pixels
        { quality: "auto:good" }  // Compression automatique pour maintenir une bonne qualité
      ]

    }, (error, result) => {
      if (error) {
        console.log("Erreur lors de l'upload vers Cloudinary : ", error);
        req.session.message = "Une erreur est survenue lors du téléversement";
        return res.redirect("/profile");
      }

      user.profilePicture = result.secure_url
       
      user.save()
        console.log("Téléversement réussi");
        req.session.message = "Profile mis à jour avec succès";
        return res.redirect("/profile");
     
    });


    result.end(req.file.buffer);
  }
  catch (err) {

    console.log("erreur au niveau de cacth"+JSON.stringify(err));

    req.session.message = "une erreur ces produit veuiller ressayé"
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
  console.log("req  user"+req.user);

  if (!name || !description || !prix  || !courseTime  || !categorie || !typologie || ! difficultyLevel || !language ) {
    req.session.message = {
      message: "veuillez renseigner tous les champs s'il vous plait",
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
  console.log("req file"+req.file);
  
  if(!req.file) {
    console.log("request file est null");
    req.session.message ={message: "Erreur : l'image ou la video n'a pas été telecharger veuillez ressayer s'il vous plait"}
    return res.redirect("/upload-course")

  }

  try {
    
    const user = await User.findById(id)
    

    if (!user || user.role!=="professeur") {
      return res.redirect("/login")
    }
  
  
    const result = cloudinary.uploader.upload_stream({
      folder: "maneSchool",
      allowed_formats: ['jpg', 'jpeg', 'png', 'avif', 'webp','mp4'],
      transformation: [
        { width: 800, height: 600, crop: "limit" },  // Limiter la taille à 500x500 pixels
        { quality: "auto:good" }  // Compression automatique pour maintenir une bonne qualité
      ]
    },async(err, url) => {
      

      if (err) {
        req.session.message ={message:"une erreur est survenue lors de la mise a jour de votre miniature ! veuillez ressayer"}
        console.log(err);
        return res.redirect("/upload-course")

      }
     const course =  new Course({
        name,
        description,
        categorie,
        thumbail:url.secure_url,
        user: user._id,
        prix,
        typologie,
        difficultyLevel,
        language,
        courseTime
      })
      try {
        await course.save();
        req.session.message = {
          message: "Cours publié avec succès et en cours de traitement"
        };    
        return res.redirect("/profile");
      } catch (err) {
        req.session.message = {
          message: "Une erreur est survenue lors du téléversement du cours. Veuillez réessayer."
        };
        console.log("Erreur lors de la sauvegarde du cours : ", err);
        return res.redirect("/upload-course");
      }
    })

    result.end(req.file.buffer)
  }
  catch (err) {
  
    req.session.message = {message:"une erreur est survenu ! veuillez ressayer"}
    console.log("err" + err);
    return res.redirect("/upload-course");
  }
}
