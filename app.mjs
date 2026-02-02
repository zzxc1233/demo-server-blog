import express from "express";
import cors from "cors";

const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(cors());

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.get("/test", (req, res) => {
  res.send("Hello World! test blog");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

app.get("/health", (req, res) => {
  res.status(200).json({ message: "OK" });
});
