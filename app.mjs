import 'dotenv/config';
import express from "express";
import cors from "cors";
import connectionPool from "./utils/db.mjs";

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

app.get("/posts", async (req, res) => {
    const result = await connectionPool.query(`SELECT * FROM posts`);
    return res.status(200).json({
        data: result.rows
    });
})

app.post("/posts", async (req, res) => {
    const newPost = req.body;

    try {
      const result = await connectionPool.query(
        `INSERT INTO assignments (title, image, category_id, description, content, status_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [newPost.title, newPost.image, newPost.category_id, newPost.description, newPost.content, newPost.status_id]
      )

      if (!result.rows[0]) {
        return res.status(400).json({
          message: "Server could not create post because there are missing data from client"
        });
      }

      return res.status(201).json({
        message: "Created post successfully",
        data: result.rows[0]
      });
    } catch (error) {
        return res.status(500).json({
          message: "Server could not create post because database connection",
          error: error.message
        });
    }
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

