// 드롭다운 메뉴
const toggleDropdown = () => {
    const dropdownContent = document.getElementById("dropdownContent");
    if (dropdownContent.classList.contains("show")) {
        dropdownContent.classList.remove("show");
    } else {
        dropdownContent.classList.add("show");
    }
}

// 다른 곳을 클릭했을 때, 열려있는 드롭다운 닫기
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
        const formattedLikes = formatNumber(post.likes_count);
        const formattedComments = formatNumber(post.comments_count);
        const formattedViews = formatNumber(post.views_count);

        const postHTML = `
            <section class="post">
                <a href="post-details?id=${post.post_id}">
                    <h1 class="post-title">${post.title}</h1>
                    <p class="post-information"><span class="post-reaction">좋아요 ${formattedLikes} 댓글 ${formattedComments} 조회수 ${formattedViews}</span><span
                            class="post-date">${formatDateTime(post.created_at)}</span></p>
                    <hr>
                    <div class="author">
                        <div class="author-profile" style="background-image: url('http://localhost:3001/${post.author_profile_picture}')"></div>
                        <div class="author-name"><small><b>${post.author_nickname}</b></small></div>
                    </div>
                </a>
            </section>
        `;
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
        return (number / 1000).toFixed(0) + 'k';
    } else if (number >= 10000) {
        return (number / 1000).toFixed(1) + 'k';
    } else if (number >= 1000) {
        return (number / 1000).toFixed(1) + 'k';
    } else {
        return number;
    }
}

// 날짜와 시간을 형식에 맞게 변환하는 함수
const formatDateTime = (dateTimeString) => {
    const dateTime = new Date(dateTimeString);
    if (isNaN(dateTime.getTime())) {
        return '';
    }
    const year = dateTime.getFullYear();
    const month = String(dateTime.getMonth() + 1).padStart(2, '0');
    const day = String(dateTime.getDate()).padStart(2, '0');
    const hours = String(dateTime.getHours()).padStart(2, '0');
    const minutes = String(dateTime.getMinutes()).padStart(2, '0');
    const seconds = String(dateTime.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

const logout = () => {
    fetch('http://localhost:3001/logout', {
        method: 'POST',
        credentials: 'include' // 쿠키를 포함하여 요청하기 위해 설정
    })
    .then(response => {
        if (response.ok) {
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

// 게시글 데이터 가져오기
fetch('http://localhost:3001/posts', {
    credentials: 'include' // 쿠키를 서버에 포함시키도록 설정
})
    .then(response => response.json())
    .then(data => renderPosts(data))
    .catch(error => console.error('Error fetching posts:', error));

// 페이지 로드 시 실행되는 함수
window.addEventListener("load", () => {
    if (!sessionStorage.getItem('loggedInUser')) {
        window.location.href = 'sign-in';
    }

    fetch('http://localhost:3001/get-profile-image', {
        credentials: 'include' // 쿠키를 서버에 포함시키도록 설정
    })
    .then(response => response.json())
    .then(data => {
        console.log("서버에서 전달받은 profileImagePath:", data.profileImagePath);
        const userProfileImage = document.getElementById("userProfileImage");
        userProfileImage.src = data.profileImagePath;
    })
    .catch(error => {
        console.error("Error:", error);
    });
});
