const router = require("express").Router();
const resumeRouter = require("../modules/resumes/resume.route");
const userRouter = require("../modules/users/user.route");

router.get("/", (req, res, next) => {
  try {
    res.json({ data: "API is working properly" });
  } catch (e) {
    next(e);
  }
});

router.use("/api/v1/resumes", resumeRouter);
router.use("/api/v1/users", userRouter);

module.exports = router;
