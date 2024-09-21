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


exports.upload = multer({storage:storage})


exports.updateProfileUsers = async(req,res)=>{
    const {
        DateOfBirth,
        name,
      } = req.body;
    
      const id = req.params.id;
    
      // Vérifiez si un fichier a été téléchargé
      if (!req.file) {
        console.log('Aucun fichier téléchargé');
        req.session.message = "Erreur : Aucun fichier téléchargé";
        return res.redirect("/profile");
      }
    
      try {
        const user = await User.findById(id)
        if(!user){
                req.session.message = "veuillez vous reconnecté"
                return res.redirect("/login")
        }

        if(user.profilePicture && user.profilePicture !=="/images/profile-picture.jpg"){
                const publicId = user.profilePicture.split('/').pop().split('.')[0]
                await cloudinary.uploader.destroy(`maneSchool/${publicId}`)
        }
    
        // Téléchargez le fichier sur Cloudinary directement depuis la mémoire (buffer)
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
    
          
          User.findByIdAndUpdate(id, {
            name,
            DateOfBirth,
            profilePicture: result.secure_url,
          }).then(() => {
            console.log("Téléversement réussi");
            req.session.message = "Profile mis à jour avec succès";
            return res.redirect("/profile");
          }).catch((err) => {
            console.log("Erreur lors de la mise à jour du profil : ", err);
            req.session.message = "Une erreur est survenue, veuillez réessayer";
            return res.redirect("/profile");
          });
        });
    
      
        result.end(req.file.buffer);
    }
    catch(err){

        console.log("erreur au niveau de cacth");

        req.session.message = "une erreur ces produit veuiller ressayé"
        return res.redirect("/profile")
}

}


exports.UploadCourse=async(req,res,next)=>{
   const {name,
    description,
    categorie,
    thumbail,
    professeur,
    prix,
    typlogie,
    difficultyLevel,
    language} = req.body
    const id = req.user.id

    if(!name || !description || !prix || !thumbail){
      req.session.message = "veuillez renseigner tous les champs s'il vous plait"
      return res.redirect("/upload-course")
    }
    if(!req.file){
      req.session.message = "Erreur : l'image n'a pas été telecharger veuillez ressayer s'il vous plait"
      return
    }
    try{
      const user = await User.findById(id)
      if(!user){
        return res.redirect("/login")
      }
      const result = await cloudinary.uploader.upload_stream({
        folder: "maneSchool",
          allowed_formats: ['jpg', 'jpeg', 'png',  'avif', 'webp'],
          transformation: [
            { width: 800, height: 600, crop: "limit" },  // Limiter la taille à 500x500 pixels
            { quality: "auto:good" }  // Compression automatique pour maintenir une bonne qualité
          ]
      },(err,done)=>{
        if(err){
          req.session.message = "une erreur est survenue lors de la mise a jour de votre miniature ! veuillez ressayer"
          console.log(err);
          return
        }
        new Course({
          name,
          description,
          categorie,
          thumbail,
          professeur:user.id,
          prix,
          typlogie,
          difficultyLevel,
          language
        }).save().then(()=>{
          req.session.message =  "cours envoyer avec succes et en attente de validation"
          return
        }).catch(()=>{
          req.session.message =  "une erreur est survenue lors du téléversement du cours veuillez ressayer svp"
        })
      })
    
      result.end(req.file.buffer)
    }
    catch(err){
      req.session.message = "une erreur est survenu ! veuillez ressayer"
      console.log("err"+ err);
    }
}
