import express from "express";
import Users from "../models/Users.js";
import jwt from 'jsonwebtoken';
import zod from 'zod';
import bcrypt from 'bcrypt';
import { OAuth2Client } from "google-auth-library";
import authMiddleware from "../middlewares/authMiddleware.js";
const client=new OAuth2Client();

const UserRouter = express.Router();

const signupSchema = zod.object({
  userName: zod.string().email(),
  password: zod.string(),
  firstName: zod.string(),
  lastName: zod.string()

})

UserRouter.post("/signup", async (req, res) => {
  const { userName, password, firstName, lastName } = req.body;
  try {
    const { success } = signupSchema.safeParse(req.body);
    if (!success)
      return res.status(401).json({ message: 'invalid credentials' });
    const existingUser = await Users.findOne({ userName: userName });
    if (existingUser)
      return res.status(400).json({ message: 'User already exists' });
    const newUser = new Users({
      userName,
      password,
      firstName,
      lastName
    });
    const response = await newUser.save();
    console.log(response);
    if (response) {
      const token = jwt.sign({
        userId: response._id

      }, process.env.JWT_SECRET);
      return res.status(201).json({
        token: token,
        message: 'user created Successfully'
      })
    }
    return res.status(401).json({ message: 'request failed' });

  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: 'request failed' });
  }

});

const signinbody=zod.object({
  userName:zod.string().email(),
  password:zod.string()
});

UserRouter.post("/signin", async (req, res) => {
  const { userName, password } = req.body;
  const {success}=signinbody.safeParse(req.body);
  if(!success)
    return res.status(402).json({message:"invalid credentails"});
  try {
    const existingUser = await Users.findOne({ userName: userName });
    if (!existingUser)
      return res.status(400).json({ message: 'User Doesnt exist ' });
    const passwordMatch=await bcrypt.compare(password,existingUser.password);
    if(!passwordMatch)
      return res.status(401).json({message:'password doesnt match/ wrong credentails'});

    const token = jwt.sign({ userId: existingUser._id }, process.env.JWT_SECRET);

    return res.status(201).json({
      token: token,
      message: 'user SignedIn Successfully'
    });

  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: 'request failed' });
  }

});

UserRouter.post("/google-signin",async(req,res)=>{
  const token=req.body.token;
  console.log(token);
  try {
    const ticket=await client.verifyIdToken({
      idToken:token,
      audience:process.env.GOOGLE_CLIENT_ID
    });
    const payload=ticket.getPayload();
    const googleId=payload['sub'];
    const userName=payload['email'];
    const firstName=payload['given_name'];
    const lastName=payload['family_name'];
    const picture=payload['picture'];

    let user=await Users.findOne({userName:userName});
    if(!user){
      user=await Users.create({
        userName,
        firstName,
        lastName,
        googleId:googleId,
        picture: picture
      });
    }
    const jwtToken=jwt.sign({
      userId:user._id
    },process.env.JWT_SECRET);
    return res.status(200).json({messsage:'signed in successfully with google',
      token:jwtToken,
      imageUrl:picture
    });
    
  } catch (error) {
    console.error("Google Sign-In Error:", error);
    res.status(400).json({ message: "Invalid Google token" });
  }

});

//get details of user using the site "me"
UserRouter.get("/me",authMiddleware,async(req,res)=>{
     const userId=req.userId;
     try {
      //retrieving all details except password
      const user=await Users.findById(userId).select('-password');
      if(!user)
        return res.status(401).json({message:'Error occured'});
      console.log(user);
      return res.json(user);
      
     } catch (error) {
       console.error(error);
       return res.status(401).json({message:'Error occured'});
     } 
})

// updating details of user
UserRouter.patch("/me",authMiddleware,async(req,res)=>{
       const userId=req.userId;
       const {firstName,lastName,password}=req.body;
       try {
        const updateUser=await Users.findByIdAndUpdate(userId,req.body,{new:true});
        if(!updateUser)
          return res.status(401).json({message:'User details not updated'});
        return res.status(200).json({
          message:'details updated successfully',
          details:updateUser
        });
       } catch (error) {
        console.error(error);
       return res.status(401).json({message:'Error occured'});
       }
});


export default UserRouter;