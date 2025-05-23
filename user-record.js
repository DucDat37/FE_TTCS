// API URLs
const API_BASE_URL = "http://localhost:5000/api";
const USERS_API = `${API_BASE_URL}/users`;


document.addEventListener('DOMContentLoaded', function () {
    checkLoginStatus();
    loadAppointment();
});

// Biến toàn cục
let currentPage = 1;
const limit = 12;
let totalappointments = 0;
let appointments = [];
let allAppointments = [];

// Lấy danh sách lịch hẹn
async function fetchappointment(page = 1) {
    try {
        const response = await fetch(`http://localhost:5000/api/appointment/user?page=${page}&limit=${limit}&sort=createdAt&order=DESC`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            }
        });
        if (!response.ok) {
            throw new Error('Failed to fetch appointment');
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
function updateappointmentsTable(appointments) {
    const tableBody = document.getElementById('historyTableBody');
    tableBody.innerHTML = '';

    appointments.forEach(appointment => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50';
        row.innerHTML = `
            <td class="py-3 px-4">${appointment.code}</td>
            <td class="py-3 px-4">${appointment.status}</td>
            <td class="py-3 px-4">${appointment.record.code || '---'}</td>
            <td class="py-3 px-4">${appointment.record.doctor.userName || '---'}</td>
            <td class="py-3 px-4">${appointment.record.diagnosis || '---'}</td>
            <td class="py-3 px-4">${appointment.record.prescription || '---'}</td>
            <td class="py-3 px-4">${appointment.record.notes || '---'}</td>
            <td class="py-3 px-4">${appointment.record.createdAt || '---'}</td>
            <td class="py-3 px-4">${appointment.invoice.status || '---'} </td>
            `;

        // Nếu có invoice thì thêm cột chứa nút xem
        if (appointment.invoice) {
            const td = document.createElement('td');
            td.className = 'py-3 px-4';
            td.innerHTML = `
                    <button onclick="viewInvoice('${appointment.invoice.id}')" class="text-blue-500 hover:text-blue-700 mr-2">
                        <i class="fas fa-eye"></i>
                    </button>
                `;
            row.appendChild(td);
        }

        tableBody.appendChild(row);
    });
} function viewInvoice(invoiceId) {
    if (invoiceId) {
        window.location.href = `http://127.0.0.1:5501/invoice_detail.html?id=${invoiceId}`;
    }
}

// Tải danh sách lịch hẹn
async function loadAppointment(page = 1) {
    currentPage = page;
    const data = await fetchappointment(page);
    if (data) {
        allAppointments = data.appoinments;
        totalappointments = data.total;
        updateappointmentsTable(allAppointments);
        updatePagination(totalappointments, currentPage);
        document.getElementById('currentDisplayed').textContent = allAppointments.length;
        document.getElementById('totalAppoinments').textContent = totalappointments;
    }
}

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
            loadAppointment(currentPage - 1);
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
        firstPageButton.onclick = () => loadAppointment(1);
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
        pageButton.onclick = () => loadAppointment(i);
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
        lastPageButton.onclick = () => loadAppointment(totalPages);
        paginationContainer.appendChild(lastPageButton);
    }

    // Next button
    const nextButton = document.createElement('button');
    nextButton.className = `px-3 py-1 rounded-md ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`;
    nextButton.innerHTML = '<i class="fas fa-chevron-right"></i>';
    nextButton.disabled = currentPage === totalPages;
    nextButton.onclick = () => {
        if (currentPage < totalPages) {
            loadAppointment(currentPage + 1);
        }
    };
    paginationContainer.appendChild(nextButton);
}
function getStatusClass(status) {
    switch (status) {
        case 'Chờ khám':
            return 'status-confirmed';
        case 'Đã khám xong':
            return 'status-completed';
        case 'Đã xuất hóa đơn':
            return 'status-billed';
        case 'Đã hủy':
            return 'status-cancelled';
        default:
            return '';
    }
}

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