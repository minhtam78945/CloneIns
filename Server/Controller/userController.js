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
      return res.status(500).json(err);
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
};
module.exports = userController;
