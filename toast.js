// Toast configuration
const toastConfig = {
    duration: 3000, // 3 seconds
    position: 'top-right',
    styles: {
        success: {
            background: '#d1fae5',
            color: '#065f46',
            borderLeft: '5px solid #10b981'
        },
        error: {
            background: '#fee2e2',
            color: '#991b1b',
            borderLeft: '5px solid #ef4444'
        },
        warning: {
            background: '#fef3c7',
            color: '#92400e',
            borderLeft: '5px solid #f59e0b'
        },
        info: {
            background: '#e0f2fe',
            color: '#1e40af',
            borderLeft: '5px solid #3b82f6'
        }
    }
};

// Toast object
const toast = {
    success: (title, message) => showToast('success', title, message),
    error: (title, message) => showToast('error', title, message),
    warning: (title, message) => showToast('warning', title, message),
    info: (title, message) => showToast('info', title, message)
};

// Function to show toast
function showToast(type, title, message = '') {
    const toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) {
        const container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'fixed top-4 right-4 z-50';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type} mb-4 transform translate-x-full transition-transform duration-300 ease-in-out`;
    toast.style = Object.entries(toastConfig.styles[type])
        .map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value}`)
        .join(';');

    const icon = getToastIcon(type);
    toast.innerHTML = `
        <div class="flex items-center p-4">
            <div class="toast-icon">${icon}</div>
            <div class="toast-content">
                <div class="font-semibold">${title}</div>
                <div class="text-sm">${message}</div>
            </div>
            <button class="toast-close ml-4" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;

    document.getElementById('toastContainer').appendChild(toast);

    // Trigger reflow to enable animation
    toast.offsetHeight;

    // Show toast
    toast.classList.remove('translate-x-full');
    toast.classList.add('translate-x-0');

    // Auto remove after duration
    setTimeout(() => {
        toast.classList.remove('translate-x-0');
        toast.classList.add('translate-x-full');
        setTimeout(() => toast.remove(), 300);
    }, toastConfig.duration);
}

// Function to get toast icon
function getToastIcon(type) {
    const icons = {
        success: '<i class="fas fa-check-circle text-green-500"></i>',
        error: '<i class="fas fa-exclamation-circle text-red-500"></i>',
        warning: '<i class="fas fa-exclamation-triangle text-yellow-500"></i>',
        info: '<i class="fas fa-info-circle text-blue-500"></i>'
    };
    return icons[type] || icons.info;
} 