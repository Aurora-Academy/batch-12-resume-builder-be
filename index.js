require("dotenv").config();
const cors = require("cors");
const express = require("express");
const helmet = require("helmet");
const mongoose = require("mongoose");
const morgan = require("morgan");

const indexRouter = require("./routes");

const PORT = process.env.PORT || "8000";
const app = express();

mongoose
  .connect(process.env.DB_URL)
  .then(console.log("Database connected"))
  .catch((e) => console.log("Database error", e.toString()));

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use("/assets", express.static("public"));
app.use(morgan("tiny"));

app.use("/", indexRouter);

app.use((err, req, res, next) => {
  const errMsg = err.toString() || "Something went wrong";
  res.status(500).json({ data: null, err: errMsg });
});

app.listen(PORT, () => {
  console.log(`App is running on http://localhost:${PORT}`);
});
