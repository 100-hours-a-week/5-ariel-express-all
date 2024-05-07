import express from 'express';
import path from 'path';
import cors from'cors';
import session from 'express-session';
import { fileURLToPath } from 'url';

// 현재 모듈의 경로를 가져오기
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const publicPath = path.join(__dirname); // 정적 파일 제공을 위한 경로 설정

// 세션 미들웨어 설정
// app.use(session({
//     secret: 'ariel_front', // 세션 암호화를 위한 키
//     resave: false,
//     saveUninitialized: true
// }));

// 로그인 확인 미들웨어 설정
// const isLoggedIn = (req, res, next) => {
//     // 세션에 로그인된 사용자의 정보가 있는지 확인
//     if (req.session.loggedInUser) {
//         console.log('미들웨어. 로그인 O');
//         // 세션에 로그인된 사용자의 정보가 있는 경우 다음 미들웨어로 진행
//         next();
//     } else {
//         console.log('미들웨어. 로그인 X');
//         // 세션에 로그인된 사용자의 정보가 없는 경우 로그인 페이지로 리다이렉트
//         res.redirect('/sign-in');
//     }
// }

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