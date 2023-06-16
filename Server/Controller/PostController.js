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
    try {
      const post = await Post.findById(req.params.id);
      await Post.findByIdAndDelete(req.params.id);
      if (post.cloundinaryId) {
        await cloudinary.uploader.destroy(post.cloundinaryId);
      }
      return res.status(200).json("Deleted Post compeleted");
    } catch (error) {
      return res.status(500).json(error);
    }
  },
  //update the Post
  updatePost: async (req, res) => {
    try {
      const post = await Post.findById(req.params.id.trim());
      if (post.userId === req.body.userId) {
        await post.updateOne({ $set: req.body });
        res.status(200).json("Post has been updated");
      } else {
        res.status(403).json("You can only update your post");
      }
    } catch (err) {
      res.status(500).json(err);
    }
  },
  //LiKE AND DISLIKE FOR POST
  likeAndDislike: async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
      if (
        !post.upLike.includes(req.body.userId) &&
        post.dislike.includes(req.body.userId)
      ) {
        await post.updateOne({ $push: { upLike: req.body.userId } });
        await post.updateOne({ $pull: { dislike: req.body.userId } });
        await User.findOneAndUpdate(
          { _id: post.userId },
          { $inc: { karmas: 10 } }
        );
        return res.status(200).json("Post liked");
      } else if (
        !post.upLike.includes(req.body.userId) &&
        !post.dislike.includes(req.body.userId)
      ) {
        await post.updateOne({ $push: { upLike: req.body.userId } });
        await User.findByIdAndUpdate(req.body.userId);
        return res.status(200).json("Post is upvoted!");
      } else if (post.upLike.includes(req.body.userId)) {
        await post.updateOne({ $pull: { upLike: req.body.userId } });
        await User.findOneAndUpdate(
          { _id: post.userId },
          { $inc: { karmas: 10 } }
        );
        return res.status(200).json("Lose like because double click");
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json(error);
    }
  },
  disLikeAndLike: async (req, res) => {
    const { userId } = req.body;
    const post = await Post.findByIdAndUpdate(req.params.id);
    if (post.upLike.includes(userId) && !post.dislike.includes(userId)) {
      await post.updateOne({ $push: { dislike: userId } });
      await post.updateOne({ $pull: { uplike: userId } });
      await User.findByIdAndUpdate(
        { _id: post.userId },
        { $inc: { karmas: 10 } }
      );
      return res.status(200).json("DisLike successfull");
    } else if (
      !post.upLike.includes(userId) &&
      !post.dislike.includes(userId)
    ) {
      await post.updateOne({ $push: { dislike: userId } });
      await User.findByIdAndUpdate(
        { _id: post.userId },
        { $inc: { karmas: 10 } }
      );
      return res.status(200).json("DisLike successfull");
    } else if (post.dislike.includes(userId)) {
      await post.updateOne({ $pull: { dislike: userId } });
      await User.findOneAndUpdate(
        { _id: post.userId },
        { $inc: { karmas: 10 } }
      );
      return res.status(200).json("Lose dislike because double click");
    }
  },
};

module.exports = postController;
