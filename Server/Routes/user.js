const authController = require("../Controller/authController");
const middwareController = require("../Controller/middwareController");
const userController = require("../Controller/userController");

const router = require("express").Router();
// Get All user
router.get("/:id", userController.getUser);
//Deleted User
router.delete("/:id", userController.deleteUser);

// updateuser
router.put(
  "/:id",
  middwareController.verifyTokenAndUserAuthorization,
  userController.updateUser
);
//search User
router.get("/", middwareController.verifyToken, userController.searchAllUser);
router.put(
  "/:id/follow",
  middwareController.verifyToken,
  userController.followUser
);
module.exports = router;
