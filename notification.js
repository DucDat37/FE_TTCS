// Global variables
let currentPage = 1;
let itemsPerPage = 5;
let totalItems = 0;
let sortOrder = 'desc';
let userData = {};
let allNotifications = []; // Store all notifications for filtering
let currentNotificationId = null;

// Function to show/hide loading spinner
function toggleLoading(show) {
    const spinner = document.getElementById('loadingSpinner');
    const list = document.getElementById('notificationsList');
    if (show) {
        spinner.classList.remove('hidden');
        list.classList.add('opacity-50');
    } else {
        spinner.classList.add('hidden');
        list.classList.remove('opacity-50');
    }
}

// Function to render pagination
function renderPagination() {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const paginationContainer = document.getElementById('pagination');
    paginationContainer.innerHTML = '';

    // Previous button
    const prevButton = document.createElement('button');
    prevButton.className = `px-3 py-1 rounded ${currentPage === 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`;
    prevButton.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prevButton.disabled = currentPage === 1;
    prevButton.onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            fetchNotifications();
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
        firstPageButton.className = 'px-3 py-1 rounded bg-white text-gray-700 hover:bg-gray-50';
        firstPageButton.textContent = '1';
        firstPageButton.onclick = () => {
            currentPage = 1;
            fetchNotifications();
        };
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
        pageButton.className = `px-3 py-1 mx-1 rounded ${currentPage === i ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`;
        pageButton.textContent = i;
        pageButton.onclick = () => {
            currentPage = i;
            fetchNotifications();
        };
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
        lastPageButton.className = 'px-3 py-1 rounded bg-white text-gray-700 hover:bg-gray-50';
        lastPageButton.textContent = totalPages;
        lastPageButton.onclick = () => {
            currentPage = totalPages;
            fetchNotifications();
        };
        paginationContainer.appendChild(lastPageButton);
    }

    // Next button
    const nextButton = document.createElement('button');
    nextButton.className = `px-3 py-1 rounded ${currentPage === totalPages ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`;
    nextButton.innerHTML = '<i class="fas fa-chevron-right"></i>';
    nextButton.disabled = currentPage === totalPages;
    nextButton.onclick = () => {
        if (currentPage < totalPages) {
            currentPage++;
            fetchNotifications();
        }
    };
    paginationContainer.appendChild(nextButton);
}

// Function to render notifications
function renderNotifications(notifications) {
    const container = document.getElementById('notificationsList');
    container.innerHTML = '';

    if (notifications.length === 0) {
        container.innerHTML = `
            <div class="text-center text-gray-500 py-8">
                Không có thông báo nào
            </div>
        `;
    } else {
        notifications.forEach(notification => {
            // Limit content to one line
            const truncatedContent = notification.content.length > 100 
                ? notification.content.substring(0, 100) + '...' 
                : notification.content;

            const card = document.createElement('div');
            card.className = 'notification-card bg-white p-4 rounded-lg shadow hover:shadow-md';
            card.innerHTML = `
                <div class="flex justify-between items-start">
                    <div class="flex-1">
                        <h4 class="text-lg font-semibold text-gray-800">${notification.title}</h4>
                        <p class="text-gray-600 mt-1 line-clamp-1">${truncatedContent}</p>
                        <p class="text-sm text-gray-500 mt-2">
                            <span class="font-medium">Người nhận:</span> ${notification.userName || 'Không xác định'}
                        </p>
                        <p class="text-sm text-gray-500">${notification.createdAt}</p>
                    </div>
                    <div class="flex space-x-2 ml-4">
                        <button onclick="viewNotification('${notification.id}')" class="text-blue-500 hover:text-blue-700">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button onclick="confirmDelete('${notification.id}')" class="text-red-500 hover:text-red-700">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });
    }

    document.getElementById('tableInfo').textContent = `Hiển thị ${notifications.length} thông báo`;
    renderPagination();
}

// Function to populate user filter select
async function populateUserFilter() {
    try {
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) {
            throw new Error('Không tìm thấy token đăng nhập');
        }

        const response = await fetch('http://localhost:5000/api/users', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
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

        const userFilter = document.getElementById('userFilter');
        userFilter.innerHTML = '<option value="">Tất cả người dùng</option>';
        
        // Group users by role
        const usersByRole = {};
        result.data.users.forEach(user => {
            if (!usersByRole[user.roleName]) {
                usersByRole[user.roleName] = [];
            }
            usersByRole[user.roleName].push(user);
        });

        // Add users to select box grouped by role
        Object.keys(usersByRole).forEach(roleName => {
            const optgroup = document.createElement('optgroup');
            optgroup.label = roleName;
            
            usersByRole[roleName].forEach(user => {
                userData[user.id] = user;
                const option = document.createElement('option');
                option.value = user.id;
                option.textContent = `${user.userName} - ${user.email}${user.phone ? ` (${user.phone})` : ''}`;
                optgroup.appendChild(option);
            });
            
            userFilter.appendChild(optgroup);
        });

    } catch (error) {
        console.error('Error populating user filter:', error);
        toast.error('Không thể tải danh sách người dùng. Vui lòng thử lại sau.');
    }
}

// Function to filter notifications
function filterNotifications() {
    const selectedUserId = document.getElementById('userFilter').value;
    let filteredNotifications = [...allNotifications];

    if (selectedUserId) {
        filteredNotifications = filteredNotifications.filter(notification => 
            notification.userId === selectedUserId
        );
    }

    // Sort notifications
    filteredNotifications.sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    renderNotifications(filteredNotifications);
}

// Function to fetch notifications
async function fetchNotifications() {
    try {
        toggleLoading(true);
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) {
            throw new Error('Không tìm thấy token đăng nhập');
        }

        const url = new URL('http://localhost:5000/api/notification');
        url.searchParams.append('page', currentPage);
        url.searchParams.append('limit', itemsPerPage);
        url.searchParams.append('order', sortOrder);
        url.searchParams.append('sort', 'createdAt');

        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
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

        allNotifications = result.data.notifications;
        totalItems = result.data.total;
        
        // Render notifications directly from API response
        renderNotifications(allNotifications);
        renderPagination();

    } catch (error) {
        console.error('Error fetching notifications:', error);
        toast.error('Không thể tải danh sách thông báo. Vui lòng thử lại sau.');
    } finally {
        toggleLoading(false);
    }
}

// Function to handle logout
function handleLogout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

// Function to populate user select
async function populateUserSelect() {
    try {
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) {
            throw new Error('Không tìm thấy token đăng nhập');
        }

        const response = await fetch('http://localhost:5000/api/users', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
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

        userData = {};
        const userSelect = document.getElementById('userSelect');
        userSelect.innerHTML = '<option value="">Chọn người nhận</option>';
        
        // Group users by role
        const usersByRole = {};
        result.data.users.forEach(user => {
            if (!usersByRole[user.roleName]) {
                usersByRole[user.roleName] = [];
            }
            usersByRole[user.roleName].push(user);
        });

        // Add users to select box grouped by role
        Object.keys(usersByRole).forEach(roleName => {
            const optgroup = document.createElement('optgroup');
            optgroup.label = roleName;
            
            usersByRole[roleName].forEach(user => {
                userData[user.id] = user;
                const option = document.createElement('option');
                option.value = user.id;
                option.textContent = `${user.userName} - ${user.email}${user.phone ? ` (${user.phone})` : ''}`;
                optgroup.appendChild(option);
            });
            
            userSelect.appendChild(optgroup);
        });

    } catch (error) {
        console.error('Error populating user select:', error);
        toast.error('Không thể tải danh sách người dùng. Vui lòng thử lại sau.');
    }
}

// Function to open add modal
function openAddModal() {
    const modal = document.getElementById('addModal');
    if (modal) {
        modal.style.display = 'block';
        populateUserSelect();
    }
}

// Function to close add modal
function closeAddModal() {
    const modal = document.getElementById('addModal');
    if (modal) {
        modal.style.display = 'none';
        // Reset form
        document.getElementById('addNotificationForm').reset();
    }
}

// Function to create new notification
async function createNotification(formData) {
    try {
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) {
            throw new Error('Không tìm thấy token đăng nhập');
        }

        const response = await fetch('http://localhost:5000/api/notification/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify(formData)
        });

        if (response.status === 401) {
            handleLogout();
            return;
        }

        const result = await response.json();

        if (result.isError) {
            throw new Error(result.message);
        }

        toast.success('Tạo thông báo thành công!');
        closeAddModal();
        fetchNotifications();

    } catch (error) {
        console.error('Error creating notification:', error);
        toast.error(error.message || 'Có lỗi xảy ra khi tạo thông báo. Vui lòng thử lại sau.');
    }
}

// Function to view notification details
async function viewNotification(id) {
    try {
        toggleLoading(true);
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) {
            throw new Error('Không tìm thấy token đăng nhập');
        }

        const response = await fetch(`http://localhost:5000/api/notification/${id}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
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

        const notification = result.data;

        // Update modal content
        document.getElementById('detailUser').textContent = notification.userName || 'Không xác định';
        document.getElementById('detailTitle').textContent = notification.title;
        document.getElementById('detailContent').textContent = notification.content;
        document.getElementById('detailCreatedAt').textContent = notification.createdAt;

        // Store current notification ID for delete operation
        currentNotificationId = id;

        // Show modal
        document.getElementById('detailModal').style.display = 'block';

    } catch (error) {
        console.error('Error fetching notification details:', error);
        toast.error('Không thể tải chi tiết thông báo. Vui lòng thử lại sau.');
    } finally {
        toggleLoading(false);
    }
}

// Function to close detail modal
function closeDetailModal() {
    document.getElementById('detailModal').style.display = 'none';
    currentNotificationId = null;
}

// Function to confirm delete
function confirmDelete(id) {
    if (confirm('Bạn có chắc chắn muốn xóa thông báo này?')) {
        deleteNotification(id);
    }
}

// Function to delete notification
async function deleteNotification(id = currentNotificationId) {
    if (!id) return;

    try {
        toggleLoading(true);
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) {
            throw new Error('Không tìm thấy token đăng nhập');
        }

        const response = await fetch(`http://localhost:5000/api/notification/delete/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${accessToken}`
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

        toast.success('Xóa thông báo thành công!');
        closeDetailModal();
        fetchNotifications();

    } catch (error) {
        console.error('Error deleting notification:', error);
        toast.error(error.message || 'Có lỗi xảy ra khi xóa thông báo. Vui lòng thử lại sau.');
    } finally {
        toggleLoading(false);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    fetchNotifications();
    populateUserFilter();
    populateUserSelect();

    // Check if there's a notification ID in the URL
    const urlParams = new URLSearchParams(window.location.search);
    const notificationId = urlParams.get('id');
    if (notificationId) {
        viewNotification(notificationId);
    }

    // Add event listeners for filters
    document.getElementById('userFilter').addEventListener('change', function() {
        currentPage = 1;
        filterNotifications();
    });

    document.getElementById('sortOrder').addEventListener('change', function() {
        sortOrder = this.value;
        currentPage = 1;
        filterNotifications();
    });

    document.getElementById('pageSize').addEventListener('change', function() {
        itemsPerPage = parseInt(this.value);
        currentPage = 1;
        filterNotifications();
    });

    // Add form submission handler
    document.getElementById('addNotificationForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const userId = document.getElementById('userSelect').value;
        const title = document.getElementById('title').value;
        const content = document.getElementById('content').value;

        if (!userId) {
            toast.warning('Vui lòng chọn người nhận!');
            return;
        }

        if (!title) {
            toast.warning('Vui lòng nhập tiêu đề!');
            return;
        }

        if (!content) {
            toast.warning('Vui lòng nhập nội dung!');
            return;
        }

        await createNotification({
            userId,
            title,
            content
        });
    });
}); 