const user=require("../models/user.js")
const express=require("express")
const {userAuth}=require('../middleware/auth.js')
const bcrypt=require('bcrypt')
const {validateEditProfileData}=require('../utils/validation')

const ProfileRouter=express.Router();

ProfileRouter.get('/profile/view',userAuth,async (req,res)=>{
    try {
        const user=req.user;
        res.status(200).json({success:true,user:user})
    } catch (error) {
        res.status(401).send("ERROR : " + error.message);
    }

})
ProfileRouter.patch('/profile/edit', userAuth, async (req, res) => {
    try {
      if (!validateEditProfileData(req)) {
        throw new Error("Invalid edit request");
      }
  
      const loggedInUser = req.user;
     console.log(req.body.skills)
      
      const updatedUser = await user.findByIdAndUpdate(
        loggedInUser._id,
        req.body, 
        { new: true, runValidators: true }
      ); 
  
      if (!updatedUser) {
        throw new Error("User not found");
      }
  
      res.json({
        message: `${updatedUser.firstName}, your profile was updated successfully`,
        data: updatedUser,
      });
    } catch (error) {
      res.status(400).send("ERROR : " + error.message);
    }
  });
  ProfileRouter.patch('/profile/password', userAuth, async (req, res) => {
    try {
      const loggedInUser = req.user;
      const newPass = req.body.password;
  
    
      const newhashPass = await bcrypt.hash(newPass, 10);
  
     
      const updateuser = await user.findById(loggedInUser._id);
  
      if (!updateuser) {
        throw new Error("User not found");
      }
  
      
      updateuser.password = newhashPass;
  
    
      await updateuser.save();
  
      
      res.json({
        message: `${updateuser.firstName}, your password was updated successfully`,
        data: updateuser,
      });
  
    } catch (error) {
      // Send an error response if something goes wrong
      res.status(400).json({ message: "ERROR: " + error.message });
    }
  });
  
  
  

module.exports =ProfileRouter