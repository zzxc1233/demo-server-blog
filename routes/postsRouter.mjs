import connectionPool from "../utils/db.mjs";
import { Router } from "express";
import validatePost from "../middleware/postValidation.mjs";

const postsRouter = Router();

// นักเขียนสามารถดูข้อมูลบทความทั้งหมดได้
postsRouter.get("/", async (_req, res) => {
    const result = await connectionPool.query(`SELECT * FROM posts`);
    return res.status(200).json({
        data: result.rows
    });
});

// นักเขียนสามารถสร้างบทความได้
postsRouter.post("/", validatePost, async (req, res) => {
    const newPost = req.body;

    try {
        const result = await connectionPool.query(
            `INSERT INTO posts (title, image, category_id, description, content, status_id) 
            VALUES ($1, $2, $3, $4, $5, $6) 
            RETURNING *`,
            [
                newPost.title,
                newPost.image,
                newPost.category_id,
                newPost.description,
                newPost.content,
                newPost.status_id
            ]
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

// นักเขียนสามารถดูข้อมูลบทความอันเดียวได้
postsRouter.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const result = await connectionPool.query(`SELECT * FROM posts WHERE id = $1`, [id]);

        if (!result.rows[0]) {
            return res.status(404).json({
                message: "Post not found"
            });
        }

        return res.status(200).json({
            data: result.rows[0]
        });
    } catch (error) {
        return res.status(500).json({
            message: "Server could not read post because database connection",
            error: error.message
        });
    }
});

// นักเขียนสามารถแก้ไขบทความที่ได้เคยสร้างไว้ก่อนหน้านี้
postsRouter.put("/:id", validatePost, async (req, res) => {
    const { id } = req.params;
    const updatedPost = req.body;

    console.log("updatedPost", updatedPost);
    

    try {
        const result = await connectionPool.query(
            `UPDATE posts 
            SET title = $1, 
                image = $2, 
                category_id = $3, 
                description = $4, 
                content = $5, 
                status_id = $6 
            WHERE id = $7 RETURNING *`,
            [
                updatedPost.title,
                updatedPost.image,
                updatedPost.category_id,
                updatedPost.description,
                updatedPost.content,
                updatedPost.status_id,
                id
            ]
        )

        if (!result.rows[0]) {
            return res.status(404).json({
                message: "Post not found"
            });
        }

        return res.status(200).json({
            message: "Updated post successfully",
            data: result.rows[0]
        });
    } catch (error) {
        return res.status(500).json({
            message: "Server could not update post because database connection",
            error: error.message
        });
    }
});

// นักเขียนสามารถลบบทความที่ได้เคยสร้างไว้ก่อนหน้านี้
postsRouter.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const result = await connectionPool.query(`DELETE FROM posts WHERE id = $1 RETURNING *`, [id]);

        if (!result.rows[0]) {
            return res.status(404).json({
                message: "Post not found"
            });
        }

        return res.status(200).json({
            message: "Deleted post successfully"
        });
    } catch (error) {
        return res.status(500).json({
            message: "Server could not delete post because database connection",
            error: error.message
        });
    }
});


export default postsRouter;
