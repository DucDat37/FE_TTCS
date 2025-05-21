// Check if user is logged in
function checkAuth() {
    const user = JSON.parse(localStorage.getItem('user'));
    const loginBtn = document.getElementById('loginBtn');
    const userDropdown = document.getElementById('userDropdown');
    const userName = document.getElementById('userName');
    const userAvatar = document.getElementById('userAvatar');
    const adminPage = document.getElementById('adminPage');

    if (user) {
        // User is logged in
        loginBtn.classList.add('hidden');
        userDropdown.classList.remove('hidden');
        userName.textContent = user.userName;
        userAvatar.src = user.img || 'https://via.placeholder.com/40';

        // Show admin page link if user is admin
        if (user.role === 'Admin') {
            adminPage.classList.remove('hidden');
        }
    } else {
        // User is not logged in
        loginBtn.classList.remove('hidden');
        userDropdown.classList.add('hidden');
    }
}

// Toggle dropdown menu
function toggleDropdown() {
    const dropdownMenu = document.getElementById('userDropdownMenu');
    dropdownMenu.classList.toggle('hidden');
}

// Handle logout
function logout() {
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

// Handle login button click
document.getElementById('loginBtn').addEventListener('click', () => {
    window.location.href = 'login.html';
});

// Close dropdown when clicking outside
document.addEventListener('click', (event) => {
    const dropdown = document.getElementById('userDropdown');
    const dropdownMenu = document.getElementById('userDropdownMenu');
    
    if (!dropdown.contains(event.target)) {
        dropdownMenu.classList.add('hidden');
    }
});

// Handle mobile menu toggle
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuLabels = document.querySelectorAll('label[for^="checkbox-"]');
    
    mobileMenuLabels.forEach(label => {
        label.addEventListener('click', function() {
            const targetId = this.getAttribute('for').replace('checkbox-', 'footer-');
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                targetElement.classList.toggle('hidden');
            }
        });
    });
});

// Check auth status when page loads
document.addEventListener('DOMContentLoaded', checkAuth);