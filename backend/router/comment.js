import express from 'express';
import multer from 'multer';
import commentController from '../controller/commentController.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// 댓글 삭제 요청
router.delete('/delete-comment', commentController.deleteComment);

// 댓글 수정 요청
router.post('/update-comment', commentController.updateComment);

// 댓글 등록 요청
router.post('/add-comment', commentController.addComment);

export default router;