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
    // Kiểm tra trạng thái đăng nhập trước
    checkLoginStatus();
    
    // Load users and statistics when page loads
    fetchUsers();
    fetchAndUpdateStatistics();
    
    // Initialize AntD DatePickers once DOM is loaded
    initAddDatePicker();
    
    // Remove any existing event listeners first
    const addUserForm = document.getElementById('addUserForm');
    if (addUserForm) {
        const newAddUserForm = addUserForm.cloneNode(true);
        addUserForm.parentNode.replaceChild(newAddUserForm, addUserForm);
        
        // Add User form submission with new element
        newAddUserForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validate form before submission
            if (validateAddForm()) {
                submitAddForm();
            }
        });
    }
    
    // Edit User form submission
    const editUserForm = document.getElementById('editUserForm');
    if (editUserForm) {
        const newEditUserForm = editUserForm.cloneNode(true);
        editUserForm.parentNode.replaceChild(newEditUserForm, editUserForm);
        
        // Add new event listener
        newEditUserForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validate form before submission
            if (validateEditForm()) {
                submitEditForm();
            }
        });
    }
});

// Modal functions
function openAddModal() {
    document.getElementById('addModal').style.display = 'block';
    
    // Clear previous errors and form data
    clearAddFormErrors();
    document.getElementById('addUserForm').reset();
    
    // Initialize AntD DatePicker for the add form
    initAddDatePicker();
}

function closeAddModal() {
    document.getElementById('addModal').style.display = 'none';
}

// Initialize Ant Design DatePicker for add form
let addDatePicker;

function initAddDatePicker() {
    if (window.antd && typeof window.antd.DatePicker !== 'undefined') {
        const datePickerContainer = document.getElementById('addBirthdate').parentNode;
        
        // Replace native date input with Ant Design DatePicker
        document.getElementById('addBirthdate').style.display = 'none';
        
        // Remove existing date picker if any
        const existingDatePicker = datePickerContainer.querySelector('#antAddDatePicker');
        if (existingDatePicker) {
            datePickerContainer.removeChild(existingDatePicker);
        }
        
        // Create new date picker
        const datePickerElement = document.createElement('div');
        datePickerElement.id = 'antAddDatePicker';
        datePickerContainer.appendChild(datePickerElement);
        
        // Initialize Ant Design DatePicker
        addDatePicker = new window.antd.DatePicker({
            container: datePickerElement,
            format: 'DD/MM/YYYY',
            placeholder: 'Chọn ngày sinh',
            onChange: (date) => {
                // Update the hidden native input when date changes
                if (date) {
                    document.getElementById('addBirthdate').value = date.format('YYYY-MM-DD');
                } else {
                    document.getElementById('addBirthdate').value = '';
                }
            }
        });
    }
}

// Form validation and submission for adding users
function validateAddForm() {
    // Clear previous errors
    clearAddFormErrors();
    
    let isValid = true;
    
    // Validate required fields
    const username = document.getElementById('addUsername').value;
    if (!username) {
        showAddError('username', 'Họ và tên không được để trống');
        isValid = false;
    }
    
    // Validate email
    const email = document.getElementById('addEmail').value;
    if (!email) {
        showAddError('email', 'Email không được để trống');
        isValid = false;
    } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showAddError('email', 'Email không hợp lệ');
            isValid = false;
        }
    }
    
    // Validate phone number
    const phone = document.getElementById('addPhone').value;
    if (!phone) {
        showAddError('phone', 'Số điện thoại không được để trống');
        isValid = false;
    } else {
        const phoneRegex = /^\d{10,11}$/;
        if (!phoneRegex.test(phone)) {
            showAddError('phone', 'Số điện thoại phải có 10-11 chữ số');
            isValid = false;
        }
    }
    
    // Validate birthdate
    const birthdate = document.getElementById('addBirthdate').value;
    if (birthdate) {
        // Check if date is valid according to dd/mm/yyyy format
        let isValidDate = true;
        if (addDatePicker) {
            // If using Ant Design DatePicker, rely on its validation
            isValidDate = addDatePicker.isValid();
        } else {
            // For native date input validation
            const dateObj = new Date(birthdate);
            isValidDate = !isNaN(dateObj.getTime());
        }
        
        if (!isValidDate) {
            showAddError('birthdate', 'Ngày sinh không hợp lệ, định dạng đúng là dd/mm/yyyy');
            isValid = false;
        }
    }
    
    return isValid;
}

function showAddError(field, message) {
    const errorElement = document.querySelector(`#addUserForm .error-message[data-field="${field}"]`);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.remove('hidden');
    }
}

function clearAddFormErrors() {
    document.querySelectorAll('#addUserForm .error-message').forEach(el => {
        el.textContent = '';
        el.classList.add('hidden');
    });
}

async function submitAddForm() {
    try {
        const accessToken = localStorage.getItem('access_token');
        
        if (!accessToken) {
            window.location.href = '/login.html';
            return;
        }
        
        // Get original birth date value
        const originalBirthDate = document.getElementById('addBirthdate').value;
        
        // Format birth date to dd/mm/yyyy if it exists
        let formattedBirthDate = '';
        if (originalBirthDate) {
            // Parse the date (expecting format YYYY-MM-DD from input)
            const dateObj = new Date(originalBirthDate);
            
            // Format to dd/mm/yyyy
            const day = String(dateObj.getDate()).padStart(2, '0');
            const month = String(dateObj.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
            const year = dateObj.getFullYear();
            
            formattedBirthDate = `${day}/${month}/${year}`;
        }
        
        // Prepare user data for adding
        const userData = {
            userName: document.getElementById('addUsername').value,
            email: document.getElementById('addEmail').value,
            phone: document.getElementById('addPhone').value,
            birthDate: formattedBirthDate,
            gender: document.getElementById('addGender').value === 'true',
            address: document.getElementById('addAddress').value,
            roleName: document.getElementById('addRole').value,
            img: document.getElementById('addImgUrl').value
        };
        
        // Show loading state
        document.getElementById('addUserForm').classList.add('opacity-50');
        
        // Send create request to API
        const response = await fetch('http://localhost:5000/api/users/create-user', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            // Handle validation errors from API
            if (result.errors && Array.isArray(result.errors)) {
                result.errors.forEach(error => {
                    showAddError(error.field, error.message);
                });
            }
            throw new Error(result.message || 'Thêm người dùng thất bại');
        }
        
        // Adding successful
        toast.success('Thêm người dùng mới thành công!');
        closeAddModal();
        
        // Refresh user list and statistics
        fetchUsers();
        fetchAndUpdateStatistics();
        
    } catch (error) {
        console.error('Error adding user:', error);
        toast.error(error.message || 'Không thể thêm người dùng. Vui lòng thử lại sau.');
    } finally {
        // Remove loading state
        document.getElementById('addUserForm').classList.remove('opacity-50');
    }
}

// Edit Modal functions
let datePicker;

function openEditModal(userId) {
    // Display the modal
    document.getElementById('editModal').style.display = 'block';
    
    // Clear previous errors
    clearErrors();
    
    // Fetch user data and populate the form
    fetchUserData(userId);
}

function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
}

async function fetchUserData(userId) {
    try {
        const accessToken = localStorage.getItem('access_token');
        
        if (!accessToken) {
            window.location.href = '/login.html';
            return;
        }

        // Show loading state
        document.getElementById('editUserForm').classList.add('opacity-50');
        
        // Fetch user data from API
        const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
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
        
        const userData = result.data;
        
        // Populate form fields with user data
        document.getElementById('editUserId').value = userId;
        document.getElementById('editUsername').value = userData.userName || '';
        document.getElementById('editEmail').value = userData.email || '';
        document.getElementById('editPhone').value = userData.phone || '';
        document.getElementById('editImgUrl').value = userData.img || '';
        
        // Format birthdate if exists
        if (userData.birthDate) {
            let formattedDate = '';
            
            // Check if birthDate is in dd/mm/yyyy format
            if (userData.birthDate.includes('/')) {
                // Convert from dd/mm/yyyy to yyyy-mm-dd for the input
                const parts = userData.birthDate.split('/');
                if (parts.length === 3) {
                    // Make sure we have day, month, year parts
                    const day = parts[0];
                    const month = parts[1];
                    const year = parts[2];
                    formattedDate = `${year}-${month}-${day}`;
                }
            } else {
                // Try to parse as is
                const birthDate = new Date(userData.birthDate);
                if (!isNaN(birthDate.getTime())) {
                    formattedDate = birthDate.toISOString().split('T')[0];
                }
            }
            
            // Update the date input
            if (formattedDate) {
                document.getElementById('editBirthdate').value = formattedDate;
                
                // Initialize Ant Design DatePicker if needed
                if (window.antd && typeof window.antd.DatePicker !== 'undefined') {
                    const datePickerContainer = document.getElementById('editBirthdate').parentNode;
                    
                    // Replace native date input with Ant Design DatePicker
                    document.getElementById('editBirthdate').style.display = 'none';
                    
                    if (!datePicker) {
                        const datePickerElement = document.createElement('div');
                        datePickerElement.id = 'antDatePicker';
                        datePickerContainer.appendChild(datePickerElement);
                        
                        // Initialize Ant Design DatePicker
                        datePicker = new window.antd.DatePicker({
                            container: datePickerElement,
                            defaultValue: moment(formattedDate),
                            format: 'DD/MM/YYYY',
                            onChange: (date) => {
                                // Update the hidden native input when date changes
                                if (date) {
                                    document.getElementById('editBirthdate').value = date.format('YYYY-MM-DD');
                                } else {
                                    document.getElementById('editBirthdate').value = '';
                                }
                            }
                        });
                    } else {
                        // Update existing date picker value
                        datePicker.setValue(moment(formattedDate));
                    }
                }
            }
        }
        
        document.getElementById('editGender').value = userData.gender;
        document.getElementById('editAddress').value = userData.address || '';
        document.getElementById('editRole').value = userData.roleName || 'User';
        document.getElementById('editStatus').value = userData.status;

        // Remove loading state
        document.getElementById('editUserForm').classList.remove('opacity-50');
    } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error(error.message || 'Không thể tải thông tin người dùng. Vui lòng thử lại sau.');
    }
}

// Form validation and submission
function validateEditForm() {
    // Clear previous errors
    clearErrors();
    
    let isValid = true;
    
    // Validate email
    const email = document.getElementById('editEmail').value;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showError('email', 'Email không hợp lệ');
        isValid = false;
    }
    
    // Validate phone number
    const phone = document.getElementById('editPhone').value;
    const phoneRegex = /^\d{10,11}$/;
    if (!phoneRegex.test(phone)) {
        showError('phone', 'Số điện thoại phải có 10-11 chữ số');
        isValid = false;
    }
    
    // Validate birthdate
    const birthdate = document.getElementById('editBirthdate').value;
    if (birthdate) {
        // Check if date is valid according to dd/mm/yyyy format
        let isValidDate = true;
        if (datePicker) {
            // If using Ant Design DatePicker, rely on its validation
            isValidDate = datePicker.isValid();
        } else {
            // For native date input validation
            const dateObj = new Date(birthdate);
            isValidDate = !isNaN(dateObj.getTime());
        }
        
        if (!isValidDate) {
            showError('birthdate', 'Ngày sinh không hợp lệ, định dạng đúng là dd/mm/yyyy');
            isValid = false;
        }
    }
    
    return isValid;
}

function showError(field, message) {
    const errorElement = document.querySelector(`.error-message[data-field="${field}"]`);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.remove('hidden');
    }
}

function clearErrors() {
    document.querySelectorAll('.error-message').forEach(el => {
        el.textContent = '';
        el.classList.add('hidden');
    });
}
async function submitEditForm() {
    try {
        const userId = document.getElementById('editUserId').value;
        const accessToken = localStorage.getItem('access_token');
        
        if (!accessToken) {
            window.location.href = '/login.html';
            return;
        }
        
        // Get original birth date value
        const originalBirthDate = document.getElementById('editBirthdate').value;
        
        // Format birth date to dd/mm/yyyy if it exists
        let formattedBirthDate = '';
        if (originalBirthDate) {
            // Parse the date (expecting format YYYY-MM-DD from input)
            const dateObj = new Date(originalBirthDate);
            
            // Format to dd/mm/yyyy
            const day = String(dateObj.getDate()).padStart(2, '0');
            const month = String(dateObj.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
            const year = dateObj.getFullYear();
            
            formattedBirthDate = `${day}/${month}/${year}`;
        }
        
        // Prepare user data for update
        const userData = {
            userName: document.getElementById('editUsername').value,
            email: document.getElementById('editEmail').value,
            phone: document.getElementById('editPhone').value,
            birthDate: formattedBirthDate,
            gender: document.getElementById('editGender').value === 'true',
            address: document.getElementById('editAddress').value,
            status: document.getElementById('editStatus').value === 'true',
            img: document.getElementById('editImgUrl').value,
            id: document.getElementById('editUserId').value
        };
        
        // Show loading state
        document.getElementById('editUserForm').classList.add('opacity-50');
        
        // Send update request to API
        const response = await fetch(`http://localhost:5000/api/users/update/${userId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            // Handle validation errors from API
            if (result.errors && Array.isArray(result.errors)) {
                result.errors.forEach(error => {
                    showError(error.field, error.message);
                });
            }
            throw new Error(result.message || 'Cập nhật thất bại');
        }
        
        // Update successful
        toast.success('Cập nhật thông tin người dùng thành công!');
        closeEditModal();
        
        // Refresh user list and statistics
        fetchUsers();
        fetchAndUpdateStatistics();
        
    } catch (error) {
        console.error('Error updating user:', error);
        toast.error(error.message || 'Không thể cập nhật thông tin người dùng. Vui lòng thử lại sau.');
    } finally {
        // Remove loading state
        document.getElementById('editUserForm').classList.remove('opacity-50');
    }
}

async function deleteUser(userId) {
    if(confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
        try {
            const accessToken = localStorage.getItem('access_token');
            
            if (!accessToken) {
                window.location.href = '/login.html';
                return;
            }
            
            // Call API to delete user
            const response = await fetch(`http://localhost:5000/api/users/delete/${userId}`, {
                method: 'DELETE',
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
            
            if (response.status === 404) {
                toast.error('Không tìm thấy người dùng này!');
                return;
            }
            
            if (response.status === 500) {
                toast.error('Lỗi máy chủ, vui lòng thử lại sau!');
                return;
            }
            
            if (response.status === 200) {
                toast.success('Xóa người dùng thành công!');
                // Refresh the users list and statistics
                fetchUsers();
                fetchAndUpdateStatistics();
            } else {
                const result = await response.json();
                throw new Error(result.message || 'Xóa người dùng thất bại!');
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            toast.error(error.message || 'Không thể xóa người dùng. Vui lòng thử lại sau.');
        }
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    const addModal = document.getElementById('addModal');
    const editModal = document.getElementById('editModal');
    
    if (event.target == addModal) {
        addModal.style.display = 'none';
    }
    
    if (event.target == editModal) {
        editModal.style.display = 'none';
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


// Fetch users data
let currentPage = 1;
const itemsPerPage = 4;
let totalPages = 1;
let allUsers = [];
let filteredUsers = [];

async function fetchUsers() {
    try {
        const accessToken = localStorage.getItem('access_token');
        const searchTerm = document.getElementById('searchInput').value;
        const statusFilter = document.getElementById('statusFilter').value;
        
        if (!accessToken) {
            window.location.href = '/login.html';
            return;
        }

        const response = await fetch(`http://localhost:5000/api/users?page=${currentPage}&limit=${itemsPerPage}&search=${searchTerm}`, {
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
        
        // Calculate total pages based on API response
        totalPages = Math.ceil(result.data.total / itemsPerPage);
        
        updatePagination();
        displayUsers();
    } catch (error) {
        console.error('Error fetching users:', error);
        toast.error(error.message || 'Không thể tải danh sách người dùng. Vui lòng thử lại sau.');
    }
}

function handleSearch() {
    currentPage = 1; // Reset to first page when searching
    fetchUsers();
}

function updatePagination() {
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
    fetchUsers();
}

// Display users in table
function displayUsers() {
    const tableBody = document.getElementById('usersTableBody');
    const tableInfo = document.getElementById('tableInfo');
    
    // Clear table body
    tableBody.innerHTML = '';
    
    if (!filteredUsers.length) {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td colspan="8" class="text-center py-4 text-gray-500">Không có dữ liệu</td>`;
        tableBody.appendChild(tr);
        tableInfo.textContent = 'Không có kết quả';
        return;
    }
    
    // Display users for current page
    filteredUsers.forEach((user, index) => {
        const rowIndex = (currentPage - 1) * itemsPerPage + index + 1;
        
        const statusClass = user.status 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800';
        
        const statusText = user.status ? 'Đang hoạt động' : 'Đã khóa';
        
        const roleBadgeColor = getRoleBadgeColor(user.roleName || 'User');
        
        const row = document.createElement('tr');
        row.dataset.userId = user.id;
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm">${rowIndex}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <img src="${user.img || 'https://via.placeholder.com/40'}" alt="User Avatar" class="h-10 w-10 rounded-full">
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">${user.userName || ''}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-500">${user.email || ''}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-500">${user.phone || ''}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${roleBadgeColor}">
                    ${user.roleName || 'User'}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}">
                    ${statusText}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <button type="button" onclick="openEditModal('${user.id}')" class="text-blue-600 hover:text-blue-900 mr-3">
                    <i class="fas fa-edit"></i> Sửa
                </button>
                <button type="button" class="delete-user-btn text-red-600 hover:text-red-900" data-user-id="${user.id}">
                    <i class="fas fa-trash-alt"></i> Xóa
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Add event listeners to delete buttons
    document.querySelectorAll('.delete-user-btn').forEach(button => {
        button.addEventListener('click', function() {
            const userId = this.getAttribute('data-user-id');
            deleteUser(userId);
        });
    });
    
    // Update table info
    const startIndex = (currentPage - 1) * itemsPerPage + 1;
    const endIndex = Math.min(startIndex + filteredUsers.length - 1, currentPage * itemsPerPage);
    tableInfo.textContent = `Hiển thị ${startIndex} đến ${endIndex} của ${totalPages * itemsPerPage} người dùng`;
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

// Hàm lấy thống kê và cập nhật UI
async function fetchAndUpdateStatistics() {
    try {
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) {
            window.location.href = '/login.html';
            return;
        }

        const response = await fetch('http://localhost:5000/api/statistic/user', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });
        const result = await response.json();
        if (result.statusCode === 200 && result.data) {
            const stats = result.data;
            
            // Cập nhật các số liệu thống kê
            document.getElementById('totalUsersOverview').textContent = stats.userCount;
            document.querySelector('.bg-green-50 p:nth-child(2)').textContent = stats.userOfMonth;
            document.getElementById('activeUsersCount').textContent = stats.userActive;
            document.querySelector('.bg-red-50 p:nth-child(2)').textContent = stats.userInactive;

            // Cập nhật biểu đồ
            const ctx = document.getElementById('userChart').getContext('2d');
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: stats.chart.label,
                    datasets: [{
                        label: 'Người dùng mới',
                        data: stats.chart.data,
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
        }
    } catch (error) {
        console.error('Error fetching statistics:', error);
    }
}
