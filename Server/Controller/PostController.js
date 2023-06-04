const Post = require("../models/PostModels");
const User = require("../models/userModels");
const cloudianry = require("../utils/cloudinary");
const fs = require("fs");
const postController = {
  //CREATE A POST
  createThePost: async (req, res) => {
    try {
      const { userId, image } = req.body;
      const user = await User.findById(userId);
      if (image) {
        const reuslt = await cloudianry.uploader.upload(image, {
          upload_preset: "postOwner",
        });
        const makePost = {
          ...req.body,
          imageUrl: reuslt.secure_url,
          cloudinaryId: reuslt.public_id,
          username: user.username,
          avaUrl: user.profilePicture,
        };
        const newPost = new Post(makePost);
        const savePost = await newPost.save();
        return res.status(200).json(savePost);
      } else {
        const makePost = {
          ...req.body,
          username: user.username,
          avaUrl: user.profilePicture,
        };
        const newPost = new Post(makePost);
        const savePost = await newPost.save();
        return res.status(200).json(savePost);
      }
    } catch (error) {
      console.log(error);
      return res.status(200).json({ message: error });
    }
  },
};
module.exports = postController;
