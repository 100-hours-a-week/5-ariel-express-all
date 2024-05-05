// 드롭다운 메뉴
const toggleDropdown = () => {
    const dropdownContent = document.getElementById("dropdownContent");
    if (dropdownContent.classList.contains("show")) {
        dropdownContent.classList.remove("show");
    } else {
        dropdownContent.classList.add("show");
    }
}

// 다른 곳을 클릭했을 때, 열러있는 드롭다운 닫기
window.onclick = (event) => {
    if (!event.target.matches('.profile-image')) {
        const dropdowns = document.getElementsByClassName("dropdown-content");
        for (let i = 0; i < dropdowns.length; i++) {
            const openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
    }
}

const logout = () => {
    sessionStorage.removeItem('loggedInUser');
    window.location.href = "/sign-in";
}

const passwordInput = document.getElementById('passwordInput');
const confirmPasswordInput = document.getElementById('confirmPasswordInput');
const passwordHelperText = document.getElementById('passwordHelperText')
const confirmPasswordHelperText = document.getElementById('confirmPasswordHelperText');
const modifyButton = document.getElementById('modifyButton');

// 비밀번호 유효성 검사 함수
const validatePassword = (tf) => {
    const passwordValue = passwordInput.value.trim();
    const confirmPasswordValue = confirmPasswordInput.value.trim();

    if (passwordValue === '') {
        if (tf === true) {
            passwordHelperText.textContent = '* 비밀번호를 입력해주세요.';
            passwordHelperText.style.visibility = 'visible';
        }
        return false;
    }
    else if (!validatePasswordStrength(passwordValue)) {
        if (tf === true) {
            passwordHelperText.textContent = '* 비밀번호는 8자 이상, 20자 이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.';
            passwordHelperText.style.visibility = 'visible';
        }
        return false;
    }
    else if (document.getElementById('confirmPasswordInput').value !== '' && passwordValue !== confirmPasswordValue) {
        if (tf === true) {
            passwordHelperText.textContent = '* 비밀번호 확인과 다릅니다.';
            passwordHelperText.style.visibility = 'visible';
        }
        return false;
    }
    else {
        passwordHelperText.textContent = '* 통과';
        passwordHelperText.style.visibility = 'hidden';
        return true;
    }
}

// 비밀번호 확인 유효성 검사
const validateConfirmPassword = (tf) => {
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
        confirmPasswordHelperText.textContent = '* 통과';
        confirmPasswordHelperText.style.visibility = 'hidden';
        return true;
    }
}

const validatePasswordStrength = (password) => {
    // 비밀번호는 8자 이상, 20자 이하여야 하고, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 함
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;
    return passwordRegex.test(password);
}

// 모든 input값 유효성 검사
const validateAllInputs = async () => {
    const passwordValid = await validatePassword(false);
    const confirmPasswordValid = await validateConfirmPassword(false);

    if (passwordValid && confirmPasswordValid) {
        modifyButton.disabled = false;
        modifyButton.style.backgroundColor = '#7F6AEE';
    } else {
        modifyButton.disabled = true;
        modifyButton.style.backgroundColor = '#ACA0EB';
    }
}

const showToast = (message) => {
    const toast = document.getElementById('toastMessage');
    if (toast) {
        toast.innerText = message;
        toast.style.display = 'block'; // 토스트 메시지 보이기

        // 3초 후에 토스트 메시지 숨기기
        setTimeout( () => {
            toast.style.display = 'none';
        }, 3000);
    } else {
        console.error('Toast message element not found.');
    }
}

// update-password.js
// 사용자가 비밀번호를 수정하고 수정하기 버튼을 클릭했을 때 실행되는 함수
const updatePassword = async () => {

    if (passwordHelperText.textContent === "* 통과" && confirmPasswordHelperText.textContent === '* 통과') {
        newPassword = passwordInput.value;
        console.log(`변경된 비밀번호: ${newPassword}`);

        // 서버로 비밀번호 업데이트 요청 전송
        try {
            const response = await fetch('http://localhost:3001/update-password', {
                credentials: 'include',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ newPassword })
            });
            const data = await response.json();
            if (data.success) {
                alert('비밀번호 수정 완료');
                window.location.href = 'list-of-posts'
                passwordInput.value = '';
                confirmPasswordInput.value = '';
            } else {
                showToast("비밀번호 업데이트 실패: " + data.error);
            }
        } catch (error) {
            console.error("Error:", error);
            showToast("오류가 발생했습니다.");
        }
    }
}

// 페이지 로드 시 실행되는 함수
window.addEventListener("load", () => {
    // 로그인 되지 않은 상태라면 접근 불가! 로그인 페이지로 이동
    if (!sessionStorage.getItem('loggedInUser')) {
        window.location.href = 'sign-in';
    }
    
    // 서버에 요청을 보낼 때 쿠키를 포함시켜서 전송
    fetch('http://localhost:3001/get-profile-image', {
        credentials: 'include' // 쿠키를 서버에 포함시키도록 설정
    })
    .then(response => response.json()) // 응답을 JSON으로 변환
    .then(data => {
        // 서버에서 전달받은 프로필 이미지 경로를 콘솔에 출력
        console.log("서버에서 전달받은 profileImagePath:", data.profileImagePath);

        // 프로필 이미지를 업데이트
        const userProfileImage = document.getElementById("userProfileImage");
        userProfileImage.src = data.profileImagePath;
    })
    .catch(error => {
        console.error("Error:", error);
    });
});