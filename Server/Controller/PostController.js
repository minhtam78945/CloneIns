const Post = require("../models/PostModels");
const User = require("../models/userModels");
const cloudinary = require("../utils/cloudinary");
const postController = {
  createThePost: async (req, res) => {
    try {
      const user = await User.findById(req.body.userId);
      const file = req.file;
      if (file) {
        console.log("File controller ", file);
        const result = await cloudinary.uploader.upload(file.path, {
          resource_type: "image",
          upload_preset: "postOwner",
          folder: "post_user",
        });
        const makePost = {
          ...req.body,
          image: result.secure_url,
          cloundinaryId: result.public_id,
          username: user.username,
          avaUrl: user.profilePicture,
        };
        const newPost = new Post(makePost);
        const savedPost = await newPost.save();
        return res.status(200).json(savedPost);
      } else {
        const makePost = {
          ...req.body,
          username: user.username,
          avaUrl: user.profilePicture,
        };
        const newPost = new Post(makePost);
        const savedPost = await newPost.save();
        return res.status(200).json(savedPost);
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: error.message });
    }
  },
  //deleted The Post
  deletePost: async (req, res) => {
    
  },
};

module.exports = postController;
