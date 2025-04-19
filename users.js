// Chart initialization
document.addEventListener('DOMContentLoaded', function() {
    // Kiểm tra trạng thái đăng nhập trước
    checkLoginStatus();
    
    const ctx = document.getElementById('userChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'],
            datasets: [{
                label: 'Người dùng mới',
                data: [65, 59, 80, 81, 56, 55, 40, 65, 59, 80, 81, 56],
                borderColor: 'rgb(59, 130, 246)',
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
});

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

function handleLogout() {
    // Xóa token và thông tin người dùng
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    
    // Chuyển hướng về trang chủ
    window.location.href = 'index.html';
}

// Form handling
document.addEventListener('DOMContentLoaded', function() {
    document.querySelector('#addModal form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Lấy dữ liệu từ form
        const formData = {
            name: this.querySelector('input[type="text"]').value,
            email: this.querySelector('input[type="email"]').value,
            phone: this.querySelector('input[type="tel"]').value,
            password: this.querySelector('input[type="password"]').value,
            confirmPassword: this.querySelectorAll('input[type="password"]')[1].value
        };

        // Kiểm tra mật khẩu
        if (formData.password !== formData.confirmPassword) {
            alert('Mật khẩu xác nhận không khớp!');
            return;
        }

        // Gửi dữ liệu đến server (giả lập)
        console.log('Gửi dữ liệu:', formData);
        
        // Hiển thị thông báo thành công
        alert('Thêm người dùng thành công!');
        
        // Đóng modal
        closeAddModal();
        
        // Reset form
        this.reset();
    });
});

// Modal functions
function openAddModal() {
    document.getElementById('addModal').style.display = 'block';
}

function closeAddModal() {
    document.getElementById('addModal').style.display = 'none';
}

function openEditModal(userId) {
    // Implement edit modal logic
}

function deleteUser(userId) {
    if(confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
        // Implement delete logic
        alert('Xóa người dùng thành công!');
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('addModal');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}

// Add active class to clicked nav item
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function() {
            document.querySelector('.nav-item.active').classList.remove('active');
            this.classList.add('active');
        });
    });
});

// Dropdown menu functionality
function toggleDropdown() {
    const dropdownMenu = document.getElementById('dropdownMenu');
    dropdownMenu.classList.toggle('show');
}

// Close dropdown when clicking outside
document.addEventListener('DOMContentLoaded', function() {
    document.addEventListener('click', function(event) {
        const dropdownMenu = document.getElementById('dropdownMenu');
        const dropdownToggle = document.querySelector('.cursor-pointer');
        
        if (!dropdownToggle.contains(event.target) && dropdownMenu.classList.contains('show')) {
            dropdownMenu.classList.remove('show');
        }
    });
});

// Fetch users data
let currentPage = 1;
const itemsPerPage = 4;
let totalPages = 1;
let allUsers = [];
let filteredUsers = [];

async function fetchUsers() {
    try {
        const accessToken = localStorage.getItem('access_token');
        
        if (!accessToken) {
            window.location.href = '/login.html';
            return;
        }

        const response = await fetch('http://localhost:5000/api/users', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 401) {
            localStorage.removeItem('access_token');
            window.location.href = '/login.html';
            return;
        }

        const result = await response.json();
        
        if (result.isError) {
            throw new Error(result.message);
        }
        
        allUsers = result.data.users;
        filteredUsers = [...allUsers];
        
        // Update total users count from API
        document.getElementById('totalUsersOverview').textContent = result.data.total;
        
        // Count and update active users
        const activeUsers = allUsers.filter(user => user.status).length;
        document.getElementById('activeUsersCount').textContent = activeUsers;
        
        updatePagination();
        displayUsers();
    } catch (error) {
        console.error('Error fetching users:', error);
        alert(error.message || 'Không thể tải danh sách người dùng. Vui lòng thử lại sau.');
    }
}

function handleSearch() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;
    
    filteredUsers = allUsers.filter(user => {
        const matchesSearch = 
            user.userName.toLowerCase().includes(searchTerm) ||
            user.email.toLowerCase().includes(searchTerm) ||
            user.phone.toLowerCase().includes(searchTerm);
        
        const matchesStatus = 
            statusFilter === 'all' ||
            (statusFilter === 'active' && user.status) ||
            (statusFilter === 'locked' && !user.status);
        
        return matchesSearch && matchesStatus;
    });
    
    currentPage = 1;
    updatePagination();
    displayUsers();
}

function updatePagination() {
    totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const paginationElement = document.getElementById('pagination');
    
    let paginationHTML = `
        <button onclick="changePage(${currentPage - 1})" 
                class="px-3 py-1 border rounded ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}" 
                ${currentPage === 1 ? 'disabled' : ''}>
            Trước
        </button>
    `;
    
    for (let i = 1; i <= totalPages; i++) {
        paginationHTML += `
            <button onclick="changePage(${i})" 
                    class="px-3 py-1 ${currentPage === i ? 'bg-blue-500 text-white' : 'border'} rounded hover:bg-blue-100">
                ${i}
            </button>
        `;
    }
    
    paginationHTML += `
        <button onclick="changePage(${currentPage + 1})" 
                class="px-3 py-1 border rounded ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}"
                ${currentPage === totalPages ? 'disabled' : ''}>
            Sau
        </button>
    `;
    
    paginationElement.innerHTML = paginationHTML;
}

function changePage(page) {
    if (page < 1 || page > totalPages) return;
    currentPage = page;
    updatePagination();
    displayUsers();
}

// Display users in table
function displayUsers() {
    const tableBody = document.getElementById('usersTableBody');
    const tableInfo = document.getElementById('tableInfo');
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, filteredUsers.length);
    const displayedUsers = filteredUsers.slice(startIndex, endIndex);
    
    // Update table info with total count from allUsers array
    tableInfo.textContent = `Hiển thị ${startIndex + 1}-${endIndex} trên ${allUsers.length} kết quả`;
    
    // Clear existing table content
    tableBody.innerHTML = '';
    
    // Add user rows
    displayedUsers.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${user.id.substring(0, 8)}...</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <img src="${user.img || 'https://via.placeholder.com/40'}" alt="${user.userName}" 
                     class="h-10 w-10 rounded-full">
            </td>
            <td class="px-6 py-4 whitespace-nowrap">${user.userName}</td>
            <td class="px-6 py-4 whitespace-nowrap">${user.email}</td>
            <td class="px-6 py-4 whitespace-nowrap">${user.phone}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(user.roleName)}">
                    ${user.roleName}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }">
                    ${user.status ? 'Đang hoạt động' : 'Đã khóa'}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <button onclick="openEditModal('${user.id}')" class="text-blue-500 hover:text-blue-700 mr-3">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteUser('${user.id}')" class="text-red-500 hover:text-red-700">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Get badge color based on role
function getRoleBadgeColor(role) {
    switch (role) {
        case 'Admin':
            return 'bg-purple-100 text-purple-800';
        case 'Doctor':
            return 'bg-blue-100 text-blue-800';
        case 'User':
            return 'bg-gray-100 text-gray-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
}

// Load users when page loads
document.addEventListener('DOMContentLoaded', fetchUsers); 