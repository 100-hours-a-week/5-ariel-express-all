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

// 게시글 데이터를 받아와서 게시글 목록 생성
const renderPosts = (posts) => {
    const postList = document.getElementById('postList');

    posts.forEach(post => {
        const formattedLikes = formatNumber(post.likes);
        const formattedComments = formatNumber(post.comments.length);
        const formattedViews = formatNumber(post.views);

        const postHTML = `
            <section class="post">
                <a href="post-details?id=${post.id}">
                    <h1 class="post-title">${post.title}</h1>
                    <p class="post-information"><span class="post-reaction">좋아요 ${formattedLikes} 댓글 ${formattedComments} 조회수 ${formattedViews}</span><span
                            class="post-date">${formatDateTime(post.date, post.time)}</span></p>
                    <hr>
                    <div class="author">
                        <div class="author-profile" style="background-image: url('${post.author.profile_picture}')"></div>
                        <div class="author-name"><small><b>${post.author.nickname}</b></small></div>
                    </div>
                </a>
            </section>
        `;
        // insertAdjacentHTML: DOM에 HTML을 삽입하는 메서드
        // beforeend: 선택한 요소의 마지막 자식 요소로 HTML을 삽입
        postList.insertAdjacentHTML('beforeend', postHTML);
    });

    limitPostTitleLength(); // 게시글 제목 글자 수 제한 함수 호출
}

// 게시글 제목 글자 수 제한 함수
const limitPostTitleLength = () => {
    const postTitles = document.querySelectorAll('.post-title');

    postTitles.forEach(title => {
        const maxLength = 26; // 최대 글자 수
        const text = title.textContent;
        if (text.length > maxLength) {
            title.textContent = text.substring(0, maxLength) + '...'; // 글자 수가 26자를 넘어가면 생략 부호 추가
        }
    });
}

// 숫자를 형식에 맞게 변환하는 함수
const formatNumber = (number) => {
    if (number >= 100000) {
        // toFixed(): 숫자를 지정된 소수점 이하 자릿수로 반올림한 후 문자열로 반환하는 메서드
        return (number / 1000).toFixed(0) + 'k';
    } else if (number >= 10000) {
        return (number / 1000).toFixed(1) + 'k';
    } else if (number >= 1000) {
        return (number / 1000).toFixed(1) + 'k';
    } else {
        return number;
    }
}

const formatDateTime = (date, time) => {
    // 날짜와 시간을 공백으로 구분하여 ISO 8601 형식의 문자열로 변환
    const isoDateTimeString = `${date}T${time}`;
    const dateTime = new Date(isoDateTimeString);
    // 만약 날짜와 시간이 유효하지 않다면 빈 문자열 반환
    if (isNaN(dateTime.getTime())) {
        return '';
    }
    // ISO 8601 형식에서 시간 정보를 추출하여 반환
    const year = dateTime.getFullYear();
    const month = String(dateTime.getMonth() + 1).padStart(2, '0');
    const day = String(dateTime.getDate()).padStart(2, '0');
    const hours = String(dateTime.getHours()).padStart(2, '0');
    const minutes = String(dateTime.getMinutes()).padStart(2, '0');
    const seconds = String(dateTime.getSeconds()).padStart(2, '0');
    // YYYY-MM-DD HH:MM:SS 형식으로 반환
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

const logout = () => {
    fetch('http://localhost:3001/logout', {
        method: 'POST',
        credentials: 'include' // 쿠키를 포함하여 요청하기 위해 설정
    })
    .then(response => {
        if (response.ok) {
            // 세션 및 쿠키 삭제 후 로그인 페이지로 이동
            sessionStorage.removeItem('loggedInUser');
            window.location.href = "/sign-in";
        } else {
            console.error('Failed to logout');
        }
    })
    .catch(error => {
        console.error('Error logging out:', error);
    });
}

// posts.json fetch
fetch('http://localhost:3001/posts')
    .then(response => response.json())
    .then(data => renderPosts(data.posts))
    .catch(error => console.error('Error fetching posts:', error));

// 페이지 로드 시 실행되는 함수
window.addEventListener("load", () => {
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