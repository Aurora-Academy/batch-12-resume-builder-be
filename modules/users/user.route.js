const router = require("express").Router();
const userController = require("./user.controller");
const { secureAPI } = require("../../utils/secure");

router.post("/login", async (req, res, next) => {
  try {
    const result = await userController.login(req.body);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

router.post("/register", async (req, res, next) => {
  try {
    await userController.register(req.body);
    res.json({ data: "User registered successfully" });
  } catch (e) {
    next(e);
  }
});

router.post("/email/verify", async (req, res, next) => {
  try {
    await userController.verifyEmail(req.body);
    res.json({ data: "Email verified successfully" });
  } catch (e) {
    next(e);
  }
});

router.post("/email/resend", async (req, res, next) => {
  try {
    await userController.resendEmailOtp(req.body);
    res.json({ data: "OTP resent successfully" });
  } catch (e) {
    next(e);
  }
});

router.post("/refresh", async (req, res, next) => {
  try {
    const result = await userController.refreshToken(req.body);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

// forget password token
router.post("/forget-password", async (req, res, next) => {
  try {
    await userController.fpTokenGeneration(req.body);
    res.json({ data: "Please check your email address for further instructions." });
  } catch (e) {
    next(e);
  }
});

// forget password verification
router.post("/forget-password/verify", async (req, res, next) => {
  try {
    await userController.fpTokenVerification(req.body);
    res.json({ data: "Password changed successfully." });
  } catch (e) {
    next(e);
  }
});

router.post("/change-password", secureAPI(["admin", "user"]), async (req, res, next) => {
  try {
    await userController.changePassword(req.currentUser, req.body);
    res.json({ data: "Password changed successfully" });
  } catch (e) {
    next(e);
  }
});

router.post("/reset-password", secureAPI(["admin"]), async (req, res, next) => {
  try {
    await userController.resetPassword(req.body);
    res.json({ data: "Password reset successfully" });
  } catch (e) {
    next(e);
  }
});

router.get("/profile", secureAPI(["admin", "user"]), async (req, res, next) => {
  try {
    const result = await userController.getProfile(req.currentUser);
    res.json({ data: result });
  } catch (e) {
    next(e);
  }
});

router.put("/profile", secureAPI(["admin", "user"]), async (req, res, next) => {
  try {
    const result = await userController.updateProfile(req.currentUser, req.body);
    res.json({ data: result });
  } catch (e) {
    next(e);
  }
});

// ADMIN SECTIONS

router.get("/", secureAPI(["admin"]), async (req, res, next) => {
  try {
    const { page, limit, name } = req.query;
    const search = { name };
    const result = await userController.list({ page, limit, search });
    res.json(result);
  } catch (e) {
    next(e);
  }
});

router.post("/", secureAPI(["admin"]), async (req, res, next) => {
  try {
    res.json({ data: "I am admin route, and I need atleast access token to access" });
  } catch (e) {
    next(e);
  }
});

router.get("/:id", secureAPI(["admin"]), async (req, res, next) => {
  try {
    res.json({ data: "I am admin route, and I need atleast access token to access" });
  } catch (e) {
    next(e);
  }
});

router.put("/:id", secureAPI(["admin"]), async (req, res, next) => {
  try {
    res.json({ data: "I am admin route, and I need atleast access token to access" });
  } catch (e) {
    next(e);
  }
});

router.patch("/:id/block", secureAPI(["admin"]), async (req, res, next) => {
  try {
    res.json({ data: "I am admin route, and I need admin role access token to access" });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
