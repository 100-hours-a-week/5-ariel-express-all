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

    let postImageHTML = ''; // 이미지 HTML 초기화

    // post.image가 null이 아닌 경우에만 이미지 HTML을 생성
    if (post.image !== null) {
        postImageHTML = `<img src="${post.image}" class="post-image" alt="post-image">`;
    }

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
            ${postImageHTML} <!-- 이미지 HTML 삽입 -->
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
    fetch('/backend/model/posts.json') // 게시글 정보 fetch
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
                    <button class="delete-button" onclick="showCommentDeleteModal('${comment.id}')">삭제</button>
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
function showCommentDeleteModal(commentId) {
    var modalBackground = document.getElementById('commentDeleteModalBackground');
    var deleteModal = document.getElementById('commentDeleteModal');

    modalBackground.style.display = 'block';
    deleteModal.style.display = 'block';

    // 삭제할 댓글의 ID를 모달에 설정
    deleteModal.dataset.commentId = commentId;

    // 게시글 ID 가져오기
    const postId = getPostIdFromUrl();

    // 백그라운드 스크롤 방지
    document.body.style.overflow = 'hidden';

    // confirmDeleteComment 함수 호출
    confirmDeleteComment(postId);
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

// 댓글 삭제 확인 모달에서 삭제 버튼 클릭 시 실행되는 함수
function confirmDeleteComment(postId) {
    // 삭제할 댓글의 ID를 모달에서 가져옴
    const commentId = document.getElementById('commentDeleteModal').dataset.commentId;

    // 삭제 버튼을 클릭했을 때만 삭제 요청을 보냄
    const deleteButton = document.getElementById('deleteCommentButton');
    deleteButton.onclick = function() {
        // 서버에 해당 댓글을 삭제하는 요청을 보냄
        fetch('/delete-comment', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ postId, commentId }) // 게시글 ID와 삭제할 댓글의 ID를 전송
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // 삭제가 성공했을 경우 화면에서 해당 댓글을 제거
                //removeCommentFromUI(commentId);
                // 댓글 삭제 모달을 숨김
                hideCommentDeleteModal();

                location.reload();
                fetchComments(postId.comments);
                showToast('댓글이 삭제되었습니다.');
            } else {
                console.error('Failed to delete comment:', data.error);
            }
        })
        .catch(error => console.error('Error deleting comment:', error));
    };
}

// 댓글 삭제 모달에서 삭제 버튼 클릭 시 confirmDeleteComment 함수 호출
document.getElementById('commentDeleteModalBackground').addEventListener('click', confirmDeleteComment);

// 댓글 수정
function editComment(commentId, commentContent) {
    const inputComment = document.querySelector('.input-comment');
    const registerButton = document.querySelector('.comment-register-button');
    const postId = getPostIdFromUrl(); // 게시글 id를 가져옴

    inputComment.value = commentContent;
    registerButton.textContent = '댓글 수정';

    registerButton.onclick = function () {
        // 댓글 수정 버튼 클릭 시 동작
        const updatedCommentContent = inputComment.value;
        updateComment(postId, commentId, updatedCommentContent); // postId를 함께 전달
    };
}


// 댓글 업데이트
// function updateComment(postId, commentId, updatedCommentContent) {
//     // 댓글 업데이트 로직 추가
//     const commentListSpace = document.querySelector('.comment-list-space');
//     const commentToUpdate = commentListSpace.querySelector(`[data-comment-id="${commentId}"]`);


//     // 댓글 업데이트 API 호출 및 성공 시 댓글 목록 다시 렌더링
//     // 예시로 fetch를 사용하며, 실제로는 백엔드와의 통신 로직에 맞게 수정 필요
//     // fetch('/update-comment', {
//     //     method: 'PUT',
//     //     headers: {
//     //         'Content-Type': 'application/json'
//     //     },
//     //     body: JSON.stringify({ commentId, content: updatedCommentContent })
//     // })
//     // .then(response => response.json())
//     // .then(data => {
//     //     if (data.success) {
//     //         // 성공적으로 댓글이 업데이트된 경우
//     //         // 댓글 목록을 다시 가져와서 렌더링
//     //         fetchComments(data.updatedComments);
//     //     } else {
//     //         console.error('Failed to update comment:', data.error);
//     //     }
//     // })
//     // .catch(error => console.error('Error updating comment:', error));
//     console.log(postId, commentId, updatedCommentContent)
// }

// 댓글 업데이트
function updateComment(postId, commentId, updatedCommentContent) {
    // /backend/model/posts.json에서 댓글 정보 가져오기
    fetch('/backend/model/posts.json')
        .then(response => response.json())
        .then(data => {
            // postId에 해당하는 게시글 찾기
            const post = data.posts.find(post => post.id === parseInt(postId));
            if (post) {
                // 댓글 목록에서 commentId에 해당하는 댓글 찾기
                const comment = post.comments.find(comment => comment.id === parseInt(commentId));
                if (comment) {
                    // 찾은 댓글의 내용 업데이트
                    comment.content = updatedCommentContent;
                    // 콘솔에 댓글 내용 출력
                    console.log("게시글 ID:", postId);
                    console.log("댓글 ID:", commentId);
                    console.log("업데이트된 댓글 내용:", updatedCommentContent);

                    // 서버에 댓글 업데이트를 요청합니다.
                    fetch('/update-comment', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ postId, commentId, content: updatedCommentContent })
                    })
                        .then(response => response.json())
                        .then(data => {
                            if (data.success) {
                                // 성공적으로 댓글이 업데이트된 경우
                                // 리로드 & 댓글 목록을 다시 가져와서 렌더링
                                location.reload();
                                fetchComments(data.updatedComments);
                            } else {
                                console.error('Failed to update comment:', data.error);
                            }
                        })
                        .catch(error => console.error('Error updating comment:', error));
                } else {
                    console.error('Comment not found');
                }
            } else {
                console.error('Post not found');
            }
        })
        .catch(error => console.error('Error updating comment:', error));
}


// 댓글 등록
function registerComment() {
    const inputComment = document.querySelector('.input-comment');
    const registerButton = document.querySelector('.comment-register-button');
    const postId = getPostIdFromUrl();

    // 댓글 수정 버튼이 댓글 등록 버튼으로 변경되었을 때
    if (registerButton.textContent === '댓글 수정') {
        // 수정 중인 댓글을 업데이트합니다.
        const updatedCommentContent = inputComment.value;
        // 수정된 댓글 내용과 함께 댓글 업데이트 함수를 호출합니다.
        updateComment(commentId, updatedCommentContent);
    } else {
        // 기존의 댓글 등록 로직을 그대로 사용합니다.
        // fetch('/backend/model/posts.json', {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json'
        //     },
        //     body: JSON.stringify({ postId, content: inputComment.value }) // 새로운 댓글 내용과 게시글 ID를 전송
        // })
        // .then(response => response.json())
        // .then(data => {
        //     fetchComments(data.posts.find(post => post.id === parseInt(postId)).comments);
        // })
        // .catch(error => console.error('Error registering comment:', error));

        // // 입력란 비우기
        // inputComment.value = '';
        // 현재 시간을 가져오는 함수
        function getCurrentDateTime() {
            const now = new Date();
            const year = now.getFullYear();
            const month = (now.getMonth() + 1).toString().padStart(2, '0'); // 월은 0부터 시작하므로 +1 필요
            const day = now.getDate().toString().padStart(2, '0');
            const hours = now.getHours().toString().padStart(2, '0');
            const minutes = now.getMinutes().toString().padStart(2, '0');
            const seconds = now.getSeconds().toString().padStart(2, '0');
            return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        }

        // 새로운 댓글 객체 생성
        const newComment = {
            id: null, // 서버에서 설정될 것이므로 일단 null로 설정
            author: {
                profile_picture: "../../public/assets/images/user1.png",
                nickname: "test"
            },
            date: getCurrentDateTime().split(' ')[0], // 현재 날짜
            time: getCurrentDateTime().split(' ')[1], // 현재 시간
            content: inputComment.value // 입력한 댓글 내용
        };

        // 서버에 새로운 댓글 등록 요청 보내기
        fetch('/add-comment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ postId, content: newComment.content }) // 게시글 ID와 새로운 댓글 데이터 전송
        })
            .then(response => response.json())
            .then(data => {
                // 새로운 댓글 ID를 서버에서 받아와서 설정
                newComment.id = data.commentId;
                // 화면에 새로운 댓글 추가
                // fetchComments(postId.comments);
                // 입력란 비우기
                inputComment.value = '';

                location.reload();
                fetchComments(postId.comments);
            })
            .catch(error => console.error('Error registering comment:', error));

    }
}

// 날짜와 시간을 형식에 맞게 변환하는 함수
function formatDateTime(date, time) {
    // 날짜와 시간을 공백으로 구분하여 ISO 8601 형식의 문자열로 변환
    const isoDateTimeString = `${date}T${time}`;
    const dateTime = new Date(isoDateTimeString);
    // 만약 날짜와 시간이 유효하지 않다면 빈 문자열 반환
    if (isNaN(dateTime.getTime())) {
        return '';
    }
    // ISO 8601 형식에서 시간 정보를 추출하여 반환
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