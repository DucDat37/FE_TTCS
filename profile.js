// API URLs
const API_BASE_URL = "http://localhost:5000/api";
const USERS_API = `${API_BASE_URL}/users`;
const UPLOAD_API = `${API_BASE_URL}/upload`;

// Khi trang đã tải xong
document.addEventListener('DOMContentLoaded', function() {
    // Kiểm tra trạng thái đăng nhập
    checkLoginStatus();
    
    // Tải thông tin người dùng
    loadUserProfile();
    
    // Thiết lập các sự kiện
    setupEventListeners();
});

// Kiểm tra trạng thái đăng nhập
function checkLoginStatus() {
    const token = localStorage.getItem('access_token');
    const userData = getUserDataFromStorage();
    
    if (!token || !userData) {
        // Chưa đăng nhập, chuyển hướng về trang đăng nhập
        window.location.href = 'index.html';
        return;
    }
    
    // Hiển thị thông tin người dùng trên header
    updateUserInfoInHeader(userData);
    
    // Kiểm tra quyền truy cập trang admin
    if (userData.roleName === "Admin" || userData.roleName === "Doctor") {
        document.getElementById('adminPage').classList.remove('hidden');
    }
}

// Lấy thông tin người dùng từ localStorage
function getUserDataFromStorage() {
    try {
        return JSON.parse(localStorage.getItem('user') || '{}');
    } catch (error) {
        console.error('Error parsing user data:', error);
        return {};
    }
}

// Cập nhật thông tin người dùng trên header
function updateUserInfoInHeader(userData) {
    const userNameElement = document.getElementById('userName');
    const userAvatarElement = document.getElementById('userAvatar');
    
    if (userNameElement && userData.userName) {
        userNameElement.textContent = userData.userName;
    }
    
    if (userAvatarElement && userData.img) {
        userAvatarElement.src = userData.img;
    }
}

// Tải thông tin người dùng từ API
async function loadUserProfile() {
    try {
        const token = localStorage.getItem('access_token');
        const userData = getUserDataFromStorage();
        
        if (!token || !userData || !userData.id) {
            showToast('Không tìm thấy thông tin người dùng', 'error');
            return;
        }
        
        // Hiển thị trạng thái loading
        document.getElementById('profileForm').classList.add('opacity-50');
        
        // Gọi API lấy thông tin người dùng
        const response = await fetch(`${USERS_API}/${userData.id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        
        // Kiểm tra trạng thái phản hồi
        if (response.status === 401) {
            // Token hết hạn
            localStorage.removeItem('access_token');
            localStorage.removeItem('user');
            window.location.href = 'index.html';
            return;
        }
        
        const result = await response.json();
        
        if (result.isError) {
            showToast(result.message || 'Không thể tải thông tin người dùng', 'error');
            return;
        }
        
        // Cập nhật thông tin lên giao diện
        updateProfileUI(result.data);
        
    } catch (error) {
        console.error('Error loading user profile:', error);
        showToast('Đã xảy ra lỗi khi tải thông tin người dùng', 'error');
    } finally {
        // Ẩn trạng thái loading
        document.getElementById('profileForm').classList.remove('opacity-50');
    }
}

// Cập nhật thông tin người dùng lên giao diện
function updateProfileUI(userData) {
    // Cập nhật thông tin cơ bản
    document.getElementById('profileName').textContent = userData.userName || 'Người dùng';
    document.getElementById('profileEmail').textContent = userData.email || '';
    
    if (userData.img) {
        document.getElementById('profileImage').src = userData.img;
        // Cập nhật giá trị URL ảnh trong input
        const avatarUrlInput = document.getElementById('avatarUrl');
        if (avatarUrlInput) {
            avatarUrlInput.value = userData.img;
        }
    }
    
    // Điền thông tin vào form
    document.getElementById('fullName').value = userData.userName || '';
    document.getElementById('email').value = userData.email || '';
    document.getElementById('phone').value = userData.phone || '';
    document.getElementById('address').value = userData.address || '';
    
    // Xử lý ngày sinh
    if (userData.birthDate) {
        const formattedDate = formatDateForInput(userData.birthDate);
        if (formattedDate) {
            document.getElementById('birthDate').value = formattedDate;
        }
    }
    
    // Xử lý giới tính
    const genderInputs = document.getElementsByName('gender');
    for (let i = 0; i < genderInputs.length; i++) {
        if ((genderInputs[i].value === 'true' && userData.gender === true) || 
            (genderInputs[i].value === 'false' && userData.gender === false)) {
            genderInputs[i].checked = true;
        }
    }
}

// Hàm format ngày sinh từ dd/mm/yyyy sang yyyy-mm-dd cho input type=date
function formatDateForInput(dateString) {
    if (!dateString) return '';
    
    // Nếu định dạng dd/mm/yyyy
    if (dateString.includes('/')) {
        const parts = dateString.split('/');
        if (parts.length === 3) {
            const day = parts[0].padStart(2, '0');
            const month = parts[1].padStart(2, '0');
            const year = parts[2];
            return `${year}-${month}-${day}`;
        }
    }
    
    // Thử chuyển đổi từ chuỗi date bất kỳ
    try {
        const date = new Date(dateString);
        if (!isNaN(date.getTime())) {
            return date.toISOString().split('T')[0];
        }
    } catch (error) {
        console.error('Error formatting date:', error);
    }
    
    return '';
}

// Thiết lập các sự kiện
function setupEventListeners() {
    // Form cập nhật thông tin cá nhân
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', handleProfileUpdate);
    }
    
    // Form đổi mật khẩu
    const passwordForm = document.getElementById('passwordForm');
    if (passwordForm) {
        passwordForm.addEventListener('submit', handlePasswordChange);
    }
    
    // Nút xem trước ảnh từ URL
    const previewUrlBtn = document.getElementById('previewUrlBtn');
    if (previewUrlBtn) {
        previewUrlBtn.addEventListener('click', function() {
            const url = document.getElementById('avatarUrl').value.trim();
            if (url) {
                previewImageFromUrl(url);
            } else {
                showToast('Vui lòng nhập URL hình ảnh', 'error');
            }
        });
    }
}

// Xử lý cập nhật thông tin cá nhân
async function handleProfileUpdate(event) {
    event.preventDefault();
    
    try {
        const token = localStorage.getItem('access_token');
        const userData = getUserDataFromStorage();
        
        if (!token || !userData || !userData.id) {
            showToast('Không tìm thấy thông tin người dùng', 'error');
            return;
        }
        
        // Lấy dữ liệu từ form
        const formData = new FormData(event.target);
        const userName = formData.get('userName');
        const email = formData.get('email');
        const phone = formData.get('phone');
        const birthDate = formData.get('birthDate');
        const gender = formData.get('gender') === 'true';
        const address = formData.get('address');
        const avatarUrl = formData.get('avatarUrl');
        
        // Validate dữ liệu
        if (!userName) {
            showToast('Vui lòng nhập họ và tên', 'error');
            return;
        }
        
        if (!email) {
            showToast('Vui lòng nhập email', 'error');
            return;
        }
        
        // Format ngày sinh từ yyyy-mm-dd sang dd/mm/yyyy
        let formattedBirthDate = '';
        if (birthDate) {
            const date = new Date(birthDate);
            if (!isNaN(date.getTime())) {
                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const year = date.getFullYear();
                formattedBirthDate = `${day}/${month}/${year}`;
            }
        }
        
        // Chuẩn bị dữ liệu để gửi lên API
        const updateData = {
            userName,
            email,
            phone,
            birthDate: formattedBirthDate,
            gender,
            address,
            img: avatarUrl || userData.img || '' // Sử dụng URL avatar mới nếu có
        };
        
        // Hiển thị trạng thái loading
        event.target.classList.add('opacity-50');
        
        // Gọi API cập nhật thông tin
        const response = await fetch(`${USERS_API}/update-by-self`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(updateData)
        });
        
        // Kiểm tra trạng thái phản hồi
        if (response.status === 401) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('user');
            window.location.href = 'index.html';
            return;
        }
        
        const result = await response.json();
        
        if (result.isError) {
            showToast(result.message || 'Cập nhật thông tin thất bại', 'error');
            return;
        }
        
        // Cập nhật thông tin trong localStorage
        localStorage.setItem('user', JSON.stringify({
            ...userData,
            userName,
            email,
            phone,
            birthDate: formattedBirthDate,
            gender,
            address,
            img: avatarUrl || userData.img
        }));
        
        // Cập nhật giao diện
        document.getElementById('profileName').textContent = userName;
        document.getElementById('userName').textContent = userName;
        
        // Cập nhật ảnh đại diện nếu có thay đổi
        if (avatarUrl && avatarUrl !== userData.img) {
            document.getElementById('profileImage').src = avatarUrl;
            document.getElementById('userAvatar').src = avatarUrl;
        }
        
        showToast('Cập nhật thông tin thành công', 'success');
        
    } catch (error) {
        console.error('Error updating profile:', error);
        showToast('Đã xảy ra lỗi khi cập nhật thông tin', 'error');
    } finally {
        // Ẩn trạng thái loading
        event.target.classList.remove('opacity-50');
    }
}

// Xử lý đổi mật khẩu
async function handlePasswordChange(event) {
    event.preventDefault();
    
    try {
        const token = localStorage.getItem('access_token');
        const userData = getUserDataFromStorage();
        
        if (!token || !userData || !userData.id) {
            showToast('Không tìm thấy thông tin người dùng', 'error');
            return;
        }
        
        // Lấy dữ liệu từ form
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        // Validate dữ liệu
        if (!currentPassword) {
            showToast('Vui lòng nhập mật khẩu hiện tại', 'error');
            return;
        }
        
        if (!newPassword) {
            showToast('Vui lòng nhập mật khẩu mới', 'error');
            return;
        }
        
        if (newPassword.length < 6) {
            showToast('Mật khẩu mới phải có ít nhất 6 ký tự', 'error');
            return;
        }
        
        if (newPassword !== confirmPassword) {
            showToast('Mật khẩu xác nhận không khớp', 'error');
            return;
        }
        
        // Chuẩn bị dữ liệu để gửi lên API
        const passwordData = {
            currentPassword,
            newPassword
        };
        
        // Hiển thị trạng thái loading
        event.target.classList.add('opacity-50');
        
        // Gọi API đổi mật khẩu
        const response = await fetch(`${USERS_API}/change-password/${userData.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(passwordData)
        });
        
        // Kiểm tra trạng thái phản hồi
        if (response.status === 401) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('user');
            window.location.href = 'index.html';
            return;
        }
        
        const result = await response.json();
        
        if (result.isError) {
            showToast(result.message || 'Đổi mật khẩu thất bại', 'error');
            return;
        }
        
        // Reset form
        event.target.reset();
        
        showToast('Đổi mật khẩu thành công', 'success');
        
    } catch (error) {
        console.error('Error changing password:', error);
        showToast('Đã xảy ra lỗi khi đổi mật khẩu', 'error');
    } finally {
        // Ẩn trạng thái loading
        event.target.classList.remove('opacity-50');
    }
}

// Xem trước ảnh từ URL
function previewImageFromUrl(url) {
    if (!url) return;
    
    const previewImage = document.getElementById('previewImage');
    if (!previewImage) return;
    
    previewImage.src = url;
    previewImage.classList.remove('hidden');
    
    // Xử lý lỗi nếu URL không hợp lệ
    previewImage.onerror = function() {
        previewImage.classList.add('hidden');
        showToast('Không thể tải hình ảnh từ URL này', 'error');
    };
}

// Hiển thị thông báo
function showToast(message, type = 'success') {
    const toastContainer = document.getElementById('toastContainer');
    
    // Tạo toast
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    // Xác định icon theo loại thông báo
    let icon = '';
    switch (type) {
        case 'success':
            icon = 'fas fa-check-circle';
            break;
        case 'error':
            icon = 'fas fa-exclamation-circle';
            break;
        default:
            icon = 'fas fa-info-circle';
    }
    
    // Tạo nội dung toast
    toast.innerHTML = `
        <span class="toast-icon">
            <i class="${icon}"></i>
        </span>
        <span class="toast-content">${message}</span>
        <span class="toast-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </span>
    `;
    
    // Thêm toast vào container
    toastContainer.appendChild(toast);
    
    // Tự động xóa toast sau 5 giây
    setTimeout(() => {
        toast.remove();
    }, 5000);
}

// Đăng xuất
function logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

// Mở/đóng dropdown menu
function toggleDropdown() {
    const menu = document.getElementById('userDropdownMenu');
    menu.classList.toggle('hidden');
}

// Bắt sự kiện click ra ngoài để đóng dropdown
document.addEventListener('click', function(event) {
    const dropdown = document.getElementById('userDropdown');
    const menu = document.getElementById('userDropdownMenu');
    
    if (dropdown && menu && !dropdown.contains(event.target) && !menu.classList.contains('hidden')) {
        menu.classList.add('hidden');
    }
}); 