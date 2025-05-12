// Function to update chart titles based on time period
function updateChartTitles(timePeriod) {
    const appointmentsTitle = document.querySelector('#appointmentsChart').closest('.bg-white').querySelector('h3');
    const revenueTitle = document.querySelector('#revenueChart').closest('.bg-white').querySelector('h3');

    switch (timePeriod) {
        case 'today':
            appointmentsTitle.textContent = 'Số lượng lịch khám hôm nay';
            revenueTitle.textContent = 'Doanh thu hôm nay';
            break;
        case 'this_week':
            appointmentsTitle.textContent = 'Số lượng lịch khám theo tuần';
            revenueTitle.textContent = 'Doanh thu theo tuần';
            break;
        case 'this_month':
            appointmentsTitle.textContent = 'Số lượng lịch khám theo tháng';
            revenueTitle.textContent = 'Doanh thu theo tháng';
            break;
        case 'this_year':
            appointmentsTitle.textContent = 'Số lượng lịch khám theo năm';
            revenueTitle.textContent = 'Doanh thu theo năm';
            break;
    }
}

// Initialize charts with API data
async function initCharts() {
    try {
        const token = localStorage.getItem('access_token');
        if (!token) {
            console.error('No access token found');
            return;
        }

        const timePeriod = document.getElementById('timePeriodSelect').value;
        
        // Update chart titles based on selected time period
        updateChartTitles(timePeriod);

        const response = await fetch('http://localhost:5000/api/statistic/chart', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                time: timePeriod
            })
        });

        const result = await response.json();

        if (result.isError) {
            console.error('Error fetching chart data:', result.message);
            return;
        }

        const { appointmentsChart, usersAgeChart, specialtiesChart, revenueChart } = result.data;

        // Destroy existing charts if they exist
        if (window.appointmentsChartInstance) window.appointmentsChartInstance.destroy();
        if (window.usersChartInstance) window.usersChartInstance.destroy();
        if (window.revenueChartInstance) window.revenueChartInstance.destroy();
        if (window.specialtiesChartInstance) window.specialtiesChartInstance.destroy();

        // Appointments Chart
        const appointmentsCtx = document.getElementById('appointmentsChart').getContext('2d');
        window.appointmentsChartInstance = new Chart(appointmentsCtx, {
            type: 'line',
            data: {
                labels: appointmentsChart.labels,
                datasets: [{
                    label: 'Số lượng lịch khám',
                    data: appointmentsChart.data,
                    borderColor: '#4a90e2',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        min: 0,
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)',
                            drawBorder: false,
                            display: true
                        }
                    },
                    x: {
                        grid: {
                            display: true,
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    }
                }
            }
        });

        // Users Age Chart
        const usersCtx = document.getElementById('usersChart').getContext('2d');
        window.usersChartInstance = new Chart(usersCtx, {
            type: 'bar',
            data: {
                labels: usersAgeChart.labels,
                datasets: [{
                    label: 'Số lượng người dùng',
                    data: usersAgeChart.data,
                    backgroundColor: '#4a90e2'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        min: 0,
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1,
                            precision: 0
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)',
                            drawBorder: false,
                            display: true
                        }
                    },
                    x: {
                        grid: {
                            display: true,
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    }
                }
            }
        });

        // Revenue Chart
        const revenueCtx = document.getElementById('revenueChart').getContext('2d');
        window.revenueChartInstance = new Chart(revenueCtx, {
            type: 'bar',
            data: {
                labels: revenueChart.labels,
                datasets: [{
                    label: 'Doanh thu (VNĐ)',
                    data: revenueChart.data,
                    backgroundColor: '#4a90e2'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        min: 0,
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)',
                            drawBorder: false,
                            display: true
                        }
                    },
                    x: {
                        grid: {
                            display: true,
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    }
                }
            }
        });

        // Specialties Chart
        const specialtiesCtx = document.getElementById('specialtiesChart').getContext('2d');
        window.specialtiesChartInstance = new Chart(specialtiesCtx, {
            type: 'doughnut',
            data: {
                labels: specialtiesChart.labels,
                datasets: [{
                    data: specialtiesChart.data,
                    backgroundColor: specialtiesChart.color
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right'
                    }
                }
            }
        });

    } catch (error) {
        console.error('Error initializing charts:', error);
    }
}

// Add active class to clicked nav item
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', function () {
        document.querySelector('.nav-item.active').classList.remove('active');
        this.classList.add('active');
    });
});

// Dropdown menu functionality
function toggleDropdown() {
    const dropdownMenu = document.getElementById('dropdownMenu');
    dropdownMenu.classList.toggle('show');
}

// Close dropdown when clicking outside
document.addEventListener('click', function (event) {
    const dropdownMenu = document.getElementById('dropdownMenu');
    const dropdownToggle = document.querySelector('.cursor-pointer');

    if (!dropdownToggle.contains(event.target) && dropdownMenu.classList.contains('show')) {
        dropdownMenu.classList.remove('show');
    }
});

// Hàm xử lý logout
function handleLogout() {
    // Xóa token và thông tin người dùng
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');

    // Chuyển hướng về trang chủ
    window.location.href = 'index.html';
}

// Function to fetch overview statistics
async function fetchOverviewStats() {
    try {
        const token = localStorage.getItem('access_token');
        if (!token) {
            console.error('No access token found');
            return;
        }

        const timePeriod = document.getElementById('timePeriodSelect').value;

        const response = await fetch('http://localhost:5000/api/statistic/overview', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                time: timePeriod
            })
        });

        const result = await response.json();

        if (result.isError) {
            console.error('Error fetching overview stats:', result.message);
            return;
        }

        // Update UI with the fetched data
        const { totalUsers, Bookings, News, Contacts } = result.data;

        // Update total users
        document.getElementById('totalUsersCount').textContent = totalUsers.count;
        updateChangeElement('totalUsersChange', totalUsers.change);

        // Update bookings
        document.getElementById('bookingsCount').textContent = Bookings.count;
        updateChangeElement('bookingsChange', Bookings.change);

        // Update news
        document.getElementById('newsCount').textContent = News.count;
        updateChangeElement('newsChange', News.change);

        // Update contacts
        document.getElementById('contactsCount').textContent = Contacts.count;
        updateChangeElement('contactsChange', Contacts.change);

    } catch (error) {
        console.error('Error fetching overview stats:', error);
    }
}

// Helper function to update change elements with appropriate styling
function updateChangeElement(elementId, change) {
    const element = document.getElementById(elementId);
    const changeValue = parseInt(change);
    
    // Check if the element is one of the first two (total users or bookings)
    const isPercentageElement = elementId === 'totalUsersChange' || elementId === 'bookingsChange';
    
    if (changeValue > 0) {
        element.textContent = isPercentageElement 
            ? `+${changeValue}% so với thời điểm trước`
            : `+${changeValue} so với thời điểm trước`;
        element.className = 'text-sm text-green-500';
    } else if (changeValue < 0) {
        element.textContent = isPercentageElement 
            ? `${changeValue}% so với thời điểm trước`
            : `${changeValue} so với thời điểm trước`;
        element.className = 'text-sm text-red-500';
    } else {
        element.textContent = 'Không có thay đổi';
        element.className = 'text-sm text-gray-500';
    }
}

// Function to fetch recent activities
async function fetchRecentActivities() {
    try {
        const token = localStorage.getItem('access_token');
        if (!token) {
            console.error('No access token found');
            return;
        }

        const response = await fetch('http://localhost:5000/api/statistic/recent-activities', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();

        if (result.isError) {
            console.error('Error fetching recent activities:', result.message);
            return;
        }

        // Update UI with the fetched data
        const { recentUsers, recentBookings, recentNews, recentContacts } = result.data;

        // Update time for each activity
        document.getElementById('recentUsersTime').textContent = recentUsers.timeAgo;
        document.getElementById('recentBookingsTime').textContent = recentBookings.timeAgo;
        document.getElementById('recentNewsTime').textContent = recentNews.timeAgo;
        document.getElementById('recentContactsTime').textContent = recentContacts.timeAgo;

    } catch (error) {
        console.error('Error fetching recent activities:', error);
    }
}

// Function to generate random color
function generateRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// Function to generate array of unique random colors
function generateRandomColors(count) {
    const colors = [];
    for (let i = 0; i < count; i++) {
        colors.push(generateRandomColor());
    }
    return colors;
}

// Function to fetch and display specialty statistics
async function fetchSpecialties() {
    try {
        const token = localStorage.getItem('access_token');
        if (!token) {
            console.error('No access token found');
            return;
        }

        const response = await fetch('http://localhost:5000/api/statistic/specialties', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();

        if (result.isError) {
            console.error('Error fetching specialties:', result.message);
            return;
        }

        const { specialties, chartData } = result.data;

        // Update specialties list
        const specialtiesList = document.getElementById('specialtiesList');
        specialtiesList.innerHTML = specialties.map(specialty => `
            <div class="bg-gray-50 p-4 rounded-lg">
                <div class="flex justify-between items-center">
                    <h5 class="font-medium">${specialty.name}</h5>
                    <div class="flex space-x-4">
                        <div class="text-sm">
                            <span class="text-gray-500">Số lịch khám:</span>
                            <span class="font-medium ml-1">${specialty.bookingCount}</span>
                        </div>
                        <div class="text-sm">
                            <span class="text-gray-500">Số bác sĩ:</span>
                            <span class="font-medium ml-1">${specialty.doctorCount}</span>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

        // Generate random colors based on number of specialties
        const colors = generateRandomColors(chartData.labels.length);

        // Update specialty distribution chart
        if (window.specialtyDistributionChartInstance) {
            window.specialtyDistributionChartInstance.destroy();
        }

        const specialtyDistributionCtx = document.getElementById('specialtyDistributionChart').getContext('2d');
        window.specialtyDistributionChartInstance = new Chart(specialtyDistributionCtx, {
            type: 'pie',
            data: {
                labels: chartData.labels,
                datasets: [{
                    data: chartData.data,
                    backgroundColor: colors
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right'
                    },
                    title: {
                        display: true,
                        text: 'Phân bố lịch khám theo chuyên khoa'
                    }
                }
            }
        });

    } catch (error) {
        console.error('Error fetching specialties:', error);
    }
}

// Add event listener for time period selection
document.addEventListener('DOMContentLoaded', () => {
    const timePeriodSelect = document.getElementById('timePeriodSelect');
    timePeriodSelect.addEventListener('change', async () => {
        // Call all APIs when time period changes
        await Promise.all([
            fetchOverviewStats(),
            fetchRecentActivities(),
            initCharts(),
            fetchSpecialties()
        ]);
    });
    
    // Initial fetch
    fetchOverviewStats();
    fetchRecentActivities();
    initCharts();
    fetchSpecialties();
}); 