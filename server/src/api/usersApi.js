const express = require("express");
const { validate } = require("../middleware/validationMiddleware");
const userController = require("../controllers/userController");
const auth = require("../middleware/authMiddleware");
const { userValidation } = require("../validations/userValidation");
const operationMiddleware = require("../middleware/operationMiddleware");

const router = express.Router();

// 公开路由
router.post(
    "/register",
    validate(userValidation.register),
    operationMiddleware.setOperation("REGISTER_USER", "User"),
    userController.register.bind(userController),
);

router.post(
    "/login",
    validate(userValidation.login),
    operationMiddleware.setOperation("LOGIN_USER", "User"),
    userController.login.bind(userController),
);

router.post(
    "/refresh-token",
    operationMiddleware.setOperation("REFRESH_TOKEN", "User"),
    userController.refreshToken.bind(userController),
);

router.post(
    "/logout",
    operationMiddleware.setOperation("LOGOUT_USER", "User"),
    userController.logout.bind(userController),
);

// 认证路由
router.use(auth.authenticate);

router.get(
    "/profile",
    operationMiddleware.setOperation("GET_USER_PROFILE", "User"),
    userController.getProfile.bind(userController),
);

router.patch(
    "/profile",
    validate(userValidation.updateProfile),
    operationMiddleware.setOperation("UPDATE_USER_PROFILE", "User"),
    userController.updateProfile.bind(userController),
);

router.post(
    "/change-password",
    validate(userValidation.changePassword),
    operationMiddleware.setOperation("CHANGE_USER_PASSWORD", "User"),
    userController.changePassword.bind(userController),
);

// 管理员路由
router.use(auth.restrictTo("admin"));

router.get(
    "/",
    operationMiddleware.setOperation("GET_USERS", "User"),
    userController.getUsers.bind(userController),
);

router.get(
    "/:id",
    validate(userValidation.getUserById),
    operationMiddleware.setOperation("GET_USER_DETAIL", "User"),
    userController.getUser.bind(userController),
);

module.exports = router;
