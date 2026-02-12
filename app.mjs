import 'dotenv/config';
import express from "express";
import cors from "cors";
import postsRouter from "./routes/postsRouter.mjs";
import authRouter from "./routes/auth.mjs";

const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());
app.use("/posts", postsRouter);
app.use("/auth", authRouter);

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.get("/test", (_req, res) => {
  res.send("Hello World! test blog");
});



app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});


