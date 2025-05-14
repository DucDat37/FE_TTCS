// Sidebar data structure
const sidebarItems = [
    {
        href: 'admin.html',
        icon: 'fas fa-home',
        text: 'Dashboard'
    },
    {
        href: 'users.html',
        icon: 'fas fa-users',
        text: 'Quản lý người dùng'
    },
    {
        href: 'doctors.html',
        icon: 'fas fa-user-md',
        text: 'Quản lý bác sĩ'
    },
    {
        href: 'timeSlot.html',
        icon: 'fas fa-calendar-check',
        text: 'Quản lý lịch khám'
    },
    {
        href: 'booking.html',
        icon: 'fas fa-hospital',
        text: 'Quản lý lịch hẹn'
    },
    {
        text: 'Xác nhận lịch hẹn',
        icon: 'fas fa-clipboard-check',
        href: 'appointment.html'
    },
    {
        text: 'Quản lý hồ sơ bệnh án',
        icon: 'fas fa-file-medical',
        href: 'record.html'
    },
    {
        href: 'invoice.html',
        icon: 'fas fa-file-invoice-dollar',
        text: 'Quản lý hóa đơn'
    },
    {
        href: 'news.html',
        icon: 'fas fa-newspaper',
        text: 'Quản lý bài đăng'
    },
    {
        href: 'specialty.html',
        icon: 'fas fa-stethoscope',
        text: 'Quản lý chuyên khoa'
    },
    {
        href: 'service.html',
        icon: 'fas fa-cogs',
        text: 'Quản lý dịch vụ'
    },
    {
        href: 'notification.html',
        icon: 'fas fa-bell',
        text: 'Thông báo'
    },
    {
        href: 'statistics.html',
        icon: 'fas fa-chart-bar',
        text: 'Thống kê'
    },
];

// Function to render sidebar
function renderSidebar() {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        // Get current page from URL
        const currentPage = window.location.pathname.split('/').pop() || 'admin.html';
        
        // Get user role from localStorage
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        const userRole = userData.role;

        // Filter menu items based on user role
        const filteredItems = sidebarItems.filter(item => {
            if (userRole === 'Doctor') {
                // Hide specific menu items for Doctor role
                return !['users.html', 'specialty.html', 'service.html'].includes(item.href);
            }
            return true;
        });
        
        // Generate navigation items
        const navItems = filteredItems.map(item => {
            const isActive = item.href === currentPage;
            return `
                <a href="${item.href}" class="nav-item ${isActive ? 'active' : ''}">
                    <i class="${item.icon} mr-2"></i> ${item.text}
                </a>
            `;
        }).join('');

        // Set sidebar content
        sidebar.innerHTML = `
            <div class="flex items-center mb-8">
                <img src="hospital-logo.png" alt="YouMed Logo" class="h-10 w-10 mr-3">
                <h1 class="text-xl font-bold">YouMed Admin</h1>
            </div>
            <nav>
                ${navItems}
            </nav>
        `;
    }
}

// Add required styles
function addSidebarStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .sidebar {
            width: 250px;
            height: 100vh;
            position: fixed;
            left: 0;
            top: 0;
            background-color: #4a90e2;
            color: white;
            padding: 20px;
        }
        .main-content {
            margin-left: 250px;
            padding: 20px;
        }
        .nav-item {
            padding: 10px;
            margin: 5px 0;
            border-radius: 5px;
            cursor: pointer;
            transition: background-color 0.3s;
            display: block;
            text-decoration: none;
            color: white;
        }
        .nav-item:hover {
            background-color: #357abd;
        }
        .nav-item.active {
            background-color: #357abd;
        }
    `;
    document.head.appendChild(style);
}

// Initialize sidebar when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    addSidebarStyles();
    renderSidebar();
}); 