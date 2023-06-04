const User = require("../models/userModels");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const roundSalt = 10;
const sendMail = require("../utils/mail");

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
  forgotPassword: async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.staus(403).json("Missing Email");
      }
      const user = await User.findOne({ email });
      console.log(user);
      if (!user) {
        return res.staus(403).json("Not found user");
      }
      const resetToken = jwt.sign(
        { id: user.id, isAdmin: user.isAdmin },
        process.env.JWT_KEY,
        {
          expiresIn: "1h",
        }
      );

      await user.save();
      const resetPasswordLink = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
      const html = `
      <h2>Password Reset</h2>
      <p>Hi ${user.username},</p>
      <p>You have requested to reset your password. Click on the link below to reset your password:</p>
      <a href="${resetPasswordLink}">${resetPasswordLink}</a>
      <p>If you did not request this, please ignore this email.</p>
    `;
      const mailOptions = {
        email: email,
        html,
      };
      const rs = await sendMail(mailOptions);
      return res.status(200).json({
        success: true,
        rs,
      });
    } catch (error) {
      return res.status(500).json(error);
    }
  },
  //ResetPassword
};

module.exports = authController;
