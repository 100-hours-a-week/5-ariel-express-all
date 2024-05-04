import express from 'express';
import session from 'express-session'
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';
// 라우터 설정
import userRouter from './router/user.js';
import postRouter from './router/post.js';
import commentRouter from './router/comment.js';


// 현재 모듈의 경로를 가져오기
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
app.use(session({
    secret: 'ariel', // 세션을 암호화하는 데 사용되는 비밀 키
    resave: false, // 요청이 왔을 때 세션을 항상 저장할지 여부
    saveUninitialized: false // 초기화되지 않은 세션을 저장소에 저장할지 여부
}));
app.use(userRouter);
app.use(postRouter);
app.use(commentRouter);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log('백엔드 서버가 실행 중입니다.');
});