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

// URL에서 게시글 ID를 가져오는 함수
function getPostIdFromUrl() {
    const queryString = window.location.search; // id 반환 (ex. ?id=1)
    const urlParams = new URLSearchParams(queryString); // 쿼리문자열 해석
    return urlParams.get('id'); // 'id' 매개변수의 값을 가져옴
}

// 게시글 정보를 화면에 렌더링하는 함수
function renderPostDetails(post) {
    const postDetails = document.getElementById('postDetails');

    const formattedViews = formatNumber(post.views);
    const formattedComments = formatNumber(post.comments.length);

    const postHTML = `
        <h1 class="post-title">${post.title}</h1>
        <div class="info1">
            <div class="post-author-profile"><img src=${post.author.profile_picture} width="30px" height="30px"></div>
            <div class="author-name"><small><b>${post.author.nickname}</b></small></div>
            <div class="post-date"><small>${formatDateTime(post.date, post.time)}</small></div>

            <div class="edit-buttons">
                <a href="update-post?id=${post.id}"><button class="modify-button">수정</button></a>
                <button class="delete-button" onclick="showPostDeleteModal()">삭제</button>
            </div>
        </div>
        <hr>
        <section class="body">
            <img src="${post.image}" class="post-image" alt="post-image">
            <div class="post-text">${post.content}</div>
        </section>
        <section class="info2">
            <div class="info-hits">
                <div><b>${formattedViews}</b></div>
                <div><b><small>조회수</small></b></div>
            </div>
            <div class="info-comments">
                <div><b>${formattedComments}</b></div>
                <div><b><small>댓글</small></b></div>
            </div>
        </section>
        <hr>
        </section>
        <section class="comment-register-space">
            <textarea class="input-comment" placeholder="댓글을 남겨주세요!"></textarea>
            <hr>
            <button class="comment-register-button" onclick="registerComment()">댓글 등록</button>
        </section>
        <section class="comment-list-space">
            <!-- 댓글 목록이 여기에 동적으로 삽입됩니다 -->
        </section>
    `;
    postDetails.innerHTML = postHTML;

    // 댓글 목록을 가져오는 함수 호출
    fetchComments(post.comments);
}

// 게시글 ID를 가져와서 해당 게시글 정보를 요청하는 함수
function fetchPostDetails() {
    const postId = getPostIdFromUrl(); // 게시글 id를 가져옴
    fetch('../posts.json') // 게시글 정보 fetch
        .then(response => response.json())
        .then(data => {
            const post = data.posts.find(post => post.id === parseInt(postId));
            if (post) {
                renderPostDetails(post);
            } else {
                console.error('Post not found');
            }
        })
        .catch(error => console.error('Error fetching post details:', error));
}

// 댓글을 가져와서 화면에 렌더링하는 함수
function fetchComments(comments) {
    // querySelector: 문서에서 클래스가 "comment-list-space"인 첫 번째 요소 반환
    const commentListSpace = document.querySelector('.comment-list-space');

    comments.forEach(comment => {
        const commentHTML = `
            <section class="current-comment-info">
                <div class="comment-author-profile"><img src="${comment.author.profile_picture}" width="30px" height="30px"></div>
                <div class="author-name"><small><b>${comment.author.nickname}</b></small></div>
                <div class="post-date"><small>${formatDateTime(comment.date, comment.time)}</small></div>
                <div class="edit-buttons">
                    <button class="modify-button" onclick="editComment('${comment.id}', '${comment.content}')">수정</button>
                    <button class="delete-button" onclick="showCommentDeleteModal()">삭제</button>
                </div>
            </section>
            <section class="current-comment-text">
                <div><small>${comment.content}</small></div>
            </section>
        `;
        // insertAdjacentHTML: DOM에 HTML을 삽입하는 메서드
        // beforeend: 선택한 요소의 마지막 자식 요소로 HTML을 삽입
        commentListSpace.insertAdjacentHTML('beforeend', commentHTML);
    });
}

// 페이지가 로드되면 해당 게시글 정보를 가져와서 렌더링
window.onload = function () {
    fetchPostDetails();
};

// 숫자를 형식에 맞게 변환하는 함수
function formatNumber(number) {
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

// 게시글 삭제 모달 보이기
function showPostDeleteModal() {
    var modalBackground = document.getElementById('postDeleteModalBackground');
    var deleteModal = document.getElementById('postDeleteModal');

    modalBackground.style.display = 'block';
    deleteModal.style.display = 'block';

    // 백그라운드 스크롤 방지
    document.body.style.overflow = 'hidden';
}

// 게시글 삭제 모달 숨기기
function hidePostDeleteModal() {
    var modalBackground = document.getElementById('postDeleteModalBackground');
    var deleteModal = document.getElementById('postDeleteModal');

    modalBackground.style.display = 'none';
    deleteModal.style.display = 'none';

    // 백그라운드 스크롤 재개
    document.body.style.overflow = '';
}

// 댓글 삭제 모달 보이기
function showCommentDeleteModal() {
    var modalBackground = document.getElementById('commentDeleteModalBackground');
    var deleteModal = document.getElementById('commentDeleteModal');

    modalBackground.style.display = 'block';
    deleteModal.style.display = 'block';

    // 백그라운드 스크롤 방지
    document.body.style.overflow = 'hidden';
}

// 댓글 삭제 모달 숨기기
function hideCommentDeleteModal() {
    var modalBackground = document.getElementById('commentDeleteModalBackground');
    var deleteModal = document.getElementById('commentDeleteModal');

    modalBackground.style.display = 'none';
    deleteModal.style.display = 'none';

    // 백그라운드 스크롤 재개
    document.body.style.overflow = '';
}

// 댓글 수정
function editComment(commentId, commentContent) {
    const inputComment = document.querySelector('.input-comment');
    const registerButton = document.querySelector('.comment-register-button');

    inputComment.value = commentContent;
    registerButton.textContent = '댓글 수정';

    registerButton.onclick = function () {
        // // 수정된 내용을 변수에 저장
        // const newCommentContent = inputComment.value;

        // // 수정된 내용을 서버에 전송하고, 성공적으로 처리되면 댓글 목록을 다시 불러옴
        // fetch('../update-comment', {
        //     method: 'PUT',
        //     headers: {
        //         'Content-Type': 'application/json'
        //     },
        //     body: JSON.stringify({ commentId, newCommentContent }) // 수정된 내용과 댓글 ID를 전송
        // })
        //     .then(response => response.json())
        //     .then(data => {
        //         fetchComments(data.comments);
        //     })
        //     .catch(error => console.error('Error updating comment:', error));

        // 입력란 비우기
        inputComment.value = '';
        registerButton.textContent = '댓글 등록';
    };
}


// 댓글 등록
function registerComment() {
    const inputComment = document.querySelector('.input-comment');
    // const registerButton = document.querySelector('.comment-register-button');
    // const postId = getPostIdFromUrl();

    // // 새로운 댓글을 posts.json 파일에 저장하고, 성공적으로 처리되면 댓글 목록을 다시 렌더링합니다.
    // fetch('../posts.json', {
    //     method: 'POST',
    //     headers: {
    //         'Content-Type': 'application/json'
    //     },
    //     body: JSON.stringify({ postId, content: inputComment.value }) // 새로운 댓글 내용과 게시글 ID를 전송
    // })
    //     .then(response => response.json())
    //     .then(data => {
    //         fetchComments(data.posts.find(post => post.id === parseInt(postId)).comments);
    //     })
    //     .catch(error => console.error('Error registering comment:', error));

    // 입력란 비우기
    inputComment.value = '';
}

// 날짜와 시간을 형식에 맞게 변환하는 함수
function formatDateTime(date, time) {
    const dateTime = new Date(date + 'T' + time);
    return dateTime.toISOString().slice(0, 19).replace('T', ' ');
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