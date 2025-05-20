
document.addEventListener('DOMContentLoaded', function() {
    fetchDashboardStats();
    checkLoginStatus();
});


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
            updateDashboardStats(result.data);
            initAppointmentsChart(result.data.chartAppointment);
            initRevenueChart(result.data.chartInvoice);
        } else {
            console.error('Error fetching dashboard stats:', result.message);
            if (result.statusCode === 403 || result.statusCode === 401) {
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
    // Update Tổng người dùng (userCount)
    document.getElementById('userCount').textContent = data.dashboard.userCount;
    
    // Update Tổng bác sĩ (doctorCount)
    document.getElementById('doctorCount').textContent = data.dashboard.doctorCount;
    
    // Update Lịch khám hôm nay (timeSlotCountOfDay)
    document.getElementById('timeSlotCount').textContent = data.dashboard.timeSlotCountOfDay;
    
    // Update Số cuộc hẹn khám hôm nay (bookingCountOfDay)
    document.getElementById('bookingCount').textContent = data.dashboard.bookingCountOfDay;

    // Update recent activities (usually)
    if (data.usually) {
        document.getElementById('activity-user').textContent = `Người dùng mới đăng ký: ${data.usually.userCountOfDay}`;
        document.getElementById('activity-user-time').textContent = 'Hôm nay';
        document.getElementById('activity-doctor').textContent = `Bác sĩ mới tham gia: ${data.usually.doctorCountOfDay}`;
        document.getElementById('activity-doctor-time').textContent = 'Hôm nay';
        document.getElementById('activity-appointment').textContent = `Lịch khám được xác nhận hôm nay: ${data.usually.appointmentCountOfDay}`;
        document.getElementById('activity-appointment-time').textContent = 'Hôm nay';
    }
}


function initAppointmentsChart(chartData) {
    const allZeros = chartData.data.every(val => val === 0);
    let chartMaxValue = undefined;
    
    if (allZeros) {
        chartMaxValue = 50;
        chartData.data = chartData.data.map(val => Math.round(val));
    }

    const appointmentsCtx = document.getElementById('appointmentsChart').getContext('2d');
    new Chart(appointmentsCtx, {
        type: 'line',
        data: {
            labels: chartData.label,
            datasets: [{
                label: 'Số lịch khám đã xác nhận',
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


function initRevenueChart(chartData) {
    const allZeros = chartData.data.every(val => val === 0);
    let chartMaxValue = undefined;
    
    if (allZeros) {
        chartMaxValue = 50;
        chartData.data = chartData.data.map(val => Math.round(val));
    }

    const revenueCtx = document.getElementById('revenueChart').getContext('2d');
    new Chart(revenueCtx, {
        type: 'bar',
        data: {
            labels: chartData.label,
            datasets: [{
                label: 'Doanh thu (VNĐ)',
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


function toggleDropdown(event) {
    if (event) {
        event.stopPropagation();
    }
    const dropdownMenu = document.getElementById('dropdownMenu');
    dropdownMenu.classList.toggle('show');
}


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


document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', function() {
        document.querySelector('.nav-item.active').classList.remove('active');
        this.classList.add('active');
    });
});


function handleLogout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}


function checkLoginStatus() {
    const token = localStorage.getItem('access_token');
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    
    const userAvatar = document.getElementById('userAvatar');
    const userNameElement = document.querySelector('.cursor-pointer span');
    
    if (token && userData) {
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
        window.location.href = 'auth.html';
    }
} 

