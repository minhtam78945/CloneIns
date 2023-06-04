const User = require("../models/userModels");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const roundSalt = 10;
const sendMail = require("../utils/mail");
const generateVerificationCode = () => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const codeLength = 6; // Length of the verification code
  let verificationCode = "";

  for (let i = 0; i < codeLength; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    verificationCode += characters.charAt(randomIndex);
  }

  return verificationCode;
};

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
        return res.status(403).json("Missing Email");
      }
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(403).json("User not found");
      }
      const verificationCode = generateVerificationCode();
      user.verificationCode = verificationCode;
      const returnUser = await user.save();
      console.log("Return User : ", returnUser);
      const resetPasswordLink = `${process.env.CLIENT_URL}/reset-password?code=${verificationCode}`;
      const html = `
        <h2>Password Reset</h2>
        <p>Hi ${user.username},</p>
        <p>You have requested to reset your password. Use the verification code below to proceed:</p>
        <p>Verification Code: <strong>${verificationCode}</strong></p>
        <a href="${resetPasswordLink}">Reset Password</a>
        <p>If you did not request this, please ignore this email.</p>
      `;
      const mailOptions = {
        email: user.email,
        html,
      };
      await sendMail(mailOptions);
      return res
        .status(200)
        .json({ message: "Verification code sent to email" });
    } catch (error) {
      return res.status(500).json(error);
    }
  },
  //ResetPassword
  resetPassword: async (req, res) => {
    try {
      const { code, newPassword } = req.body;
      if (!code || !newPassword) {
        return res
          .status(400)
          .json("Missing verification code or new password");
      }
      const user = await User.findOne({ verificationCode: code });
      if (!user) {
        return res.status(404).json("Invalid verification code");
      }
      // Reset the user's password
      const salt = await bcrypt.genSalt(roundSalt);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      user.password = hashedPassword;
      user.verificationCode = null;
      await user.save();
      return res.status(200).json({ message: "Password reset successful" });
    } catch (error) {
      return res.status(500).json(error);
    }
  },
};

module.exports = authController;
