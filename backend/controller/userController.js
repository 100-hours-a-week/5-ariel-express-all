import fs from 'fs';
import path from 'path';
import bcrypt from 'bcrypt';
import { fileURLToPath } from 'url';

// 현재 모듈의 경로를 가져오기
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const usersJsonPath = path.join(__dirname, '..', 'model', 'users.json');
const postsJsonPath = path.join(__dirname, '..', 'model', 'posts.json');

// 사용자 정보를 파일에서 읽어와서 클라이언트에게 전송
const users = (req, res) => {
    const usersFilePath = usersJsonPath;
    res.sendFile(usersFilePath);
}

// 로그인 요청 처리
// const login = (req, res) => {
//     const { email } = req.body;
//     // 디코딩된 이메일 정보를 사용하여 쿠키 설정
//     const decodedEmail = decodeURIComponent(email);
//     //console.log(`현재 로그인 된 사용자 이메일 디코딩 ver: ${decodedEmail}`);
//     res.cookie('loggedInUser', decodedEmail, { maxAge: 900000, httpOnly: true }); // 쿠키 만료 시간: 15분
//     res.json({ success: true });
// }

// // 로그인 요청 처리
// const login = (req, res) => {
//     const { email } = req.body;
//     // 디코딩된 이메일 정보를 사용하여 세션 설정
//     req.session.loggedInUser = decodeURIComponent(email);
//     res.json({ success: true });
// }

// 로그인 요청 처리
const login = (req, res) => {
    const { email, password } = req.body;

    // 사용자 정보 읽어오기
    fs.readFile(usersJsonPath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            res.status(500).send('Error reading file');
            return;
        }

        const users = JSON.parse(data);
        // 이메일을 이용하여 사용자 찾기
        const user = users.find(user => user.email === email);
        if (!user) {
            // 사용자가 존재하지 않는 경우
            res.json({ success: false });
            return;
        }

        // 비밀번호 해시와 비교
        bcrypt.compare(password, user.password, (err, result) => {
            if (err) {
                console.error('Error comparing passwords:', err);
                res.status(500).send('Error comparing passwords');
                return;
            }

            if (result) {
                // 비밀번호 일치하는 경우 세션 설정
                req.session.loggedInUser = email;
                res.json({ success: true });
            } else {
                // 비밀번호 불일치하는 경우
                res.json({ success: false });
            }
        });
    });
}

// 로그아웃 요청 처리
const logout = (req, res) => {
    // 세션을 삭제하여 로그아웃 상태로 만듭니다.
    req.session.destroy(err => {
        if (err) {
            console.error('Error destroying session:', err);
            res.status(500).send('Error destroying session');
        } else {
            // 세션 삭제 후 로그아웃 완료 메시지를 클라이언트에 보냅니다.
            res.clearCookie('loggedInUserID'); // 쿠키도 삭제
            res.json({ success: true, message: 'Logout successful' });
        }
    });
};


// 회원가입 요청 처리
const signUp = (req, res) => {
    const { email, password, confirmPassword, nickname } = req.body;
    const profile_picture = req.file.path;

    // 비밀번호 암호화
    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
            console.error('Error hashing password:', err);
            res.status(500).send('Error hashing password');
            return;
        }

        // 기존 사용자 정보 읽어오기
        fs.readFile(usersJsonPath, 'utf8', (err, data) => {
            if (err) {
                console.error('Error reading file:', err);
                res.status(500).send('Error reading file');
                return;
            }

            let users = JSON.parse(data);

            // 새로운 사용자 추가
            const newUser = {
                email,
                password: hashedPassword, // 암호화된 비밀번호 저장
                nickname,
                profile_picture
            };
            users.push(newUser);

            // 갱신된 사용자 정보를 JSON 형식으로 다시 작성
            const updatedUsers = JSON.stringify(users, null, 4);

            // 파일 갱신
            fs.writeFile(usersJsonPath, updatedUsers, 'utf8', (err) => {
                if (err) {
                    console.error('Error writing file:', err);
                    res.status(500).send('Error writing file');
                    return;
                }
                res.redirect('http://localhost:3000/sign-in');
            });
        });
    });
}

// 현재 로그인된 사용자의 프로필 사진 요청 처리
const getProfileImage = (req, res) => {
    // 세션에서 현재 로그인한 이메일 정보를 읽어옴
    const loggedInUserEmail = req.session.loggedInUser;

    console.log(`프사 요청 loggedInUser: ${loggedInUserEmail}`);
    if (loggedInUserEmail) {
        // 현재 로그인한 사용자의 정보를 users.json 파일에서 찾음
        fs.readFile(usersJsonPath, 'utf8', (err, data) => {
            if (err) {
                console.error('Error reading file:', err);
                res.status(500).json({ error: 'Failed to read file' });
                return;
            }

            const users = JSON.parse(data);
            const currentUser = users.find(user => user.email === loggedInUserEmail);
            if (currentUser) {
                // 현재 로그인한 사용자의 프로필 이미지 경로를 생성
                const profileImagePath = 'http://localhost:3001/' + currentUser.profile_picture;
                console.log(`현재 로그인한 사용자 프사 경로: ${profileImagePath}`);

                // JSON 형식으로 프로필 이미지 경로를 클라이언트에게 전달
                res.json({ profileImagePath });
                return;
            } else {
                // 사용자 정보를 찾을 수 없는 경우
                res.status(404).json({ error: 'User not found' });
            }
        });
    } else {
        // 로그인되지 않은 사용자인 경우
        res.status(401).json({ error: 'User not logged in' });
    }
}

// 회원정보 수정
const updateProfile = (req, res) => {
    const loggedInUser = req.session.loggedInUser;
    const newNickname = req.body.newNickname;
    const profileImage = req.file; // 업로드된 프로필 이미지 파일

    fs.readFile(usersJsonPath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            res.status(500).json({ success: false, error: 'Failed to read file' });
            return;
        }

        let users = JSON.parse(data);

        const userIndex = users.findIndex(user => user.email === loggedInUser);
        console.log(`userIndex: ${userIndex}`);
        if (userIndex !== -1) {
            users[userIndex].nickname = newNickname;

            // 프로필 이미지가 존재하는 경우에만 업데이트
            if (profileImage) {
                users[userIndex].profile_picture = profileImage.path;
            }

            console.log(`변경된 유저: ${users}`);

            // 사용자 정보 업데이트
            fs.writeFile(usersJsonPath, JSON.stringify(users, null, 4), 'utf8', (err) => {
                if (err) {
                    console.error('Error writing file:', err);
                    res.status(500).json({ success: false, error: 'Failed to write file' });
                    return;
                }

                // 게시글과 댓글 정보 업데이트
                updatePostsAndComments(loggedInUser, newNickname, profileImage);

                res.json({ success: true });
            });
        } else {
            res.status(404).json({ success: false, error: 'User not found' });
        }
    });
}

// 게시글과 댓글 정보 업데이트 함수
const updatePostsAndComments = (userEmail, newNickname, profileImage) => {
    fs.readFile(postsJsonPath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return;
        }

        let postsData = JSON.parse(data);

        // 게시글 정보 업데이트
        postsData.posts.forEach(post => {
            if (post.author.email === userEmail) {
                post.author.nickname = newNickname;
                if (profileImage) {
                    post.author.profile_picture = 'http://localhost:3001/' + profileImage.path;
                }
            }

            // 댓글 정보 업데이트
            post.comments.forEach(comment => {
                if (comment.author.email === userEmail) {
                    comment.author.nickname = newNickname;
                    if (profileImage) {
                        comment.author.profile_picture = 'http://localhost:3001/' + profileImage.path;
                    }
                }
            });
        });

        // 업데이트된 데이터 저장
        fs.writeFile(postsJsonPath, JSON.stringify(postsData, null, 4), 'utf8', (err) => {
            if (err) {
                console.error('Error writing file:', err);
                return;
            }
            console.log('Posts and comments updated successfully.');
        });
    });
}

// 회원 탈퇴
const withdraw = (req, res) => {
    // 사용자 정보를 users.json 파일에서 읽어옴
    fs.readFile(usersJsonPath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return res.status(500).json({ success: false, error: 'Failed to read file' });
        }

        let users = JSON.parse(data);

        // 현재 로그인한 사용자의 이메일을 통해 사용자 정보를 찾음
        const loggedInUserEmail = req.session.loggedInUser;
        const userIndex = users.findIndex(user => user.email === loggedInUserEmail);

        if (userIndex === -1) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        // 사용자를 삭제하고 users.json 파일에 저장
        users.splice(userIndex, 1);

        fs.writeFile(usersJsonPath, JSON.stringify(users, null, 4), 'utf8', (err) => {
            if (err) {
                console.error('Error writing file:', err);
                return res.status(500).json({ success: false, error: 'Failed to write file' });
            }
            res.json({ success: true });
        });
    });
}

// 비밀번호 변경
const updatePassword = (req, res) => {
    const { newPassword } = req.body;

    console.log(`비밀번호 변경 페이지: ${newPassword}`);

    // 사용자 정보를 users.json 파일에서 읽어옴
    fs.readFile(usersJsonPath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return res.status(500).json({ success: false, error: 'Failed to read file' });
        }

        let users = JSON.parse(data);

        // 현재 로그인한 사용자의 이메일을 통해 사용자 정보를 찾음
        const loggedInUserEmail = req.session.loggedInUser;
        const userIndex = users.findIndex(user => user.email === loggedInUserEmail);

        if (userIndex === -1) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        // 사용자의 비밀번호를 업데이트하고 users.json 파일에 저장
        users[userIndex].password = newPassword;

        fs.writeFile(usersJsonPath, JSON.stringify(users, null, 4), 'utf8', (err) => {
            if (err) {
                console.error('Error writing file:', err);
                return res.status(500).json({ success: false, error: 'Failed to write file' });
            }
            res.json({ success: true });
        });
    });
}

// 현재 로그인 된 이메일, 닉네임으로 사용자 정보 변경
const currentUserEmailAndNickname = (req, res) => {
    const loggedInUserEmail = req.session.loggedInUser;
    if (loggedInUserEmail) {
        // 사용자 정보를 users.json 파일에서 찾음
        fs.readFile(usersJsonPath, 'utf8', (err, data) => {
            if (err) {
                console.error('Error reading file:', err);
                return res.status(500).json({ success: false, error: 'Failed to read file' });
            }

            const users = JSON.parse(data);
            const currentUser = users.find(user => user.email === loggedInUserEmail);

            if (currentUser) {
                // 이메일과 닉네임 반환
                const user = {
                    email: loggedInUserEmail,
                    nickname: currentUser.nickname
                };
                res.json({ success: true, user });
            } else {
                res.status(404).json({ success: false, error: 'User not found' });
            }
        });
    } else {
        res.status(401).json({ success: false, message: 'User not logged in' });
    }
}

export default {
    users,
    login,
    logout,
    signUp,
    getProfileImage,
    updateProfile,
    withdraw,
    updatePassword,
    currentUserEmailAndNickname,
};