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

// Ẩn dropdown khi click ra ngoài
window.addEventListener('click', function(event) {
    const userDropdown = document.getElementById('userDropdown');
    const dropdownMenu = document.getElementById('userDropdownMenu');
    
    if (!userDropdown.contains(event.target) && !dropdownMenu.classList.contains('hidden')) {
        dropdownMenu.classList.add('hidden');
    }
});

// Các danh mục tin tức
const CATEGORIES = {
    'all': 'Tất cả',
    '1': 'Thông báo',
    '2': 'Tin tức',
    '3': 'Giải trí'
};

let currentCategory = 'all';
let allNews = [];

// Fetch tin tức y tế
async function fetchNews() {
    try {
        console.log('Starting to fetch news...');
        const url = 'http://localhost:5000/api/news?page=1&limit=500';
        console.log('Fetching from URL:', url);
        
        const response = await fetch(url);
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('API Response:', result);
        
        if (result.statusCode === 200) {
            allNews = result.data.news;
            console.log('News data loaded:', allNews);
            
            // Hiển thị tin tức nổi bật
            displayFeaturedNews(allNews);
            
            // Hiển thị danh sách tin tức
            displayNews(allNews);
            
            // Tạo các tab danh mục
            createCategoryTabs();
        } else {
            console.error('API returned error:', result);
        }
    } catch (error) {
        console.error('Error fetching news:', error);
        // Hiển thị thông báo lỗi cho người dùng
        const newsContainer = document.querySelector('.grid.grid-cols-1.md\\:grid-cols-3.gap-6');
        if (newsContainer) {
            newsContainer.innerHTML = `
                <div class="col-span-3 text-center py-8 text-red-500">
                    Có lỗi xảy ra khi tải tin tức. Vui lòng thử lại sau.
                </div>
            `;
        }
    }
}

// Hiển thị tin tức nổi bật
function displayFeaturedNews(news) {
    const featuredContainer = document.getElementById('featured-news');
    if (!featuredContainer) {
        console.error('Không tìm thấy container cho tin tức nổi bật');
        return;
    }

    // Lấy 2 tin tức đầu tiên làm tin nổi bật
    const featuredItems = news.slice(0, 2);
    
    featuredContainer.innerHTML = featuredItems.map(item => `
        <article class="bg-white rounded-lg shadow-md overflow-hidden">
            <img src="${item.img}" 
                 alt="${item.name}" 
                 class="w-full h-64 object-cover">
            <div class="p-6">
                <span class="text-blue-500 text-sm font-semibold">${CATEGORIES[item.type] || 'Tin tức'}</span>
                <h2 class="text-xl font-bold mt-2 mb-3">${item.name}</h2>
                <p class="text-gray-600 mb-4">${item.description.substring(0, 150)}...</p>
                <a href="#" class="text-blue-500 font-semibold hover:underline">Đọc thêm →</a>
            </div>
        </article>
    `).join('');
}

// Hiển thị tin tức
function displayNews(news) {
    const newsContainer = document.getElementById('news-list');
    if (!newsContainer) {
        console.error('Không tìm thấy container cho danh sách tin tức');
        return;
    }

    // Lọc tin tức theo danh mục
    const filteredNews = currentCategory === 'all'
        ? news
        : news.filter(item => item.type === currentCategory);

    newsContainer.innerHTML = '';

    if (filteredNews.length === 0) {
        newsContainer.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                Không có tin tức nào trong danh mục này
            </div>
        `;
        return;
    }

    // Render từng hàng 3 bài
    for (let i = 0; i < filteredNews.length; i += 3) {
        const rowNews = filteredNews.slice(i, i + 3);
        const row = document.createElement('div');
        row.className = 'flex gap-6 mb-6';

        rowNews.forEach(item => {
            const newsCard = `
                <a href="news-detail.html?id=${item.id}" class="flex-1 flex flex-col hover:shadow-lg transition-shadow duration-200">
                    <article class="bg-white rounded-lg shadow-md overflow-hidden flex-1 flex flex-col h-full cursor-pointer">
                        <img src="${item.img}" alt="${item.name}" class="w-full h-48 object-cover">
                        <div class="p-4 flex flex-col h-full">
                            <span class="text-blue-500 text-sm font-semibold">${CATEGORIES[item.type] || 'Tin tức'}</span>
                            <h3 class="text-lg font-bold mt-2 mb-2">${item.name}</h3>
                            <p class="text-gray-600 text-sm mb-3 flex-grow">${item.description.substring(0, 150)}...</p>
                            <div class="flex items-center text-sm text-gray-500 mt-auto">
                                <span>${item.createdAt}</span>
                                <span class="mx-2">•</span>
                                <span>${item.user.userName}</span>
                            </div>
                        </div>
                    </article>
                </a>
            `;
            row.innerHTML += newsCard;
        });

        newsContainer.appendChild(row);
    }
}

// Tạo các tab danh mục
function createCategoryTabs() {
    const tabsContainer = document.querySelector('.flex.space-x-4.mb-8');
    if (!tabsContainer) {
        console.error('Không tìm thấy container cho các tab danh mục');
        return;
    }

    tabsContainer.innerHTML = '';

    // Tạo các tab theo thứ tự mong muốn
    const categoryOrder = ['all', '1', '2', '3'];
    
    categoryOrder.forEach(type => {
        const text = CATEGORIES[type];
        const tab = document.createElement('button');
        tab.className = `px-4 py-2 rounded-full whitespace-nowrap ${
            currentCategory === type 
            ? 'bg-blue-500 text-white' 
            : 'bg-gray-100 text-gray-700 hover:bg-blue-500 hover:text-white'
        }`;
        tab.textContent = text;
        tab.onclick = function() {
            currentCategory = type;
            createCategoryTabs();
            displayNews(allNews);
        };
        tabsContainer.appendChild(tab);
    });
}

// Xử lý nút "Xem thêm tin tức"
function loadMoreNews() {
    // TODO: Implement pagination or infinite scroll
    console.log('Loading more news...');
}

// Khởi tạo trang
document.addEventListener('DOMContentLoaded', function() {
    console.log('Page loaded, initializing...');
    checkLoginStatus();
    fetchNews();
    
    // Thêm sự kiện cho nút "Xem thêm tin tức"
    const loadMoreBtn = document.querySelector('.text-center.mt-8 button');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', loadMoreNews);
    }
}); 