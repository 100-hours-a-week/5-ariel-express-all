const profileImageInput = document.getElementById('profileImageInput');
const profilePreview = document.getElementById("profilePreview");
const profileImageHelperText = document.getElementById("profileImageHelperText");
const signupForm = document.getElementById("signupForm");

// 프로필 사진 설정
profileImageInput.addEventListener("change", (event) => {
    const file = event.target.files[0]; // 선택된 파일을 가져옴
    if (file) {
        const reader = new FileReader(); // FileReader: 파일을 읽기 위한 객체
        reader.onload = (e) => { // 파일 로드가 완료되었을 때 이벤트 처리
            profilePreview.src = e.target.result; // 프로필 미리보기 이미지 변경
        }
        reader.readAsDataURL(file); // 파일을 읽어 data URL로 변환하여 반환. (파일의 내용을 문자열로 표현)
        profileImageHelperText.style.visibility = 'hidden';
    } else {
        profilePreview.src = "../assets/images/button-add-profile-image.png"; // 파일이 선택되지 않았다면 기본 이미지로 복원
    }
});


const emailInput = document.getElementById('emailInput');
const emailHelperText = document.getElementById('emailHelperText');
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// 이메일 input에서 포커스 아웃될 때마다 유효성 검사
emailInput.addEventListener('blur', () => {
    validateEmail(true).then(valid => {
        validateAllInputs();
    });
});

// 이메일 유효성 검사
const validateEmail = async (tf) => {
    const emailValue = emailInput.value.trim();

    if (emailValue === '') {
        if (tf === true) {
            emailHelperText.style.color = "red";
            emailHelperText.textContent = '* 이메일을 입력해주세요.';
            emailHelperText.style.visibility = "visible";
        }
        return false;
    } else if (!emailRegex.test(emailValue)) {
        if (tf === true) {
            emailHelperText.style.color = "red";
            emailHelperText.textContent = '* 올바른 이메일 주소 형식을 입력해주세요.';
            emailHelperText.style.visibility = "visible";
        }
        return false;
    } else {
        try {
            const response = await fetch("http://localhost:3001/users"); // 사용자 정보 fetch
            const data = await response.json();
            const existingEmail = data.find(user => user.email === emailValue);
            if (existingEmail) {
                if (tf === true) {
                    emailHelperText.style.color = "red";
                    emailHelperText.textContent = '* 중복된 이메일입니다.';
                    emailHelperText.style.visibility = "visible";
                }
                return false;
            } else {
                if (tf === true) {
                    emailHelperText.style.visibility = "hidden";
                }
                return true;
            }
        } catch (error) {
            console.error("Error:", error);
            alert("회원가입 중 오류가 발생했습니다.");
            return false;
        }
    }
}

const passwordInput = document.getElementById('passwordInput');
const passwordHelperText = document.getElementById('passwordHelperText');

passwordInput.addEventListener('blur', () => {
    validatePassword(true).then(valid => {
        validateAllInputs();
    });
});

const validatePassword = async (tf) => {
    const passwordValue = passwordInput.value.trim();

    if (passwordValue === '') {
        if (tf === true) {
            passwordHelperText.textContent = '* 비밀번호를 입력해주세요.';
            passwordHelperText.style.visibility = 'visible';
        }
        return false;
    } else if (!validatePasswordStrength(passwordValue)) {
        if (tf === true) {
            passwordHelperText.textContent = '* 비밀번호는 8자 이상, 20자 이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.';
            passwordHelperText.style.visibility = 'visible';
        }
        return false;
    } else {
        if (tf === true) {
            passwordHelperText.style.visibility = 'hidden';
        }
        return true;
    }
}


const confirmPasswordInput = document.getElementById('confirmPasswordInput');
const confirmPasswordHelperText = document.getElementById('confirmPasswordHelperText');

// 비밀번호 input에서 포커스 아웃될 때마다 유효성 검사
confirmPasswordInput.addEventListener('blur', async () => {
    validateConfirmPassword(true).then(valid => {
        validateAllInputs();
    });
});

// 비밀번호 유효성 검사
const validateConfirmPassword = async (tf) => {
    const passwordValue = passwordInput.value.trim();
    const confirmPasswordValue = confirmPasswordInput.value.trim();

    if (confirmPasswordValue === '') {
        if (tf === true) {
            confirmPasswordHelperText.textContent = '* 비밀번호를 한번 더 입력해주세요.';
            confirmPasswordHelperText.style.visibility = 'visible';
        }
        return false;
    } else if (passwordValue !== confirmPasswordValue) {
        if (tf === true) {
            confirmPasswordHelperText.textContent = '* 비밀번호가 다릅니다.';
            confirmPasswordHelperText.style.visibility = 'visible';
        }
        return false;
    } else {
        if (tf === true) {
            confirmPasswordHelperText.style.visibility = 'hidden';
        }
        return true;
    }
}


const nicknameInput = document.getElementById('nicknameInput');
const nicknameHelperText = document.getElementById('nicknameHelperText');

// 닉네임 input에서 포커스 아웃될 때마다 유효성 검사
nicknameInput.addEventListener('blur', async () => {
    validateNickname(true).then(valid => {
        validateAllInputs();
    });
});

// 닉네임 유효성 검사
const validateNickname = async (tf) => {
    const nicknameValue = nicknameInput.value.trim();

    if (nicknameValue === '') {
        if (tf === true) {
            nicknameHelperText.textContent = '* 닉네임을 입력해주세요.';
            nicknameHelperText.style.visibility = 'visible';
        }
        return false;
    } else if (nicknameValue.includes(' ')) {
        if (tf === true) {
            nicknameHelperText.textContent = '* 띄어쓰기를 없애주세요.';
            nicknameHelperText.style.visibility = 'visible';
        }
        return false;
    } else if (nicknameValue.length > 10) {
        if (tf === true) {
            nicknameHelperText.textContent = '* 닉네임은 최대 10자까지 작성 가능합니다.';
            nicknameHelperText.style.visibility = 'visible';
        }
        return false;
    } else {
        try {
            const response = await fetch("http://localhost:3001/users");// 사용자 정보 fetch
            const data = await response.json();
            const existingNickname = data.find(user => user.nickname === nicknameValue);
            if (existingNickname) {
                if (tf === true) {
                    nicknameHelperText.textContent = '* 중복된 닉네임입니다.';
                    nicknameHelperText.style.visibility = 'visible';
                }
                return false;
            } else {
                if (tf === true) {
                    nicknameHelperText.style.visibility = 'hidden';
                }
                return true;
            }
        } catch (error) {
            console.error("Error:", error);
            alert("회원가입 중 오류가 발생했습니다.");
            return false;
        }
    }
}

const validatePasswordStrength = (password) => {
    // 비밀번호는 8자 이상, 20자 이하여야 하고, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 함
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;
    return passwordRegex.test(password);
}


// input 값 전체 유효성 검사 함수
const validateAllInputs = async () => {
    const emailValid = await validateEmail(false);
    const passwordValid = await validatePassword(false);
    const confirmPasswordValid = await validateConfirmPassword(false);
    const nicknameValid = await validateNickname(false);

    const signupButton = document.getElementById('signupButton');
    // 모든 input 값 유효성 통과: 버튼 색상 변경 + 활성화
    if (emailValid && passwordValid && confirmPasswordValid && nicknameValid) {
        signupButton.disabled = false;
        signupButton.style.backgroundColor = '#7F6AEE';
    } else {
        signupButton.disabled = true;
        signupButton.style.backgroundColor = '#ACA0EB';
    }
}

// 폼 제출 전 프로필 사진 첨부 여부 확인
signupForm.addEventListener('submit', (event) => {
    if (!profileImageInput.files[0]) {
        profileImageHelperText.textContent = '* 프로필 사진을 추가해주세요.';
        profileImageHelperText.style.visibility = 'visible';
        event.preventDefault(); // 기본 동작(폼 제출)을 막음 (불필요한 요청 전송 방지)
    }
    else {
        profileImageHelperText.style.visibility = 'hidden';
    }
});