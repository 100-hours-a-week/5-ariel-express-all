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

// 게시글 데이터를 받아와서 게시글 목록 생성
function renderPosts(posts) {
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
function limitPostTitleLength() {
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
function formatNumber(number) {
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

// 날짜와 시간을 형식에 맞게 변환하는 함수
function formatDateTime(date, time) {
    const dateTime = new Date(date + 'T' + time);
    return dateTime.toISOString().slice(0, 19).replace('T', ' ');
}

// posts.json fetch
fetch('../posts.json')
    .then(response => response.json())
    .then(data => renderPosts(data.posts))
    .catch(error => console.error('Error fetching posts:', error));