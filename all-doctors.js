// Global variables
let doctors = [];
let specialties = [];
let currentPage = 1;
const doctorsPerPage = 3;
let totalPages = 0;
let filteredDoctors = [];
let specialtyNameFromUrl = null;
let searchTerm = '';


function showGlobalLoading() {
    const loading = document.getElementById('globalLoading');
    if (loading) loading.style.display = 'flex';
}

function hideGlobalLoading() {
    const loading = document.getElementById('globalLoading');
    if (loading) loading.style.display = 'none';
}


function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    const results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}


async function fetchSpecialties() {
    try {
        showGlobalLoading();
        const response = await fetch('http://localhost:5000/api/specialty?page=1&limit=500');
        const result = await response.json();
        
        if (result.statusCode === 200 && !result.isError) {
            specialties = result.data.specialty;
            populateSpecialtySelect();
            
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
    } finally {
        hideGlobalLoading();
    }
}


function populateSpecialtySelect() {
    const select = document.querySelector('select');
    select.innerHTML = '<option value="">Chọn chuyên khoa</option>';
    
    specialties.forEach(specialty => {
        const option = document.createElement('option');
        option.value = specialty.id;
        option.textContent = specialty.name;
        select.appendChild(option);
    });


    select.addEventListener('change', filterDoctors);
}


async function fetchDoctors() {
    try {
        showGlobalLoading();
        const response = await fetch('http://localhost:5000/api/doctor?page=1&limit=5000');
        const result = await response.json();
        
        if (result.statusCode === 200 && !result.isError) {
            doctors = result.data.doctors;
            
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
    } finally {
        hideGlobalLoading();
    }
}


function handleSearchInput(e) {
    searchTerm = e.target.value.trim().toLowerCase();
    filterDoctors();
}


function filterDoctors() {
    const specialtySelect = document.querySelector('select');
    const selectedSpecialtyId = specialtySelect.value;
    
    // Lọc theo chuyên khoa
    if (selectedSpecialtyId) {
        filteredDoctors = doctors.filter(doctor => doctor.specialtyId === selectedSpecialtyId);
        const newUrl = new URL(window.location.href);
        const specialty = specialties.find(s => s.id === selectedSpecialtyId);
        if (specialty) {
            newUrl.searchParams.set('specialty', specialty.name);
            window.history.pushState({}, '', newUrl);
        }
    } else {
        filteredDoctors = [...doctors];
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('specialty');
        window.history.pushState({}, '', newUrl);
    }

    // Lọc theo tên bác sĩ
    if (searchTerm) {
        filteredDoctors = filteredDoctors.filter(doctor =>
            doctor.userName && doctor.userName.toLowerCase().includes(searchTerm)
        );
    }
    currentPage = 1;
    totalPages = Math.ceil(filteredDoctors.length / doctorsPerPage);
    displayDoctors();
    updatePageNumbers();
}


function checkLoginStatus() {
    const token = localStorage.getItem('access_token');
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    
    const loginBtn = document.getElementById('loginBtn');
    const userDropdown = document.getElementById('userDropdown');
    const userAvatar = document.getElementById('userAvatar');
    const userName = document.getElementById('userName');
    const adminPage = document.getElementById('adminPage');
    
    if (token) {
        loginBtn.classList.add('hidden');
        userDropdown.classList.remove('hidden');
        if(userData.role === 'Admin' || userData.role === 'Doctor'){
            adminPage.classList.remove('hidden');
        }

        if (userData.img) {
            userAvatar.src = userData.img;
        }
        if (userData.userName) {
            userName.textContent = userData.userName;
        }
    } else {
        loginBtn.classList.remove('hidden');
        userDropdown.classList.add('hidden');
        adminPage.classList.add('hidden');
        loginBtn.onclick = function() {
            window.location.href = 'auth.html';
        };
    }
}


function toggleDropdown() {
    const dropdownMenu = document.getElementById('userDropdownMenu');
    dropdownMenu.classList.toggle('hidden');
}


function logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    window.location.reload();
}


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


function goToPage(page) {
    currentPage = page;
    displayDoctors();
    updatePageNumbers();
}


function displayDoctors() {
    const doctorList = document.getElementById('doctorList');
    const start = (currentPage - 1) * doctorsPerPage;
    const end = start + doctorsPerPage;
    const pageDoctors = filteredDoctors.slice(start, end);

    if (pageDoctors.length === 0) {
        doctorList.innerHTML = `
            <div class="flex flex-col items-center justify-center py-12">
                <img src="https://cdn-icons-png.flaticon.com/512/4076/4076549.png" alt="No doctors" class="w-32 h-32 mb-4 opacity-70" />
                <p class="text-lg text-gray-500 font-semibold">Không có bác sĩ nào trong chuyên khoa này</p>
            </div>
        `;
        return;
    }

    doctorList.innerHTML = pageDoctors.map(doctor => createDoctorRow(doctor)).join('');
}


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


document.addEventListener('DOMContentLoaded', function() {
    checkLoginStatus();
    fetchSpecialties();
    fetchDoctors();
    // Gắn sự kiện cho ô search
    const searchInput = document.querySelector('input[type="text"][placeholder*="bác sĩ"]');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearchInput);
    }
}); 