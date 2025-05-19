const authSection = document.getElementById('authSection');
const loginBtn = document.getElementById('loginBtn');
const userDropdown = document.getElementById('userDropdown');
const userDropdownMenu = document.getElementById('userDropdownMenu');
const userAvatar = document.getElementById('userAvatar');
const userName = document.getElementById('userName');
const adminPage = document.getElementById('adminPage');

// Kiểm tra trạng thái đăng nhập khi trang được tải
document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.status) {
        // Người dùng đã đăng nhập
        loginBtn.classList.add('hidden');
        userDropdown.classList.remove('hidden');
        userAvatar.src = user.img || 'https://via.placeholder.com/40';
        userName.textContent = user.userName || 'User';
        
        // Kiểm tra quyền admin
        if (user.role === 'Admin') {
            adminPage.classList.remove('hidden');
        }
    } else {
        // Người dùng chưa đăng nhập
        loginBtn.classList.remove('hidden');
        userDropdown.classList.add('hidden');
    }
});

// Xử lý sự kiện click vào nút đăng nhập
loginBtn.addEventListener('click', () => {
    window.location.href = 'login.html';
});

// Hàm toggle dropdown menu
function toggleDropdown() {
    userDropdownMenu.classList.toggle('hidden');
}

// Đóng dropdown khi click ra ngoài
document.addEventListener('click', (event) => {
    if (!userDropdown.contains(event.target)) {
        userDropdownMenu.classList.add('hidden');
    }
});

// Hàm đăng xuất
function logout() {
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}