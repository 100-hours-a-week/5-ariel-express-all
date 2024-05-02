const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const cors = require('cors'); // cors 모듈 추가
const userController = require('../controller/userController');

// CORS 옵션 설정
const corsOptions = {
    origin: 'http://localhost:3000', // 클라이언트의 도메인을 여기에 지정
    credentials: true, // 쿠키를 포함하여 요청을 받기 위해 true로 설정
};

// users.json 가져오기
router.get('/users', userController.users);

// 로그인 요청 처리
router.post('/login', userController.login);

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

// 회원정보 - 현재 로그인 된 사용자 이메일 표시
router.get('/current-user-email', userController.currentUserEmail)

module.exports = router;