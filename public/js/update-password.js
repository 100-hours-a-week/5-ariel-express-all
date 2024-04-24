// 드롭다운 메뉴
function toggleDropdown() {
    var dropdownContent = document.getElementById("dropdownContent");
    if (dropdownContent.classList.contains("show")) {
        dropdownContent.classList.remove("show");
    } else {
        dropdownContent.classList.add("show");
    }
}

// 다른 곳을 클릭했을 때, 열러있는 드롭다운 닫기
window.onclick = function (event) {
    if (!event.target.matches('.profile-image')) {
        var dropdowns = document.getElementsByClassName("dropdown-content");
        for (var i = 0; i < dropdowns.length; i++) {
            var openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
    }
}

const passwordInput = document.getElementById('passwordInput');
const confirmPasswordInput = document.getElementById('confirmPasswordInput');
const passwordHelperText = document.getElementById('passwordHelperText')
const confirmPasswordHelperText = document.getElementById('confirmPasswordHelperText');

// 비밀번호 유효성 검사 함수
function validatePassword(tf) {
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
function validateConfirmPassword(tf) {
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

function validatePasswordStrength(password) {
    // 비밀번호는 8자 이상, 20자 이하여야 하고, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 함
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;
    return passwordRegex.test(password);
}

// 모든 input값 유효성 검사
async function validateAllInputs() {
    const passwordValid = await validatePassword(false);
    const confirmPasswordValid = await validateConfirmPassword(false);

    const modifyButton = document.getElementById('modifyButton');
    if (passwordValid && confirmPasswordValid) {
        modifyButton.disabled = false;
        modifyButton.style.backgroundColor = '#7F6AEE';
    } else {
        modifyButton.disabled = true;
        modifyButton.style.backgroundColor = '#ACA0EB';
    }
}

function showToast(message) {
    const toast = document.getElementById('toastMessage');
    if (toast) {
        toast.innerText = message;
        toast.style.display = 'block'; // 토스트 메시지 보이기

        // 3초 후에 토스트 메시지 숨기기
        setTimeout(function () {
            toast.style.display = 'none';
        }, 3000);
    } else {
        console.error('Toast message element not found.');
    }
}