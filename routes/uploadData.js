const express = require('express')
const { upload, updateProfileUsers } = require('../controllers/UploadData')
const profileRouter = express.Router()


profileRouter.put("/profile/update_profile/:id",upload.single("profilePicture"),updateProfileUsers)

module.exports = profileRouter