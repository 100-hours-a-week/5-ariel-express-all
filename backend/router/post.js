import express from 'express';
import multer from 'multer';
import postController from '../controller/postController.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });


// posts.json 가져오기
router.get('/posts', postController.posts);

// 게시글 목록 조회 페이지 요청
router.get('/list-of-posts', postController.listOfPosts);

// 게시글 삭제 요청
router.delete('/delete-post', postController.deletePost);

// 게시글 등록 요청
router.post('/create-post', upload.single('image'), postController.createPost);

// 게시글 수정 요청
router.post('/update-post', upload.single('image'), postController.updatePost);

export default router;