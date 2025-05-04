// Tạo và chèn avatar dropdown vào các trang
function createAvatarDropdown() {
    const avatarContainer = document.querySelector('.avatar');
    if (!avatarContainer) return;

    // Tạo HTML cho avatar dropdown
    const dropdownHTML = `
        <div class="relative">
            <div class="flex items-center cursor-pointer" onclick="toggleDropdown(event)">
                <img id="userAvatar" src="https://i.pinimg.com/736x/4f/a9/f9/4fa9f9916731730fa5530958d3082548.jpg" alt="User Avatar" class="rounded-full mr-2 w-10 h-10">
                <span class="text-gray-700">User</span>
            </div>
            <div id="dropdownMenu" class="dropdown-menu">
                <a href="" class="dropdown-item">
                    <i class="fas fa-user mr-2"></i>Profile
                </a>
                <a href="index.html" class="dropdown-item">
                    <i class="fas fa-home mr-2"></i>Home Page
                </a>
                <div class="dropdown-divider"></div>
                <a href="#" class="dropdown-item text-red-600" onclick="handleLogout()">
                    <i class="fas fa-sign-out-alt mr-2"></i>Logout
                </a>
            </div>
        </div>
    `;

    // Chèn HTML vào container
    avatarContainer.innerHTML = dropdownHTML;

    // Thêm CSS styles
    const style = document.createElement('style');
    style.textContent = `
        .dropdown-menu {
            display: none;
            position: absolute;
            right: 0;
            top: 100%;
            background-color: white;
            min-width: 160px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            border-radius: 4px;
            z-index: 9000;
            margin-top: 0.5rem;
        }
        .dropdown-menu.show {
            display: block;
        }
        .dropdown-item {
            padding: 8px 16px;
            color: #333;
            text-decoration: none;
            display: block;
            white-space: nowrap;
        }
        .dropdown-item:hover {
            background-color: #f5f5f5;
        }
        .dropdown-divider {
            height: 1px;
            background-color: #e5e5e5;
            margin: 4px 0;
        }
    `;
    document.head.appendChild(style);

    // Thêm event listeners
    document.addEventListener('click', function(event) {
        const dropdownMenu = document.getElementById('dropdownMenu');
        const dropdownToggle = document.querySelector('.cursor-pointer');
        
        if (!dropdownToggle.contains(event.target) && dropdownMenu.classList.contains('show')) {
            dropdownMenu.classList.remove('show');
        }
    });

    document.getElementById('dropdownMenu').addEventListener('click', function(event) {
        event.stopPropagation();
    });

    // Cập nhật thông tin người dùng
    updateUserInfo();
}

// Hàm toggle dropdown
function toggleDropdown(event) {
    if (event) {
        event.stopPropagation();
    }
    const dropdownMenu = document.getElementById('dropdownMenu');
    dropdownMenu.classList.toggle('show');
}

// Hàm xử lý logout
function handleLogout() {
    // Xóa token và thông tin người dùng
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    
    // Chuyển hướng về trang chủ
    window.location.href = 'index.html';
}

// Cập nhật thông tin người dùng
function updateUserInfo() {
    const token = localStorage.getItem('access_token');
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    
    const userAvatar = document.getElementById('userAvatar');
    const userNameElement = document.querySelector('.cursor-pointer span');
    
    if (token && userData) {
        // Đã đăng nhập
        // Cập nhật thông tin người dùng
        if (userData.img) {
            userAvatar.src = userData.img;
        }
        
        if (userData.userName) {
            userNameElement.textContent = userData.userName;
        } 
        else if (userData.role === 'Admin') {
            userNameElement.textContent = 'Admin';
        }
    } else {
        // Chưa đăng nhập, chuyển hướng về trang đăng nhập
        window.location.href = 'auth.html';
    }
}

// Khởi tạo khi DOM đã sẵn sàng
document.addEventListener('DOMContentLoaded', createAvatarDropdown); 