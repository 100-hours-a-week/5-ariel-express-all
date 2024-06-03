import bcrypt from 'bcrypt';
import db from '../model/db.js'; // 데이터베이스 연결 가져오기

// 사용자 정보를 데이터베이스에서 읽어와서 클라이언트에게 전송
const users = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM user');
        res.json(rows);
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).send('Server error');
    }
}

// 로그인 요청 처리
const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const [rows] = await db.query('SELECT * FROM user WHERE email = ?', [email]);
        const user = rows[0];

        if (!user) {
            // 사용자가 존재하지 않는 경우
            res.json({ success: false });
            return;
        }

        // 비밀번호 해시와 비교
        const match = await bcrypt.compare(password, user.password);
        if (match) {
            // 비밀번호 일치하는 경우 세션 설정
            req.session.loggedInUser = email;
            res.json({ success: true });
        } else {
            // 비밀번호 불일치하는 경우
            res.json({ success: false });
        }
    } catch (err) {
        console.error('Error logging in:', err);
        res.status(500).send('Server error');
    }
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
const signUp = async (req, res) => {
    const { email, password, confirmPassword, nickname } = req.body;
    const profile_picture = req.file.path;

    // 비밀번호 암호화
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const [result] = await db.query('INSERT INTO user (email, password, nickname, profile_picture) VALUES (?, ?, ?, ?)', [email, hashedPassword, nickname, profile_picture]);
        res.redirect('http://localhost:3000/sign-in');
    } catch (err) {
        console.error('Error signing up:', err);
        res.status(500).send('Server error');
    }
}

// 현재 로그인된 사용자의 프로필 사진 요청 처리
const getProfileImage = async (req, res) => {
    const loggedInUserEmail = req.session.loggedInUser;

    if (loggedInUserEmail) {
        try {
            const [rows] = await db.query('SELECT profile_picture FROM user WHERE email = ?', [loggedInUserEmail]);
            const user = rows[0];

            if (user) {
                const profileImagePath = 'http://localhost:3001/' + user.profile_picture;
                res.json({ profileImagePath });
            } else {
                res.status(404).json({ error: 'User not found' });
            }
        } catch (err) {
            console.error('Error fetching profile image:', err);
            res.status(500).json({ error: 'Failed to fetch profile image' });
        }
    } else {
        res.status(401).json({ error: 'User not logged in' });
    }
}

// 회원정보 수정
const updateProfile = async (req, res) => {
    const loggedInUser = req.session.loggedInUser;
    const newNickname = req.body.newNickname;
    const profileImage = req.file; // 업로드된 프로필 이미지 파일

    try {
        const [rows] = await db.query('SELECT * FROM user WHERE email = ?', [loggedInUser]);
        const user = rows[0];

        if (user) {
            const profilePicturePath = profileImage ? profileImage.path : user.profile_picture;

            await db.query('UPDATE user SET nickname = ?, profile_picture = ? WHERE email = ?', [newNickname, profilePicturePath, loggedInUser]);

            // 게시글과 댓글 정보 업데이트 (별도의 함수에서 처리)
            updatePostsAndComments(loggedInUser, newNickname, profileImage);

            res.json({ success: true });
        } else {
            res.status(404).json({ success: false, error: 'User not found' });
        }
    } catch (err) {
        console.error('Error updating profile:', err);
        res.status(500).json({ success: false, error: 'Failed to update profile' });
    }
}

// 회원 탈퇴
const withdraw = async (req, res) => {
    const loggedInUserEmail = req.session.loggedInUser;

    try {
        const [result] = await db.query('DELETE FROM user WHERE email = ?', [loggedInUserEmail]);

        if (result.affectedRows > 0) {
            res.json({ success: true });
        } else {
            res.status(404).json({ success: false, error: 'User not found' });
        }
    } catch (err) {
        console.error('Error withdrawing user:', err);
        res.status(500).json({ success: false, error: 'Failed to withdraw user' });
    }
}

// 비밀번호 변경
const updatePassword = async (req, res) => {
    const { newPassword } = req.body;
    const loggedInUserEmail = req.session.loggedInUser;

    try {
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await db.query('UPDATE user SET password = ? WHERE email = ?', [hashedPassword, loggedInUserEmail]);

        res.json({ success: true });
    } catch (err) {
        console.error('Error updating password:', err);
        res.status(500).json({ success: false, error: 'Failed to update password' });
    }
}

// 현재 로그인 된 이메일 반환
const getCurrentUserEmail = (req, res) => {
    const loggedInUserEmail = req.session.loggedInUser;
    if (loggedInUserEmail) {
        res.json({ success: true, email: loggedInUserEmail });
    } else {
        res.status(401).json({ success: false, message: 'User not logged in' });
    }
}

// 현재 로그인 된 이메일, 닉네임으로 사용자 정보 반환
const currentUserEmailAndNickname = async (req, res) => {
    const loggedInUserEmail = req.session.loggedInUser;
    if (loggedInUserEmail) {
        try {
            const [rows] = await db.query('SELECT email, nickname FROM user WHERE email = ?', [loggedInUserEmail]);
            const user = rows[0];

            if (user) {
                res.json({ success: true, user });
            } else {
                res.status(404).json({ success: false, error: 'User not found' });
            }
        } catch (err) {
            console.error('Error fetching user details:', err);
            res.status(500).json({ success: false, error: 'Failed to fetch user details' });
        }
    } else {
        res.status(401).json({ success: false, message: 'User not logged in' });
    }
}

// // 게시글과 댓글 정보 업데이트 함수
// const updatePostsAndComments = (userEmail, newNickname, profileImage) => {
//     fs.readFile(postsJsonPath, 'utf8', (err, data) => {
//         if (err) {
//             console.error('Error reading file:', err);
//             return;
//         }

//         let postsData = JSON.parse(data);

//         // 게시글 정보 업데이트
//         postsData.posts.forEach(post => {
//             if (post.author.email === userEmail) {
//                 post.author.nickname = newNickname;
//                 if (profileImage) {
//                     post.author.profile_picture = 'http://localhost:3001/' + profileImage.path;
//                 }
//             }

//             // 댓글 정보 업데이트
//             post.comments.forEach(comment => {
//                 if (comment.author.email === userEmail) {
//                     comment.author.nickname = newNickname;
//                     if (profileImage) {
//                         comment.author.profile_picture = 'http://localhost:3001/' + profileImage.path;
//                     }
//                 }
//             });
//         });

//         // 업데이트된 데이터 저장
//         fs.writeFile(postsJsonPath, JSON.stringify(postsData, null, 4), 'utf8', (err) => {
//             if (err) {
//                 console.error('Error writing file:', err);
//                 return;
//             }
//             console.log('Posts and comments updated successfully.');
//         });
//     });
// }

// sql 버전. 우선 보류
const updatePostsAndComments = async (userId, newNickname, profileImagePath) => {
    // try {
    //     await db.query('UPDATE posts SET author_nickname = ?, author_profile_picture = ? WHERE user_id = ?', [newNickname, profileImagePath, userId]);
    //     await db.query('UPDATE comments SET author_nickname = ?, author_profile_picture = ? WHERE user_id = ?', [newNickname, profileImagePath, userId]);
    // } catch (err) {
    //     console.error('Error updating posts and comments:', err);
    // }
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
    getCurrentUserEmail,
    currentUserEmailAndNickname,
};