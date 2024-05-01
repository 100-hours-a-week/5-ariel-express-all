const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const app = express();

// CORS 옵션 설정
const corsOptions = {
    origin: 'http://localhost:3000', // 클라이언트의 도메인
    credentials: true, // 쿠키를 포함하여 요청을 받기 위해 true로 설정
};

// Middleware 설정
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors(corsOptions));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // uploads 디렉토리를 정적 파일로 제공

// 라우터 설정
const userRouter = require('./router/user');
const postRouter = require('./router/post');
const commentRouter = require('./router/comment');
app.use(userRouter);
app.use(postRouter);
app.use(commentRouter);

app.listen(3001, () => {
    console.log('백엔드 서버가 실행 중입니다.');
});