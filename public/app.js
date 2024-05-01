const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
const publicPath = path.join(__dirname); // 정적 파일 제공을 위한 경로 설정

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static(__dirname));


// 루트 경로에 대한 요청 처리
app.get('/', (req, res) => {
    res.sendFile(path.join(publicPath, 'html', 'sign-in.html')); // 로그인 페이지에서 시작
});

// 로그인 페이지
app.get('/sign-in', (req, res) => {
    res.sendFile(path.join(publicPath, 'html', 'sign-in.html'));
});

// 회원가입 페이지
app.get('/sign-up', (req, res) => {
    res.sendFile(path.join(publicPath, 'html', 'sign-up.html'));
});

// 게시글 목록 조회 페이지
app.get('/list-of-posts', (req, res) => {
    res.sendFile(path.join(publicPath, 'html', 'list-of-posts.html'));
});

// 게시글 작성 페이지
app.get('/create-post', (req, res) => {
    res.sendFile(path.join(publicPath, 'html', 'create-post.html'));
});

// 게시글 상세 조회 페이지
app.get('/post-details', (req, res) => {
    res.sendFile(path.join(publicPath, 'html', 'post-details.html'));
});

// 게시글 수정 페이지
app.get('/update-post', (req, res) => {
    res.sendFile(path.join(publicPath, 'html', 'update-post.html'));
});

// 회원정보 수정 페이지
app.get('/update-profile', (req, res) => {
    res.sendFile(path.join(publicPath, 'html', 'update-profile.html'));
});

// 비밀번호 수정 페이지
app.get('/update-password', (req, res) => {
    res.sendFile(path.join(publicPath, 'html', 'update-password.html'));
});

app.listen(3000, () => {
    console.log('서버가 실행 중입니다.');
});