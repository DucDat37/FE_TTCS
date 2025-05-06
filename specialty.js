// Constants
const API_URL = 'http://localhost:5000/api';
const SPECIALTY_API = `${API_URL}/specialty`;

// DOM Elements
document.addEventListener('DOMContentLoaded', function() {
    // Check for authentication
    checkAuthentication();

    // Form submission
    const addSpecialtyForm = document.getElementById('addSpecialtyForm');
    if (addSpecialtyForm) {
        addSpecialtyForm.addEventListener('submit', handleAddSpecialty);
    }

    const editSpecialtyForm = document.getElementById('editSpecialtyForm');
    if (editSpecialtyForm) {
        editSpecialtyForm.addEventListener('submit', handleEditSpecialty);
    }

    // Setup search and filter functionality
    setupFilters();

    // Load specialties on page load
    loadSpecialties();
});

// Check if user is authenticated
function checkAuthentication() {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
        window.location.href = 'auth.html';
        return false;
    }
    return true;
}

// Get headers with authorization token
function getAuthHeaders() {
    const accessToken = localStorage.getItem('access_token');
    return {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
    };
}

// Handle unauthorized response
function handleUnauthorizedResponse(response) {
    if (response.status === 401) {
        localStorage.removeItem('access_token');
        showNotification('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại', 'error');
        window.location.href = 'auth.html';
        return true;
    }
    return false;
}

function showGlobalLoading() {
    const loading = document.getElementById('globalLoading');
    if (loading) loading.style.display = 'flex';
}

function hideGlobalLoading() {
    const loading = document.getElementById('globalLoading');
    if (loading) loading.style.display = 'none';
}

// Load all specialties
async function loadSpecialties(page = 1, limit = 10, search = '', sort = 'createdAt', order = 'DESC') {
    if (!checkAuthentication()) return;
    try {
        showGlobalLoading();
        // Build query parameters
        const queryParams = new URLSearchParams({
            page,
            limit,
            sort
        });
        if (search) {
            queryParams.append('search', search);
        }
        if (order) {
            queryParams.append('order', order);
        }
        const response = await fetch(`${SPECIALTY_API}?${queryParams.toString()}`, {
            headers: getAuthHeaders()
        });
        if (handleUnauthorizedResponse(response)) return;
        const result = await response.json();
        if (result.isError === false) {
            displaySpecialties(result.data.specialty || result.data);
            // Update counters
            const currentDisplayed = result.data.specialty ? result.data.specialty.length : result.data.length;
            const totalSpecialties = result.data.total || currentDisplayed;
            document.getElementById('currentDisplayed').textContent = currentDisplayed;
            document.getElementById('totalSpecialties').textContent = totalSpecialties;
            // Update pagination if available
            updatePagination(page, Math.ceil(totalSpecialties / limit), limit);
        } else {
            showNotification('Lỗi khi tải danh sách chuyên khoa', 'error');
        }
    } catch (error) {
        console.error('Error loading specialties:', error);
        showNotification('Không thể kết nối đến máy chủ', 'error');
    } finally {
        hideGlobalLoading();
    }
}

// Fetch specialty by ID
async function fetchSpecialtyById(id) {
    if (!checkAuthentication()) return null;
    try {
        showGlobalLoading();
        const response = await fetch(`${SPECIALTY_API}/${id}`, {
            headers: getAuthHeaders()
        });
        if (handleUnauthorizedResponse(response)) return null;
        const result = await response.json();
        if (result.isError === false) {
            return result.data;
        } else {
            showNotification('Lỗi khi tải thông tin chuyên khoa', 'error');
            return null;
        }
    } catch (error) {
        console.error('Error fetching specialty:', error);
        showNotification('Không thể kết nối đến máy chủ', 'error');
        return null;
    } finally {
        hideGlobalLoading();
    }
}

// Display specialties in table
function displaySpecialties(specialties) {
    const tableBody = document.getElementById('specialtiesTable');
    tableBody.innerHTML = '';
    
    if (specialties.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="py-4 text-center text-gray-500">Không có dữ liệu</td>
            </tr>
        `;
        return;
    }
    
    specialties.forEach((specialty, index) => {
        const row = document.createElement('tr');
        
        // Format date
        const createdDate = new Date(specialty.createdAt);
        const formattedDate = createdDate.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
        
        row.innerHTML = `
            <td class="py-3 px-4 whitespace-nowrap">${index + 1}</td>
            <td class="py-3 px-4 whitespace-nowrap">
                ${specialty.url ? 
                    `<img src="${specialty.url}" alt="${specialty.name}" class="h-10 w-10 rounded-full object-cover" onerror="this.src='https://via.placeholder.com/40?text=N/A'; this.onerror=null;">` : 
                    '<div class="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center"><i class="fas fa-image text-gray-400"></i></div>'
                }
            </td>
            <td class="py-3 px-4 whitespace-nowrap">${specialty.name}</td>
            <td class="py-3 px-4 whitespace-nowrap">${formattedDate}</td>
            <td class="py-3 px-4 whitespace-nowrap">
                <button onclick="openEditModal('${specialty.id}', '${specialty.name}')" class="text-blue-500 hover:text-blue-700 mr-2">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="openDeleteModal('${specialty.id}')" class="text-red-500 hover:text-red-700">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

// Handle add specialty form submission
async function handleAddSpecialty(event) {
    event.preventDefault();
    if (!checkAuthentication()) return;
    const nameInput = document.getElementById('specialtyName');
    const fileInput = document.getElementById('specialtyImage');
    // Validate inputs
    if (!nameInput.value.trim()) {
        showNotification('Vui lòng nhập tên chuyên khoa', 'error');
        return;
    }
    // Create form data
    const formData = new FormData();
    formData.append('name', nameInput.value.trim());
    if (fileInput.files.length > 0) {
        formData.append('file', fileInput.files[0]);
    }
    try {
        showGlobalLoading();
        const accessToken = localStorage.getItem('access_token');
        const response = await fetch(`${SPECIALTY_API}/add`, {
            method: 'POST',
            body: formData,
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        if (handleUnauthorizedResponse(response)) return;
        const result = await response.json();
        if (result.isError === false) {
            // Show success message
            showNotification('Thêm chuyên khoa thành công', 'success');
            // Reset form
            nameInput.value = '';
            fileInput.value = '';
            // Reload specialties list
            loadSpecialties();
        } else {
            showNotification(result.message || 'Lỗi khi thêm chuyên khoa', 'error');
        }
    } catch (error) {
        console.error('Error adding specialty:', error);
        showNotification('Không thể kết nối đến máy chủ', 'error');
    } finally {
        hideGlobalLoading();
    }
}

// Open edit modal with specialty details
async function openEditModal(id, name) {
    if (!checkAuthentication()) return;
    
    // Show the modal
    const modal = document.getElementById('editSpecialtyModal');
    if (modal) {
        modal.classList.remove('hidden');
    }
    
    // Set initial values
    const idInput = document.getElementById('editSpecialtyId');
    const nameInput = document.getElementById('editSpecialtyName');
    const currentImageContainer = document.getElementById('currentImageContainer');
    
    if (idInput) idInput.value = id;
    if (nameInput) nameInput.value = name;
    
    // Fetch specialty details to get the image URL
    const specialty = await fetchSpecialtyById(id);
    
    // Display current image if it exists
    if (specialty && specialty.url && currentImageContainer) {
        currentImageContainer.innerHTML = `
            <div class="mb-3">
                <p class="text-sm text-gray-500 mb-2">Ảnh hiện tại:</p>
                <img src="${specialty.url}" alt="${name}" class="h-24 w-24 object-cover rounded-md border border-gray-200">
            </div>
        `;
        currentImageContainer.classList.remove('hidden');
    } else if (currentImageContainer) {
        currentImageContainer.innerHTML = '';
        currentImageContainer.classList.add('hidden');
    }
}

// Close edit modal
function closeEditModal() {
    const modal = document.getElementById('editSpecialtyModal');
    if (modal) {
        modal.classList.add('hidden');
    }
    
    // Reset form
    const form = document.getElementById('editSpecialtyForm');
    if (form) form.reset();
    
    // Hide current image
    const currentImageContainer = document.getElementById('currentImageContainer');
    if (currentImageContainer) {
        currentImageContainer.innerHTML = '';
        currentImageContainer.classList.add('hidden');
    }
}

// Open delete confirmation modal
function openDeleteModal(id) {
    const modal = document.getElementById('deleteSpecialtyModal');
    const confirmBtn = document.getElementById('confirmDelete');
    
    if (modal) {
        modal.classList.remove('hidden');
    }
    
    if (confirmBtn) {
        confirmBtn.setAttribute('data-id', id);
    }
}

// Close delete confirmation modal
function closeDeleteModal() {
    const modal = document.getElementById('deleteSpecialtyModal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

// Handle edit specialty form submission
async function handleEditSpecialty(event) {
    event.preventDefault();
    if (!checkAuthentication()) return;
    const idInput = document.getElementById('editSpecialtyId');
    const nameInput = document.getElementById('editSpecialtyName');
    const fileInput = document.getElementById('editSpecialtyImage');
    // Validate inputs
    if (!nameInput.value.trim()) {
        showNotification('Vui lòng nhập tên chuyên khoa', 'error');
        return;
    }
    // Create form data
    const formData = new FormData();
    formData.append('name', nameInput.value.trim());
    // Add ID parameter
    const id = idInput.value;
    if (fileInput.files.length > 0) {
        formData.append('file', fileInput.files[0]);
    }
    try {
        showGlobalLoading();
        const accessToken = localStorage.getItem('access_token');
        const response = await fetch(`${SPECIALTY_API}/update/${id}`, {
            method: 'PUT',
            body: formData,
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        if (handleUnauthorizedResponse(response)) return;
        const result = await response.json();
        if (result.isError === false) {
            // Show success message
            showNotification('Cập nhật chuyên khoa thành công', 'success');
            // Close modal
            closeEditModal();
            // Reload specialties list
            loadSpecialties();
        } else {
            showNotification(result.message || 'Lỗi khi cập nhật chuyên khoa', 'error');
        }
    } catch (error) {
        console.error('Error updating specialty:', error);
        showNotification('Không thể kết nối đến máy chủ', 'error');
    } finally {
        hideGlobalLoading();
    }
}

// Handle delete specialty
async function handleDeleteSpecialty(id) {
    if (!checkAuthentication()) return;
    try {
        showGlobalLoading();
        const accessToken = localStorage.getItem('access_token');
        const response = await fetch(`${SPECIALTY_API}/delete/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        if (handleUnauthorizedResponse(response)) return;
        const result = await response.json();
        if (result.isError === false) {
            // Show success message
            showNotification('Xóa chuyên khoa thành công', 'success');
            // Reload specialties list
            loadSpecialties();
            // Close modal
            closeDeleteModal();
        } else {
            showNotification(result.message || 'Lỗi khi xóa chuyên khoa', 'error');
        }
    } catch (error) {
        console.error('Error deleting specialty:', error);
        showNotification('Không thể kết nối đến máy chủ', 'error');
    } finally {
        hideGlobalLoading();
    }
}

// Display notification message
function showNotification(message, type = 'info') {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    // Set icon based on notification type
    let icon = 'fa-info-circle';
    if (type === 'success') {
        icon = 'fa-check-circle';
    } else if (type === 'error') {
        icon = 'fa-exclamation-circle';
    }
    
    // Set toast content
    toast.innerHTML = `
        <div class="toast-icon">
            <i class="fas ${icon}"></i>
        </div>
        <div class="toast-content">
            ${message}
        </div>
        <div class="toast-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </div>
    `;
    
    // Add toast to container
    const container = document.getElementById('toastContainer');
    container.appendChild(toast);
    
    // Show toast with animation
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // Automatically remove toast after 5 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 5000);
}

// Connect delete confirmation button
document.addEventListener('DOMContentLoaded', function() {
    const confirmDeleteBtn = document.getElementById('confirmDelete');
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            if (id) {
                handleDeleteSpecialty(id);
            }
        });
    }
});

// Update pagination controls
function updatePagination(currentPage, totalPages, limit) {
    const paginationContainer = document.querySelector('.flex.space-x-1');
    if (!paginationContainer) return;
    
    // Clear existing pagination
    paginationContainer.innerHTML = '';
    
    // Previous button
    const prevButton = document.createElement('button');
    prevButton.className = `px-3 py-1 bg-gray-200 text-gray-600 rounded-md hover:bg-gray-300 ${currentPage <= 1 ? 'opacity-50 cursor-not-allowed' : ''}`;
    prevButton.textContent = 'Previous';
    if (currentPage > 1) {
        prevButton.addEventListener('click', () => loadSpecialties(currentPage - 1, limit));
    }
    paginationContainer.appendChild(prevButton);
    
    // Page buttons
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, startPage + 4);
    
    for (let i = startPage; i <= endPage; i++) {
        const pageButton = document.createElement('button');
        pageButton.className = `px-3 py-1 ${i === currentPage ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'} rounded-md hover:bg-gray-300`;
        pageButton.textContent = i;
        pageButton.addEventListener('click', () => loadSpecialties(i, limit));
        paginationContainer.appendChild(pageButton);
    }
    
    // Next button
    const nextButton = document.createElement('button');
    nextButton.className = `px-3 py-1 bg-gray-200 text-gray-600 rounded-md hover:bg-gray-300 ${currentPage >= totalPages ? 'opacity-50 cursor-not-allowed' : ''}`;
    nextButton.textContent = 'Next';
    if (currentPage < totalPages) {
        nextButton.addEventListener('click', () => loadSpecialties(currentPage + 1, limit));
    }
    paginationContainer.appendChild(nextButton);
}

// Setup search and filter event listeners
function setupFilters() {
    const searchInput = document.getElementById('searchInput');
    const sortField = document.getElementById('sortField');
    const sortOrder = document.getElementById('sortOrder');
    const applyFilters = document.getElementById('applyFilters');

    // Apply filters button click
    if (applyFilters) {
        applyFilters.addEventListener('click', function() {
            const search = searchInput.value.trim();
            const sort = sortField.value;
            const order = sortOrder.value;
            loadSpecialties(1, 10, search, sort, order);
        });
    }

    // Search on enter key press
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const search = searchInput.value.trim();
                const sort = sortField.value;
                const order = sortOrder.value;
                loadSpecialties(1, 10, search, sort, order);
            }
        });
    }
} 