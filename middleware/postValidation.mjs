function validatePost(req, res, next) {
    const { title, image, category_id, description, content, status_id } = req.body;
    
    if (!title || typeof title !== "string" || title.trim() === "") {
        return res.status(400).json({
            message: "Title is required"
        })
    }
    
    if (!image || typeof image !== "string" || image.trim() === "") {
        return res.status(400).json({
            message: "Image is required"
        })
    }
    
    if (!category_id || typeof category_id !== "number") {
        return res.status(400).json({
            message: "Category is required"
        })
    }
    
    if (!description || typeof description !== "string" || description.trim() === "") {
        return res.status(400).json({
            message: "Description is required"
        })
    }
    
    if (!content || typeof content !== "string" || content.trim() === "") {
        return res.status(400).json({
            message: "Content is required"
        })
    }
    
    if (!status_id || typeof status_id !== "number") {
        return res.status(400).json({
            message: "Status is required"
        })
    }
    
    next();
}

export default validatePost;
