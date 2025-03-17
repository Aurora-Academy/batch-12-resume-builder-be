const router = require("express").Router();
const userController = require("./user.controller");

router.post("/login", async (req, res, next) => {
  try {
  } catch (e) {
    next(e);
  }
});

router.post("/register", async (req, res, next) => {
  try {
    const result = await userController.register(req.body);
    res.json({ data: "User registered successfully" });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
