// Khởi tạo các biểu đồ khi DOM đã sẵn sàng
document.addEventListener('DOMContentLoaded', function() {
    // Appointments Chart
    const appointmentsCtx = document.getElementById('appointmentsChart').getContext('2d');
    new Chart(appointmentsCtx, {
        type: 'line',
        data: {
            labels: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
            datasets: [{
                label: 'Số lịch khám',
                data: [65, 59, 80, 81, 56, 55, 40],
                fill: false,
                borderColor: '#4a90e2',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                }
            }
        }
    });

    // Revenue Chart
    const revenueCtx = document.getElementById('revenueChart').getContext('2d');
    new Chart(revenueCtx, {
        type: 'bar',
        data: {
            labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
            datasets: [{
                label: 'Doanh thu (triệu VNĐ)',
                data: [12, 19, 3, 5, 2, 3, 7],
                backgroundColor: '#4a90e2'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                }
            }

        }
    });

    // Kiểm tra trạng thái đăng nhập và hiển thị thông tin người dùng
    checkLoginStatus();
});

// Dropdown menu functionality
function toggleDropdown() {
    const dropdownMenu = document.getElementById('dropdownMenu');
    dropdownMenu.classList.toggle('show');
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
    const dropdownMenu = document.getElementById('dropdownMenu');
    const dropdownToggle = document.querySelector('.cursor-pointer');
    
    if (!dropdownToggle.contains(event.target) && dropdownMenu.classList.contains('show')) {
        dropdownMenu.classList.remove('show');
    }
});

// Add active class to clicked nav item
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', function() {
        document.querySelector('.nav-item.active').classList.remove('active');
        this.classList.add('active');
    });
});

// Hàm xử lý logout
function handleLogout() {
    // Xóa token và thông tin người dùng
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    
    // Chuyển hướng về trang chủ
    window.location.href = 'index.html';
}

// Kiểm tra trạng thái đăng nhập
function checkLoginStatus() {
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

