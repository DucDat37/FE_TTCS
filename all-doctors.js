// Global variables
let doctors = [];
let specialties = [];
let currentPage = 1;
const doctorsPerPage = 10;
let totalPages = 0;
let filteredDoctors = [];
let specialtyNameFromUrl = null;

// Get URL parameters
function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    const results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

// Fetch specialties data from API
async function fetchSpecialties() {
    try {
        const response = await fetch('http://localhost:5000/api/specialty?page=1&limit=500');
        const result = await response.json();
        
        if (result.statusCode === 200 && !result.isError) {
            specialties = result.data.specialty;
            populateSpecialtySelect();
            
            // Check if specialty is in URL
            specialtyNameFromUrl = getUrlParameter('specialty');
            if (specialtyNameFromUrl) {
                const specialty = specialties.find(s => s.name === specialtyNameFromUrl);
                if (specialty) {
                    const select = document.querySelector('select');
                    select.value = specialty.id;
                    filterDoctors();
                }
            }
        } else {
            console.error('Failed to fetch specialties:', result.message);
        }
    } catch (error) {
        console.error('Error fetching specialties:', error);
    }
}

// Populate specialty select dropdown
function populateSpecialtySelect() {
    const select = document.querySelector('select');
    select.innerHTML = '<option value="">Chọn chuyên khoa</option>';
    
    specialties.forEach(specialty => {
        const option = document.createElement('option');
        option.value = specialty.id;
        option.textContent = specialty.name;
        select.appendChild(option);
    });

    // Add event listener for specialty filter
    select.addEventListener('change', filterDoctors);
}

// Fetch doctors data from API
async function fetchDoctors() {
    try {
        const response = await fetch('http://localhost:5000/api/doctor?page=1&limit=5000');
        const result = await response.json();
        
        if (result.statusCode === 200 && !result.isError) {
            doctors = result.data.doctors;
            
            // If we have a specialty from URL, filter doctors immediately
            if (specialtyNameFromUrl) {
                const specialty = specialties.find(s => s.name === specialtyNameFromUrl);
                if (specialty) {
                    filteredDoctors = doctors.filter(doctor => doctor.specialtyId === specialty.id);
                } else {
                    filteredDoctors = [...doctors];
                }
            } else {
                filteredDoctors = [...doctors];
            }
            
            totalPages = Math.ceil(filteredDoctors.length / doctorsPerPage);
            displayDoctors();
            updatePageNumbers();
        } else {
            console.error('Failed to fetch doctors:', result.message);
        }
    } catch (error) {
        console.error('Error fetching doctors:', error);
    }
}

// Filter doctors by specialty
function filterDoctors() {
    const specialtySelect = document.querySelector('select');
    const selectedSpecialtyId = specialtySelect.value;
    
    if (selectedSpecialtyId) {
        filteredDoctors = doctors.filter(doctor => doctor.specialtyId === selectedSpecialtyId);
        // Update URL with selected specialty
        const newUrl = new URL(window.location.href);
        const specialty = specialties.find(s => s.id === selectedSpecialtyId);
        if (specialty) {
            newUrl.searchParams.set('specialty', specialty.name);
            window.history.pushState({}, '', newUrl);
        }
    } else {
        filteredDoctors = [...doctors];
        // Remove specialty from URL
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('specialty');
        window.history.pushState({}, '', newUrl);
    }
    
    currentPage = 1;
    totalPages = Math.ceil(filteredDoctors.length / doctorsPerPage);
    displayDoctors();
    updatePageNumbers();
}

// Kiểm tra trạng thái đăng nhập
function checkLoginStatus() {
    const token = localStorage.getItem('access_token');
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    
    const loginBtn = document.getElementById('loginBtn');
    const userDropdown = document.getElementById('userDropdown');
    const userAvatar = document.getElementById('userAvatar');
    const userName = document.getElementById('userName');
    const adminPage = document.getElementById('adminPage');
    
    if (token) {
        // Đã đăng nhập
        loginBtn.classList.add('hidden');
        userDropdown.classList.remove('hidden');
        if(userData.role === 'Admin' || userData.role === 'Doctor'){
            adminPage.classList.remove('hidden');
        }

        // Cập nhật thông tin người dùng
        if (userData.img) {
            userAvatar.src = userData.img;
        }
        if (userData.userName) {
            userName.textContent = userData.userName;
        }
    } else {
        // Chưa đăng nhập
        loginBtn.classList.remove('hidden');
        userDropdown.classList.add('hidden');
        adminPage.classList.add('hidden');
        
        // Thêm sự kiện click vào nút đăng nhập
        loginBtn.onclick = function() {
            window.location.href = 'auth.html';
        };
    }
}

// Hiển thị hoặc ẩn dropdown menu
function toggleDropdown() {
    const dropdownMenu = document.getElementById('userDropdownMenu');
    dropdownMenu.classList.toggle('hidden');
}

// Xử lý đăng xuất
function logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    window.location.reload();
}

// Function to create doctor row HTML
function createDoctorRow(doctor) {
    return `
        <div class="bg-white rounded-lg shadow-md p-4 flex items-center justify-between">
            <div class="flex items-center gap-4">
                <div style="width: 80px; height: 80px; min-width: 80px; overflow: hidden; border-radius: 50%;">
                    <img src="${doctor.img || 'https://via.placeholder.com/80'}" 
                         alt="${doctor.userName}" 
                         style="width: 100%; height: 100%; object-fit: cover;">
                </div>
                <div>
                    <h3 class="font-semibold text-lg">${doctor.degree || 'Bác sĩ'} ${doctor.userName}</h3>
                    <p class="text-gray-600">${doctor.specialtyName || 'Chưa cập nhật chuyên khoa'}</p>
                    <p class="text-gray-600">${doctor.description || 'Chưa cập nhật mô tả'}</p>
                </div>
            </div>
            <button onclick="window.location.href='booking-user.html?userId=${doctor.userId}&doctorId=${doctor.id}'" 
                    class="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition">
                Đặt lịch khám
            </button>
        </div>
    `;
}

// Function to update page numbers
function updatePageNumbers() {
    const pageNumbers = document.getElementById('pageNumbers');
    pageNumbers.innerHTML = '';
    
    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement('button');
        button.className = `px-4 py-2 border rounded-lg hover:bg-gray-100 ${i === currentPage ? 'bg-blue-500 text-white' : ''}`;
        button.textContent = i;
        button.onclick = () => goToPage(i);
        pageNumbers.appendChild(button);
    }
}

// Function to go to specific page
function goToPage(page) {
    currentPage = page;
    displayDoctors();
    updatePageNumbers();
}

// Function to display doctors for current page
function displayDoctors() {
    const doctorList = document.getElementById('doctorList');
    const start = (currentPage - 1) * doctorsPerPage;
    const end = start + doctorsPerPage;
    const pageDoctors = filteredDoctors.slice(start, end);
    
    doctorList.innerHTML = pageDoctors.map(doctor => createDoctorRow(doctor)).join('');
}

// Event listeners for prev/next buttons
document.getElementById('prevPage').onclick = () => {
    if (currentPage > 1) {
        goToPage(currentPage - 1);
    }
};

document.getElementById('nextPage').onclick = () => {
    if (currentPage < totalPages) {
        goToPage(currentPage + 1);
    }
};

// Initialize page
window.addEventListener('load', function() {
    checkLoginStatus();
    fetchSpecialties();
    fetchDoctors();
}); 