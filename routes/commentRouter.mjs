import connectionPool from "../utils/db.mjs";
import { Router } from "express";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

const commentRouter = Router();

commentRouter.get("/", async (req, res) => {
    try {
        const query = `
            SELECT 
                id,
                post_id,
                user_id,
                comment_text,
                created_at
            FROM comments`;
        
        const { rows } = await connectionPool.query(query);
        res.status(200).json({
            message: "Success",
            comments: rows
        });
    } catch (error) {
        res.status(500).json({
            message: "Server could not read comments because database connection",
            error: error.message
        });
    }
})


commentRouter.post("/", async (req, res) => {
    try {
        const { post_id, user_id, comment_text } = req.body;

        if (!post_id || !user_id || !comment_text?.trim()) {
            return res.status(400).json({
                message: "Missing required fields: post_id, user_id, or comment_text"
            });
        }

        const query = `
            INSERT INTO comments (post_id, user_id, comment_text, created_at)
            VALUES ($1, $2, $3, NOW())
            RETURNING *`;
        
        const values = [post_id, user_id, comment_text.trim()];
        
        const { rows } = await connectionPool.query(query, values);

        // Success Response
        res.status(201).json({
            message: "Comment created successfully",
            data: rows[0] 
        });

    } catch (error) {
        console.error("Database Error:", error);

        // Error Handling: แยกประเภท error (เช่น Foreign Key พัง)
        if (error.code === '23503') { 
            return res.status(400).json({
                message: "Invalid post_id or user_id. Reference not found."
            });
        }

        res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
});

commentRouter.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { comment_text } = req.body;
        const query = `
            UPDATE comments
            SET comment_text = $1
            WHERE id = $2
            RETURNING *`;
        
        const values = [comment_text, id];
        const { rows } = await connectionPool.query(query, values);
        if (!rows[0]) {
            return res.status(404).json({
                message: "Comment not found"
            });
        }
        res.status(200).json({
            message: "Success",
            comment: rows[0]
        });
    } catch (error) {
        res.status(500).json({
            message: "Server could not update comment because database connection",
            error: error.message
        });
    }
})

commentRouter.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const result = await connectionPool.query(`DELETE FROM comments WHERE id = $1 RETURNING *`, [id]);
        if (!result.rows[0]) {
            return res.status(404).json({
                message: "Comment not found"
            });
        }
        res.status(200).json({
            message: "Success",
            comment: result.rows[0]
        });
    } catch (error) {
        res.status(500).json({
            message: "Server could not delete comment because database connection",
            error: error.message
        });
    }
})


export default commentRouter;