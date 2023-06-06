const router = require("express").Router();
const authController = require("../Controller/authController");
const middwareController = require("../Controller/middwareController");
//Register User
router.post("/register", authController.registerUser);
//Login User
router.post("/login", authController.loginUser);
//Logout User
router.post(
  "/logout",
  middwareController.verifyToken,
  authController.logOutUser
);
//RefreshToken
router.post("/refreshtoken", authController.requsetToken);
//fortgotPassword
router.get("/forgotPassword", authController.forgotPassword);
router.put("/resetPassword", authController.resetPassword);
module.exports = router;
