const User = require("../models/userModels");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const roundSalt = 10;

const authController = {
  // REGISTER USER
  registerUser: async (req, res) => {
    if (req.body.password && req.body.password.length > 7) {
      try {
        const salt = await bcrypt.genSalt(roundSalt);
        const hashed = await bcrypt.hash(req.body.password, salt);

        // Create the User
        const newUser = new User({
          username: req.body.username,
          email: req.body.email,
          password: hashed,
        });

        const user = await newUser.save();
        res.status(200).json(user);
      } catch (error) {
        res.status(500).json(error.message);
      }
    } else {
      res.status(400).json("Invalid password");
    }
  },
  //Generate AccessToken
  generateAccessToken: (user) => {
    return jwt.sign(
      { id: user.id, isAdmin: user.isAdmin },
      process.env.JWT_KEY,
      { expiresIn: "20h" }
    );
  },
  //RefreshToken when user overtime accessToken
  generateRefereshTokem: (user) => {
    return jwt.sign(
      { id: user.id, isAdmin: user.isAdmin },
      process.env.JWT_KEY_REFRESHTOKEN,
      { expiresIn: "20h" }
    );
  },
  //Login user
  loginUser: async (req, res) => {
    try {
      const user = await User.findOne({ username: req.body.username }).select(
        "+password"
      );
      if (!user) return res.status(404).json({ message: "Incoret Password" });
      const vaildPassword = await bcrypt.compare(
        req.body.password,
        user.password
      );
      if (!vaildPassword)
        return res.status(404).json({ message: "Password not exist" });
      else if (user && vaildPassword) {
        // Generate AccessToken
        const accessToken = authController.generateAccessToken(user);
        //Generate RefereshToken
        const refereshToken = authController.generateRefereshTokem(user);
        res.cookie("rrefreshToken", refereshToken, {
          httpOnly: true,
          secure: true,
          path: "/",
          sameSite: "none",
        });
        const returnedUser = {
          ...user._doc,
          accessToken: accessToken,
        };
        res.status(200).json(returnedUser);
      }
    } catch (error) {
      res.status(500).json(error);
      console.log(error.message);
    }
  },
  logOutUser: async (req, res) => {
    res.status(200).json("Logged out successfully!");
    res.clearCookie("refreshToken");
  },
  //forgotPassword
  //ResetPassword
};

module.exports = authController;
