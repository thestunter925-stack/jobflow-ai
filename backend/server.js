const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "JobFlow AI API is running 🚀"
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    service: "JobFlow AI",
    status: "healthy"
  });
});

app.listen(PORT, () => {
  console.log(`JobFlow AI API running on port ${PORT}`);
});