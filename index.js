// Kiểm tra trạng thái đăng nhập
function checkLoginStatus() {
    const token = localStorage.getItem('access_token');
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    
    const loginBtn = document.getElementById('loginBtn');
    const userDropdown = document.getElementById('userDropdown');
    const userAvatar = document.getElementById('userAvatar');
    const userName = document.getElementById('userName');
    
    if (token) {
        // Đã đăng nhập
        loginBtn.classList.add('hidden');
        userDropdown.classList.remove('hidden');
        if(userData.role === 'Admin'){
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

// Ẩn dropdown khi click ra ngoài
window.addEventListener('click', function(event) {
    const userDropdown = document.getElementById('userDropdown');
    const dropdownMenu = document.getElementById('userDropdownMenu');
    
    if (!userDropdown.contains(event.target) && !dropdownMenu.classList.contains('hidden')) {
        dropdownMenu.classList.add('hidden');
    }
});

// Fetch danh sách bác sĩ
async function fetchDoctors() {
    try {
        const response = await fetch('http://localhost:5000/api/doctor');
        const result = await response.json();
        
        if (result.statusCode === 200) {
            const doctors = result.data.doctors.slice(0, 6); // Lấy 6 bác sĩ đầu tiên
            displayDoctors(doctors);
        } else {
            console.error('Lỗi khi lấy danh sách bác sĩ:', result.message);
        }
    } catch (error) {
        console.error('Lỗi khi gọi API:', error);
    }
}

// Hiển thị danh sách bác sĩ
function displayDoctors(doctors) {
    const doctorsContainer = document.querySelector('.mt-4.flex.overflow-x-auto.space-x-4.px-8');
    doctorsContainer.innerHTML = ''; // Xóa nội dung cũ

    doctors.forEach(doctor => {
        const doctorCard = `
            <div class="group bg-white rounded-lg shadow-md p-4 flex-shrink-0 w-64 hover:shadow-lg transition-shadow duration-300">
                <img alt="Portrait of ${doctor.userName}" class="rounded-full mx-auto" height="100"
                    src="${doctor.img}"
                    width="100" />
                <div class="text-center mt-4">
                    <h3 class="font-semibold group-hover:text-blue-600 group-hover:underline">
                        ${doctor.degree} ${doctor.userName}
                    </h3>
                    <p class="text-gray-500">
                        ${doctor.specialtyName || 'Chuyên khoa'}
                    </p>
                    <p class="text-gray-500">
                        ${doctor.description || 'Bác sĩ chuyên khoa'}
                    </p>
                    <a href="booking-user.html?userId=${doctor.userId}&doctorId=${doctor.id}">
                        <button class="mt-4 bg-gray-100 text-gray-700 px-4 py-2 rounded-full group-hover:text-blue-600">
                            Đặt lịch khám
                        </button>
                    </a>
                </div>
            </div>
        `;
        doctorsContainer.innerHTML += doctorCard;
    });
}

// Fetch đội ngũ chuyên gia
async function fetchExperts() {
    try {
        const response = await fetch('http://localhost:5000/api/doctor');
        const result = await response.json();
        
        if (result.statusCode === 200) {
            const experts = result.data.doctors.slice(0, 6); // Lấy 6 chuyên gia đầu tiên
            displayExperts(experts);
        } else {
            console.error('Lỗi khi lấy danh sách chuyên gia:', result.message);
        }
    } catch (error) {
        console.error('Lỗi khi gọi API:', error);
    }
}

// Hiển thị đội ngũ chuyên gia
function displayExperts(experts) {
    const expertsContainer = document.querySelector('#expert-board .md\\:basis-2\\/3.gap-6.grid');
    if (!expertsContainer) return;

    expertsContainer.innerHTML = ''; // Xóa nội dung cũ

    experts.forEach(expert => {
        const expertCard = `
            <a href="" class="col-span-1 group flex items-center gap-4">
                <div class="relative rounded-full overflow-hidden w-24 h-24 bg-slate-200">
                    <img width="96" height="96"
                        src="${expert.img}"
                        alt="${expert.degree} ${expert.userName}"
                        class="entered lazyloaded">
                </div>
                <div class="flex-1">
                    <h4 class="font-medium group-hover:text-primary">${expert.degree} ${expert.userName}</h4>
                    <p class="text-sm">${expert.specialtyName || 'Chuyên khoa'}</p>
                </div>
            </a>
        `;
        expertsContainer.innerHTML += expertCard;
    });
}

let showAllSpecialties = false;
let specialtiesData = [];

async function loadSpecialties() {
    try {
        const response = await fetch('http://localhost:5000/api/specialty?page=1&limit=1999');
        const result = await response.json();
        
        if (!result.isError && result.data.specialty) {
            specialtiesData = result.data.specialty;
            renderSpecialties();
        }
    } catch (error) {
        console.error('Error loading specialties:', error);
    }
}

function renderSpecialties() {
    const specialtiesGrid = document.getElementById('specialties-grid');
    const toShow = showAllSpecialties ? specialtiesData : specialtiesData.slice(0, 6);
    specialtiesGrid.innerHTML = toShow.map(specialty => `
        <div class="col-span-1">
            <a href="#" class="flex flex-col items-center p-4 font-medium text-center text-xs md:text-sm hover:shadow-lg transition-shadow duration-300 rounded-xl transition">
                <div class="rounded-full mb-2 w-16 h-16">
                    <img src="${specialty.url}" 
                         alt="${specialty.name}" 
                         height="64" 
                         width="64"
                         class="w-full h-full object-cover">
                </div>
                <h3>${specialty.name}</h3>
            </a>
        </div>
    `).join('');
    // Đổi text nút
    document.getElementById('toggle-specialties-btn').textContent = showAllSpecialties ? 'Thu gọn' : 'Xem thêm';
}

document.getElementById('toggle-specialties-btn').onclick = function() {
    showAllSpecialties = !showAllSpecialties;
    renderSpecialties();
};

// Gọi loadSpecialties khi trang load
loadSpecialties();

// Fetch tin tức y tế
async function fetchNews() {
    try {
        const response = await fetch('http://localhost:5000/api/news');
        const result = await response.json();
        
        if (result.statusCode === 200) {
            const news = result.data.news;
            displayNews(news);
        } else {
            console.error('Lỗi khi lấy danh sách tin tức:', result.message);
        }
    } catch (error) {
        console.error('Lỗi khi gọi API tin tức:', error);
    }
}

// Hiển thị tin tức y tế
function displayNews(news) {
    const newsContainer = document.querySelector('#medical-news .grid');
    if (!newsContainer) return;

    // Thêm class để hiển thị một hàng và scroll ngang
    newsContainer.className = 'flex overflow-x-auto gap-6 px-4 pb-4';
    newsContainer.innerHTML = ''; // Xóa nội dung cũ

    news.forEach(item => {
        const newsCard = `
            <div class="flex-none w-80">
                <a href="news-detail.html?id=${item.id}" class="block group h-full">
                    <div class="bg-white rounded-lg shadow-md overflow-hidden h-full flex flex-col">
                        <img src="${item.img}" 
                             alt="${item.name}" 
                             class="w-full h-48 object-cover">
                        <div class="p-4 flex-grow">
                            <h3 class="font-semibold text-lg mb-2 group-hover:text-blue-600 line-clamp-2">${item.name}</h3>
                            <div class="flex items-center text-sm text-gray-600 mt-auto">
                                <span>${item.user.userName}</span>
                                <span class="mx-2">•</span>
                                <span>${item.createdAt}</span>
                            </div>
                        </div>
                    </div>
                </a>
            </div>
        `;
        newsContainer.innerHTML += newsCard;
    });
}

// Gọi hàm fetchExperts khi trang được tải
document.addEventListener('DOMContentLoaded', function() {
    checkLoginStatus();
    fetchDoctors();
    fetchExperts();
    loadSpecialties();
    fetchNews();
}); 