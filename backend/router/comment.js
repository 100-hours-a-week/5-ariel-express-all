const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const commentController = require('../controller/commentController');

// 댓글 삭제 요청
router.delete('/delete-comment', commentController.deleteComment);

// 댓글 수정 요청
router.post('/update-comment', commentController.updateComment);

// 댓글 등록 요청
router.post('/add-comment', commentController.addComment);

module.exports = router;