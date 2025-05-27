const { secureAPI } = require("../../utils/secure");
const { generateText } = require("./ai.controller");

const router = require("express").Router();

router.post("/", secureAPI(["admin", "user"]), async (req, res, next) => {
  try {
    const result = await generateText(req.body);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

module.exports = router;
