import express from 'express';
import multer from 'multer';
import cors from 'cors';
import userController from '../controller/userController.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// CORS 옵션 설정
const corsOptions = {
    origin: 'http://localhost:3000', // 클라이언트의 도메인을 여기에 지정
    credentials: true, // 쿠키를 포함하여 요청을 받기 위해 true로 설정
};

// users.json 가져오기
router.get('/users', userController.users);

// 로그인 요청 처리
router.post('/login', userController.login);

// 로그아웃 요청 처리
router.post('/logout', userController.logout);

// 회원가입 요청 처리
router.post('/signup', upload.single('profile_picture'), userController.signUp);

// 현재 로그인 된 사용자의 프로필 사진 요청 처리
router.get('/get-profile-image', cors(corsOptions), userController.getProfileImage);

// 회원정보 수정
router.post('/update-profile', upload.single('profileImage'), userController.updateProfile);

// 회원 탈퇴
router.delete('/withdraw', userController.withdraw);

// 비밀번호 수정
router.post('/update-password', userController.updatePassword);

router.get('/current-email', userController.getCurrentUserEmail);

// 회원정보 - 현재 로그인 된 사용자 이메일 표시
router.get('/current-user-email-and-nickname', userController.currentUserEmailAndNickname)

export default router;