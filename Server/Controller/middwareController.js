const User = require("../models/userModels");
const jwt = require("jsonwebtoken");
const middwareController = {
  verifyToken: (req, res, next) => {
    //check AccesskToken and check user
    const SECRET_KEY = process.env.JWT_KEY;
    const authorization = req.headers.authorization;
    if (authorization) {
      const token = authorization.split(" ")[1];
      console.log(token);
      jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json("Token is not valid");
        req.user = user;
        next();
      });
    } else if (!authorization) {
      res.status(500).json("You are not authentication");
    }
  },
  verifyTokenAndUserAuthorization: (req, res, next) => {
    middwareController.verifyToken(req, res, () => {
      console.log("Params : ", req.params.id);
      console.log("User id : ", req.user.id);
      if (req.user.id === req.params.id.trim() || req.user.isAdmin) {
        next();
      } else {
        return res.status(403).json("You're not allowed to do that!");
      }
    });
  },
  verifyTokenAndUserPostAuthorization: (req, res, next) => {
    middwareController.verifyToken(req, res, () => {
      console.log(req.user.id);
      if (req.user.id === req.body.userId || req.user.isAdmin) {
        next();
      } else {
        return res.status(403).json("You're not allowed to do that!");
      }
    });
  },
};
module.exports = middwareController;
