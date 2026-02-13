import multer from 'multer';

// ตั้งค่าให้เก็บไฟล์ไว้ใน Memory ชั่วคราวเพื่อส่งต่อให้ Supabase
const storage = multer.memoryStorage();

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // จำกัด 5MB ตามที่คุณตั้งใน Client
});

export default upload;