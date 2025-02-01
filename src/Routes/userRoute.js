const express=require('express')
const { userAuth } = require('../middleware/auth');
const connectionRequest = require('../models/connectionRequest');
const user = require('../models/user');

const userRouter=express.Router()

userRouter.get('/user/connections',userAuth, async(req,res)=>{
    try {
        const loggedInUser=req.user;
        const connectionRequests = await connectionRequest.find({
            $or: [
              { toUserId: loggedInUser._id, status: "accepted" },
              { fromUserId: loggedInUser._id, status: "accepted" },
            ],
          })
            .populate("fromUserId",  ["firstName", "lastName", "about", "skills","age" ,"photoUrl"])
            .populate("toUserId",  ["firstName", "lastName", "about", "skills", "age","photoUrl"]);
      
          console.log(connectionRequests);
      
          const data = connectionRequests.map((row) => {
            if (row.fromUserId._id.toString() === loggedInUser._id.toString()) {
              return row.toUserId;
            }
            return row.fromUserId;
          });
      
          res.json({ data });
    } catch (error) {
        res.status(400).json({ message: `ERROR: ${error.message}` });
    }
})

userRouter.get('/user/requests/received',userAuth, async(req,res)=>{
    try {
        const loggedInUser=req.user;
        const connectRequests=await connectionRequest.find({toUserId:loggedInUser._id, status:'interested'}).populate("fromUserId", ["firstName", "lastName", "About", "skills", ])
    res.status(200).json({message:"connections Received successfully fetched", connectRequests})
    
    } catch (error) {
        res.status(400).json({ message: `ERROR: ${error.message}` });
    }
    

})


userRouter.get('/user/feed', userAuth, async(req,res)=>{
  try {
    const loggedInUser=req.user;
    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    limit = limit > 50 ? 50 : limit;
    const skip = (page - 1) * limit;

    const feed=await connectionRequest.find({$or:[
      {fromUserId: loggedInUser._id},
      {
        toUserId:loggedInUser._id
      }
    ]

    }).select("toUserId fromUserId")
    const hidenfromfeed=new Set();

    feed.forEach((req)=>{
      hidenfromfeed.add(req.toUserId.toString());
      hidenfromfeed.add(req.fromUserId.toString());
    })

    console.log(hidenfromfeed)

    const users = await user.find({
      $and: [
        { _id: { $nin: Array.from(hidenfromfeed) } },
        { _id: { $ne: loggedInUser._id } },
      ],
    }).select("firstName lastName about skills age gender photoUrl").skip(skip).limit(limit)

    res.send({data:users})
    
  } catch (error) {
    res.status(400).json({ message: `ERROR: ${error.message}` });
  }
})






module.exports=userRouter