const express = require('express');
const session = require('express-session');
const app = express();
const path = require('path');
const fs = require('fs');

const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // 업로드된 파일을 저장할 디렉토리를 설정합니다.

// 세션 설정
// app.use(session({
//     secret: 'secret-key', // 세션을 암호화하기 위한 비밀 키
//     resave: false,
//     saveUninitialized: true
// }));

// body-parser 미들웨어 추가
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 정적 파일 제공을 위한 경로 설정
// app.use(express.static(path.join(__dirname, '/public')));
app.use(express.static(path.join(__dirname)));

// 루트 경로에 대한 요청 처리
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'auth', 'sign-in.html')); // 로그인 페이지에서 시작
});

// 로그인 페이지
app.get('/auth/sign-in', (req, res) => {
    res.sendFile(path.join(__dirname, 'auth', 'sign-in.html'));
});

// 회원가입 페이지
app.get('/auth/sign-up', (req, res) => {
    res.sendFile(path.join(__dirname, 'auth', 'sign-up.html'));
});

// app.get('/auth/sign-in.js', (req, res) => {
//     res.set('Content-Type', 'text/javascript');
//     res.sendFile(path.join(__dirname, 'auth', 'sign-in.js'));
// });

// app.get('/auth/sign-in.css', (req, res) => {
//     res.set('Content-Type', 'text/css');
//     res.sendFile(path.join(__dirname, 'auth', 'sign-in.css'));
// });

// 회원가입 요청 처리
app.post('/signup', upload.single('profile_picture'), (req, res) => {
    const { email, password, confirmPassword, nickname } = req.body;
    const profile_picture = req.file; // 업로드된 파일은 req.file에서 참조할 수 있습니다.

    // 기존 사용자 정보를 읽어옵니다.
    fs.readFile('users.json', 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            res.status(500).send('Error reading file');
            return;
        }

        let users = JSON.parse(data);

        // 새로운 사용자 정보를 추가합니다.
        const newUser = {
            email,
            password,
            nickname,
            profile_picture // 프로필 사진 추가
        };
        users.push(newUser);

        // 갱신된 사용자 정보를 JSON 형식으로 다시 작성합니다.
        const updatedUsers = JSON.stringify(users, null, 4);

        // 파일에 새로운 정보를 씁니다.
        fs.writeFile('users.json', updatedUsers, 'utf8', (err) => {
            if (err) {
                console.error('Error writing file:', err);
                res.status(500).send('Error writing file');
                return;
            }
            //console.log('New user added successfully!');
            res.redirect('./auth/sign-in'); // 회원가입 성공 시 로그인 페이지로 이동
            // 회원가입 성공 시 HTML 코드를 생성하여 프로필 사진을 표시합니다.
            // const profileImageHTML = profile_picture ? `<img src="/${profile_picture.path}" alt="profile-picture">` : '';
            // const successHTML = `
            //     <h1>New user added successfully!</h1>
            //     ${profileImageHTML}
            // `;
            // res.status(200).send(successHTML);
        });
    });
});

// 게시글 목록 조회 페이지
app.get('/main/list-of-posts', (req, res) => {
    res.sendFile(path.join(__dirname, 'main', 'list-of-posts.html'));
});

// 게시글 작성 페이지
app.get('/main/create-post', (req, res) => {
    res.sendFile(path.join(__dirname, 'main', 'create-post.html'));
});

// 게시글 상세 조회 페이지
app.get('/main/post-details', (req, res) => {
    res.sendFile(path.join(__dirname, 'main', 'post-details.html'));
});

// 게시글 수정 페이지
app.get('/main/update-post', (req, res) => {
    res.sendFile(path.join(__dirname, 'main', 'update-post.html'));
});

// 회원정보 수정 페이지
app.get('/main/update-profile', (req, res) => {
    res.sendFile(path.join(__dirname, 'main', 'update-profile.html'));
});

// 비밀번호 수정 페이지
app.get('/main/update-password', (req, res) => {
    res.sendFile(path.join(__dirname, 'main', 'update-password.html'));
});

app.listen(3000, () => {
    console.log('서버가 실행 중입니다.');
});
