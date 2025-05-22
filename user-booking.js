// API URLs
const API_BASE_URL = "http://localhost:5000/api";
const USERS_API = `${API_BASE_URL}/users`;


document.addEventListener('DOMContentLoaded', function () {
    checkLoginStatus();
    loadBookings();
});
// Global variables
let currentPage = 1;
const limit = 8;
let totalBookings = 0;
let bookings = [];
let allBookings = []; // Store all bookings for filtering


// Lấy danh sách lịch hẹn
async function fetchBookings(page = 1) {
    try {
        const response = await fetch(`http://localhost:5000/api/booking?page=${page}&limit=${limit}&sort=createdAt&order=DESC`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch bookings');
        }

        const data = await response.json();
        if (data.isError) {
            throw new Error(data.message);
        }
        console.log(data)
        return data.data;

    } catch (error) {
        toast.error('Lỗi', error.message);
        return null;
    }
}
// Cập nhật bảng lịch hẹn
function updateBookingsTable(bookings) {
    const tableBody = document.getElementById('bookingsTable');
    tableBody.innerHTML = '';

    bookings.forEach(booking => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50';
        row.innerHTML = `
            <td class="py-3 px-4">${booking.code}</td>
            <td class="py-3 px-4">${booking.timeSlot.doctor.userName}</td>
            <td class="py-3 px-4">${booking.patient.userName}</td>
            <td class="py-3 px-4">${booking.timeSlot.startDate}</td>
            <td class="py-3 px-4">${booking.timeSlot.endDate}</td>
            <td class="py-3 px-4">${booking.service.name}</td>
            <td class="py-3 px-4">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${booking.status
                ? 'bg-green-100 text-green-800'
                : 'bg-yellow-100 text-yellow-800'
            }">
                    <span class="w-2 h-2 mr-1.5 rounded-full ${booking.status
                ? 'bg-green-400'
                : 'bg-yellow-400'
            }"></span>
                    ${booking.status ? 'Đã xác nhận' : 'Chờ xác nhận'}
                </span>
            </td>
            <td class="py-3 px-4">
                <button onclick="viewBooking('${booking.id}')" class="text-blue-500 hover:text-blue-700 mr-2">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Update pagination
function updatePagination(total, currentPage) {
    const totalPages = Math.ceil(total / limit);
    const paginationContainer = document.getElementById('pagination');
    paginationContainer.innerHTML = '';

    // Previous button
    const prevButton = document.createElement('button');
    prevButton.className = `px-3 py-1 rounded-md ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`;
    prevButton.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prevButton.disabled = currentPage === 1;
    prevButton.onclick = () => {
        if (currentPage > 1) {
            loadBookings(currentPage - 1);
        }
    };
    paginationContainer.appendChild(prevButton);

    // Page numbers
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);

    if (endPage - startPage < 4) {
        startPage = Math.max(1, endPage - 4);
    }

    if (startPage > 1) {
        const firstPageButton = document.createElement('button');
        firstPageButton.className = 'px-3 py-1 rounded-md bg-white text-gray-700 hover:bg-gray-50';
        firstPageButton.textContent = '1';
        firstPageButton.onclick = () => loadBookings(1);
        paginationContainer.appendChild(firstPageButton);

        if (startPage > 2) {
            const ellipsis = document.createElement('span');
            ellipsis.className = 'px-2 py-1 text-gray-500';
            ellipsis.textContent = '...';
            paginationContainer.appendChild(ellipsis);
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        const pageButton = document.createElement('button');
        pageButton.className = `px-3 py-1 rounded-md ${i === currentPage ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`;
        pageButton.textContent = i;
        pageButton.onclick = () => loadBookings(i);
        paginationContainer.appendChild(pageButton);
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            const ellipsis = document.createElement('span');
            ellipsis.className = 'px-2 py-1 text-gray-500';
            ellipsis.textContent = '...';
            paginationContainer.appendChild(ellipsis);
        }

        const lastPageButton = document.createElement('button');
        lastPageButton.className = 'px-3 py-1 rounded-md bg-white text-gray-700 hover:bg-gray-50';
        lastPageButton.textContent = totalPages;
        lastPageButton.onclick = () => loadBookings(totalPages);
        paginationContainer.appendChild(lastPageButton);
    }

    // Next button
    const nextButton = document.createElement('button');
    nextButton.className = `px-3 py-1 rounded-md ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`;
    nextButton.innerHTML = '<i class="fas fa-chevron-right"></i>';
    nextButton.disabled = currentPage === totalPages;
    nextButton.onclick = () => {
        if (currentPage < totalPages) {
            loadBookings(currentPage + 1);
        }
    };
    paginationContainer.appendChild(nextButton);
}

// Tải danh sách lịch hẹn
async function loadBookings(page = 1) {
    currentPage = page;
    const data = await fetchBookings(page);
    if (data) {
        allBookings = data.bookings;
        totalBookings = data.total;
        updateBookingsTable(allBookings);
        updatePagination(totalBookings, currentPage);
        document.getElementById('currentDisplayed').textContent = allBookings.length;
        document.getElementById('totalBookings').textContent = totalBookings;
    }
}

// Áp dụng bộ lọc
function applyFilters() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;

    let filteredBookings = allBookings;

    // Apply status filter
    if (statusFilter !== '') {
        filteredBookings = filteredBookings.filter(booking =>
            booking.status.toString() === statusFilter
        );
    }

    // Apply search filter
    if (searchTerm) {
        filteredBookings = filteredBookings.filter(booking =>
            booking.code.toLowerCase().includes(searchTerm) ||
            booking.timeSlot.doctor.userName.toLowerCase().includes(searchTerm) ||
            booking.patient.userName.toLowerCase().includes(searchTerm) ||
            booking.service.name.toLowerCase().includes(searchTerm)
        );
    }

    updateBookingsTable(filteredBookings);
    document.getElementById('currentDisplayed').textContent = filteredBookings.length;
    document.getElementById('totalBookings').textContent = totalBookings;
}

// Xem chi tiết lịch hẹn
async function viewBooking(id) {
    try {
        const response = await fetch(`http://localhost:5000/api/booking/${id}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            }
        });

        if (response.status === 401) {
            handleLogout();
            return;
        }

        const result = await response.json();
        if (result.isError) {
            throw new Error(result.message);
        }

        const booking = result.data;

        // Update modal content
        document.getElementById('detailCode').textContent = booking.code;

        // Update status badge
        const statusElement = document.getElementById('detailStatus');
        statusElement.style.position = 'relative';  // hoặc 'absolute' nếu cần
        statusElement.style.zIndex = '10000';
        statusElement.innerHTML = `
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${booking.status
                ? 'bg-green-100 text-green-800'
                : 'bg-yellow-100 text-yellow-800'
            }">
                <span class="w-2 h-2 mr-1.5 rounded-full ${booking.status
                ? 'bg-green-400'
                : 'bg-yellow-400'
            }"></span>
                ${booking.status ? 'Đã xác nhận' : 'Chờ xác nhận'}
            </span>
        `;

        // Update patient info
        document.getElementById('detailPatientName').textContent = booking.patient.userName;
        document.getElementById('detailPatientEmail').textContent = booking.patient.email;
        document.getElementById('detailPatientPhone').textContent = booking.patient.phone || 'Chưa cập nhật';

        // Update time slot
        document.getElementById('detailStartDate').textContent = `Bắt đầu: ${booking.timeSlot.startDate}`;
        document.getElementById('detailEndDate').textContent = `Kết thúc: ${booking.timeSlot.endDate}`;

        // Update service info
        document.getElementById('detailServiceName').textContent = booking.service.name;
        document.getElementById('detailServicePrice').textContent = `Giá: ${booking.service.price.toLocaleString('vi-VN')}đ`;

        // Update timestamps
        document.getElementById('detailCreatedAt').textContent = booking.createdAt;
        document.getElementById('detailUpdatedAt').textContent = booking.updatedAt;

        // Show modal
        document.getElementById('detailBookingModal').classList.remove('hidden');

    } catch (error) {
        toast.error('Lỗi', error.message);
    }
}

// Đóng modal chi tiết lịch hẹn
function closeDetailBookingModal() {
    document.getElementById('detailBookingModal').classList.add('hidden');
}

// Search functionality
document.getElementById('searchInput').addEventListener('input', debounce(function () {
    applyFilters();
}, 300));

// Apply filters button
document.getElementById('applyFilters').addEventListener('click', () => {
    applyFilters();
});

// Status filter change
document.getElementById('statusFilter').addEventListener('change', () => {
    applyFilters();
});
// Hàm debounce
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Search functionality
document.getElementById('searchInput').addEventListener('input', debounce(function () {
    applyFilters();
}, 300));

// Apply filters button
document.getElementById('applyFilters').addEventListener('click', () => {
    applyFilters();
});

// Status filter change
document.getElementById('statusFilter').addEventListener('change', () => {
    applyFilters();
});


function checkLoginStatus() {
    const token = localStorage.getItem('access_token');
    const userData = getUserDataFromStorage();

    if (!token || !userData) {
        window.location.href = 'index.html';
        return;
    }
    updateUserInfoInHeader(userData);

    if (userData.role === "Admin") {
        document.getElementById('adminPage').classList.remove('hidden');
    }
}


function getUserDataFromStorage() {
    try {
        return JSON.parse(localStorage.getItem('user') || '{}');
    } catch (error) {
        console.error('Error parsing user data:', error);
        return {};
    }
}


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
document.addEventListener('click', function (event) {
    const dropdown = document.getElementById('userDropdown');
    const menu = document.getElementById('userDropdownMenu');

    if (dropdown && menu && !dropdown.contains(event.target) && !menu.classList.contains('hidden')) {
        menu.classList.add('hidden');
    }
}); 