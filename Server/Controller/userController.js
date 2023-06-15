const PostModels = require("../models/PostModels");
const User = require("../models/userModels");
const authController = require("./authController");
const bcrypt = require("bcrypt");
const { generateAccessToken } = require("./authController");
const userController = {
  // get  user
  getUser: async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      return res.status(200).json(user);
    } catch (error) {
      return res.status(500).json(error);
    }
  },
  //deleted User
  deleteUser: async (req, res) => {
    try {
      if (req.body.userId === req.params.id) {
        await User.findByIdAndDelete(req.params.id);
        return res.status(200).json("Deleted User Successfull");
      }
    } catch (error) {
      return res.status(500).json(error);
    }
  },
  updateUser: async (req, res) => {
    if (req.body.password) {
      try {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
      } catch (err) {
        return res.status(500).json(err);
      }
    }
    try {
      const user = await User.findByIdAndUpdate(
        req.params.id.trim(),
        {
          $set: req.body,
        },
        {
          returnDocument: "after",
        },
        (err, docs) => {
          if (err) return res.status(403).json("Update fail");
          else console.log("update user compeleted");
        }
      );
      const accessToken = await authController.generateAccessToken(user);
      const returnUser = {
        ...user._doc,
        accessToken: accessToken,
      };
      return res.status(200).json(returnUser);
    } catch (error) {
      return res.status(200).json(error);
    }
  },
  //Search user
  searchAllUser: async (req, res) => {
    try {
      const username = req.query.username.toLowerCase();
      const user = await User.find({
        username: { $regex: username },
      })
        .limit(5)
        .select("username")
        .exec();
      if (user.length === 0) {
        return res.status(403).json("Not found user");
      }
      return res.status(200).json(user);
    } catch (error) {
      console.log(error);
      return res.status(500).json(error);
    }
  },
  //Followr User
  followUser: async (req, res) => {
    if (req.body.userId !== req.params.id) {
      try {
        const user = await User.findById(req.params.id);
        if (!user.followers.includes(req.body.userId)) {
          await User.findByIdAndUpdate(req.params.id, {
            $push: { followers: req.body.userId },
          });
          const updaeUserFollower = await User.findByIdAndUpdate(
            req.body.userId,
            {
              $push: { followings: req.params.id },
            },
            {
              returnDocument: "after",
            }
          );
          return res.status(200).json(updaeUserFollower);
        } else {
          await User.findByIdAndUpdate(req.params.id, {
            $pull: { followers: req.body.userId },
          });
          const updateUser = await User.findByIdAndUpdate(
            req.body.userId,
            {
              $pull: { followings: req.params.id },
            },
            { returnDocument: "after" }
          );
          return res.status(200).json(updateUser);
        }
      } catch (error) {
        console.log(error);
        return res.status(500).json(error);
      }
    } else {
      console.log("You can not follow yourself");
    }
  },
};
module.exports = userController;
