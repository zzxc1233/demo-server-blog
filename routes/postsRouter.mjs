import connectionPool from "../utils/db.mjs";
import { Router } from "express";
import validatePost from "../middleware/postValidation.mjs";

const postsRouter = Router();

// นักเขียนสามารถดูข้อมูลบทความทั้งหมดได้
postsRouter.get("/", async (req, res) => {
    try {
        const category = req.query.category || "";
        const keyword = req.query.keyword || "";
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 6;

        const safePage = Math.max(1, page);
        const safeLimit = Math.max(1, Math.min(100, limit));
        const offset = (safePage - 1) * safeLimit;
        let query = `
            SELECT posts.id, posts.image, categories.name AS category, posts.title, posts.description, posts.date, posts.content, statuses.status, posts.likes_count
            FROM posts
            INNER JOIN categories ON posts.category_id = categories.id
            INNER JOIN statuses ON posts.status_id = statuses.id
    `;
        let values = [];

        if (category && keyword) {
            query += `
                WHERE categories.name ILIKE $1 
                AND (posts.title ILIKE $2 OR posts.description ILIKE $2 OR posts.content ILIKE $2)`;
            values = [`%${category}%`, `%${keyword}%`];
        } else if (category) {
            query += " WHERE categories.name ILIKE $1";
            values = [`%${category}%`];
        } else if (keyword) {
            query += `
                WHERE posts.title ILIKE $1 
                OR posts.description ILIKE $1 
                OR posts.content ILIKE $1`;
            values = [`%${keyword}%`];
        }

        query += ` ORDER BY posts.date DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2
            }`;

        values.push(safeLimit, offset);

        const result = await connectionPool.query(query, values);

        let countQuery = `
            SELECT COUNT(*)
            FROM posts
            INNER JOIN categories ON posts.category_id = categories.id
            INNER JOIN statuses ON posts.status_id = statuses.id`;
        let countValues = values.slice(0, -2); 

        if (category && keyword) {
            countQuery += `
        WHERE categories.name ILIKE $1 
        AND (posts.title ILIKE $2 OR posts.description ILIKE $2 OR posts.content ILIKE $2)`;
        } else if (category) {
            countQuery += " WHERE categories.name ILIKE $1";
        } else if (keyword) {
            countQuery += `
                WHERE posts.title ILIKE $1 
                OR posts.description ILIKE $1 
                OR posts.content ILIKE $1`;
        }

        const countResult = await connectionPool.query(countQuery, countValues);
        const totalPosts = parseInt(countResult.rows[0].count, 10);

        const results = {
            totalPosts,
            totalPages: Math.ceil(totalPosts / safeLimit),
            currentPage: safePage,
            limit: safeLimit,
            posts: result.rows,
        };
        if (offset + safeLimit < totalPosts) {
            results.nextPage = safePage + 1;
        }
        if (offset > 0) {
            results.previousPage = safePage - 1;
        }
        return res.status(200).json(results);
    } catch (error) {
        return res.status(500).json({
            message: "Server could not read post because database issue",
            error: error.message
        });
    }
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
