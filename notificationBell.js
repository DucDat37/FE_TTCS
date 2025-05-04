// Global variables
let notificationCount = 0;
let recentNotifications = [];

// Function to fetch notification count and recent notifications
async function fetchNotificationData() {
    try {
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) {
            throw new Error('Không tìm thấy token đăng nhập');
        }

        const response = await fetch('http://localhost:5000/api/notification?limit=3&order=desc&sort=createdAt', {
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

        // Update notification count
        notificationCount = result.data.total;
        updateNotificationCount();

        // Store recent notifications
        recentNotifications = result.data.notifications;
        updateNotificationDropdown();

    } catch (error) {
        console.error('Error fetching notification data:', error);
        toast.error('Không thể tải thông báo. Vui lòng thử lại sau.');
    }
}

// Function to update notification count badge
function updateNotificationCount() {
    const badge = document.querySelector('.notification-badge');
    if (badge) {
        badge.textContent = notificationCount;
        badge.style.display = notificationCount > 0 ? 'flex' : 'none';
    }
}

// Function to update notification dropdown
function updateNotificationDropdown() {
    const dropdown = document.getElementById('notificationDropdown');
    if (!dropdown) return;

    if (recentNotifications.length === 0) {
        dropdown.innerHTML = `
            <div class="p-4 text-center text-gray-500">
                Không có thông báo mới
            </div>
        `;
        return;
    }

    let html = '';
    recentNotifications.forEach(notification => {
        // Limit content to one line
        const truncatedContent = notification.content.length > 50 
            ? notification.content.substring(0, 50) + '...' 
            : notification.content;

        html += `
            <div class="notification-item p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100" 
                 onclick="viewNotificationFromBell('${notification.id}')">
                <div class="font-medium text-gray-800">${notification.title}</div>
                <div class="text-sm text-gray-600 line-clamp-1">${truncatedContent}</div>
                <div class="text-xs text-gray-500 mt-1">${notification.createdAt}</div>
            </div>
        `;
    });

    // Add "View All" link
    html += `
        <div class="p-3 text-center border-t border-gray-100">
            <a href="notification.html" class="text-blue-500 hover:text-blue-700 text-sm font-medium">
                Xem tất cả thông báo
            </a>
        </div>
    `;

    dropdown.innerHTML = html;
}

// Function to toggle notification dropdown
function toggleNotificationDropdown() {
    const dropdown = document.getElementById('notificationDropdown');
    if (dropdown) {
        dropdown.classList.toggle('show');
    }
}

// Function to view notification from bell dropdown
function viewNotificationFromBell(id) {
    // Close dropdown
    const dropdown = document.getElementById('notificationDropdown');
    if (dropdown) {
        dropdown.classList.remove('show');
    }

    // Redirect to notification page with the specific notification
    window.location.href = `notification.html?id=${id}`;
}

// Function to handle logout
function handleLogout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

// Function to initialize notification bell
function initializeNotificationBell() {
    // Find the notification bell container
    const bellContainer = document.getElementById('notificationBell');
    if (!bellContainer) return;

    // Add notification-badge class to the span
    const badge = bellContainer.querySelector('span');
    if (badge) {
        badge.classList.add('notification-badge');
    }

    // Add click event and cursor-pointer to bell icon
    const bellIcon = bellContainer.querySelector('i.fa-bell');
    if (bellIcon) {
        bellIcon.onclick = function(e) {
            e.stopPropagation(); // Prevent event bubbling
            toggleNotificationDropdown();
        };
        bellIcon.classList.add('cursor-pointer');
    }

    // Create dropdown menu
    const dropdown = document.createElement('div');
    dropdown.id = 'notificationDropdown';
    dropdown.className = 'dropdown-menu w-80 max-h-[400px] overflow-y-auto';
    bellContainer.appendChild(dropdown);

    // Add styles if not already present
    if (!document.getElementById('notificationBellStyles')) {
        const style = document.createElement('style');
        style.id = 'notificationBellStyles';
        style.textContent = `
            .notification-badge {
                display: none;
            }
            .dropdown-menu {
                display: none;
                position: absolute;
                right: 0;
                top: 100%;
                background-color: white;
                box-shadow: 0 2px 5px rgba(0,0,0,0.2);
                border-radius: 4px;
                z-index: 9000;
                margin-top: 8px;
            }
            .dropdown-menu.show {
                display: block;
            }
            .notification-item {
                transition: background-color 0.2s;
            }
            .notification-item:hover {
                background-color: #f9fafb;
            }
            .fa-bell.cursor-pointer {
                cursor: pointer;
                transition: color 0.2s;
            }
            .fa-bell.cursor-pointer:hover {
                color: #4a90e2;
            }
        `;
        document.head.appendChild(style);
    }

    // Initialize notification data
    fetchNotificationData();

    // Close dropdown when clicking outside
    document.addEventListener('click', function(event) {
        const dropdown = document.getElementById('notificationDropdown');
        const bell = bellContainer;
        
        if (dropdown && bell && !bell.contains(event.target) && !dropdown.contains(event.target)) {
            dropdown.classList.remove('show');
        }
    });

    // Refresh notification data every minute
    setInterval(fetchNotificationData, 60000);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeNotificationBell); 