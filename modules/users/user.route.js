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

router.get("/", secureAPI(), async (req, res, next) => {
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
