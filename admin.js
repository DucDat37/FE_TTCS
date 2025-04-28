// Khởi tạo các biểu đồ khi DOM đã sẵn sàng
document.addEventListener('DOMContentLoaded', function() {
    // Fetch dashboard statistics from API
    fetchDashboardStats();

    // Kiểm tra trạng thái đăng nhập và hiển thị thông tin người dùng
    checkLoginStatus();
});

// Fetch dashboard statistics from API
async function fetchDashboardStats() {
    try {
        const token = localStorage.getItem('access_token');
        if (!token) {
            window.location.href = 'auth.html';
            return;
        }

        const response = await fetch('http://localhost:5000/api/statistic/dashboard', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        const result = await response.json();
        
        if (result.statusCode === 200 && !result.isError) {
            // Update dashboard stats
            updateDashboardStats(result.data);
            
            // Initialize charts with API data
            initAppointmentsChart(result.data.chartAppointment);
            initRevenueChart(result.data.chartInvoice);
        } else {
            console.error('Error fetching dashboard stats:', result.message);
            if (result.statusCode === 401) {
                // Unauthorized, token expired or invalid
                localStorage.removeItem('access_token');
                localStorage.removeItem('user');
                window.location.href = 'auth.html';
            }
        }
    } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
    }
}

// Update dashboard statistics
function updateDashboardStats(data) {
    // Update user count
    document.querySelector('.text-2xl.font-bold').textContent = data.dashboard.userCount;
    
    // Update doctor count
    document.querySelectorAll('.text-2xl.font-bold')[1].textContent = data.dashboard.doctorCount;
    
    // Update appointment count
    document.querySelectorAll('.text-2xl.font-bold')[2].textContent = data.dashboard.timeSlotCountOfDay;
    
    // Update hospital count
    document.querySelectorAll('.text-2xl.font-bold')[3].textContent = data.dashboard.bookingCountOfDay;
}

// Initialize Appointments Chart
function initAppointmentsChart(chartData) {
    // Check if all values are 0, if so set a max of 50
    const allZeros = chartData.data.every(val => val === 0);
    let chartMaxValue = undefined;
    
    if (allZeros) {
        chartMaxValue = 50;
        // Convert data to integers
        chartData.data = chartData.data.map(val => Math.round(val));
    }

    const appointmentsCtx = document.getElementById('appointmentsChart').getContext('2d');
    new Chart(appointmentsCtx, {
        type: 'line',
        data: {
            labels: chartData.label,
            datasets: [{
                label: 'Số lịch khám',
                data: chartData.data,
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
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: chartMaxValue,
                    ticks: {
                        stepSize: 5,
                        precision: 0
                    }
                }
            }
        }
    });
}

// Initialize Revenue Chart
function initRevenueChart(chartData) {
    // Check if all values are 0, if so set a max of 50
    const allZeros = chartData.data.every(val => val === 0);
    let chartMaxValue = undefined;
    
    if (allZeros) {
        chartMaxValue = 50;
        // Convert data to integers
        chartData.data = chartData.data.map(val => Math.round(val));
    }

    const revenueCtx = document.getElementById('revenueChart').getContext('2d');
    new Chart(revenueCtx, {
        type: 'bar',
        data: {
            labels: chartData.label,
            datasets: [{
                label: 'Doanh thu (triệu VNĐ)',
                data: chartData.data,
                backgroundColor: '#4a90e2'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: chartMaxValue,
                    ticks: {
                        stepSize: 5,
                        precision: 0
                    }
                }
            }
        }
    });
}

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

