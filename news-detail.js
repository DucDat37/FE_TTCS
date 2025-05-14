// Xử lý đăng nhập và load trang
document.addEventListener('DOMContentLoaded', function () {
    // Xử lý đăng nhập
    const loginBtn = document.getElementById('loginBtn');
    const userDropdown = document.getElementById('userDropdown');
    const userDropdownMenu = document.getElementById('userDropdownMenu');
    const userName = document.getElementById('userName');
    const userAvatar = document.getElementById('userAvatar');
    const adminPage = document.getElementById('adminPage');

    // Kiểm tra trạng thái đăng nhập
    function checkLoginStatus() {
        const token = localStorage.getItem('access_token');
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        
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

    checkLoginStatus();

    // Load news detail
    fetchNewsDetail();
});

// Xử lý dropdown menu
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

// Function to get news ID from URL
function getNewsId() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

// Function to fetch news detail
async function fetchNewsDetail() {
    const newsId = getNewsId();
    if (!newsId) {
        console.error('No news ID provided');
        return;
    }

    try {
        const response = await fetch(`http://localhost:5000/api/news/${newsId}`);
        const result = await response.json();
        
        if (result.statusCode === 200 && !result.isError) {
            displayNewsDetail(result.data);
            // Fetch related news after displaying current news
            fetchRelatedNews();
        } else {
            console.error('Error fetching news:', result.message);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// Function to display news detail
function displayNewsDetail(news) {
    // Update page title
    document.title = `${news.name} - YouMed`;
    
    // Update breadcrumb
    document.getElementById('news-title').textContent = news.name;
    
    // Update article content
    document.getElementById('article-title').textContent = news.name;
    document.getElementById('article-author').textContent = news.user.userName;
    document.getElementById('article-date').textContent = news.createdAt;
    
    // Update article image
    const articleImage = document.getElementById('article-image');
    articleImage.src = news.img;
    articleImage.alt = news.name;
    
    // Update article content
    document.getElementById('article-content').innerHTML = news.description;
}

// Function to fetch related news
async function fetchRelatedNews() {
    try {
        const response = await fetch('http://localhost:5000/api/news');
        const result = await response.json();
        
        if (result.statusCode === 200 && !result.isError) {
            const currentNewsId = getNewsId();
            // Filter out current news and get up to 2 related news
            const relatedNews = shuffleArray(
                result.data.news.filter(news => news.id !== currentNewsId)
            ).slice(0, 2);
            
            displayRelatedNews(relatedNews);
        }
    } catch (error) {
        console.error('Error fetching related news:', error);
    }
}

// Function to display related news
function displayRelatedNews(news) {
    const relatedArticlesContainer = document.getElementById('related-articles');
    
    relatedArticlesContainer.innerHTML = news.map(item => `
        <a href="news-detail.html?id=${item.id}" class="block group">
            <div class="bg-white rounded-lg shadow-md overflow-hidden">
                <img src="${item.img}" 
                     alt="${item.name}" 
                     class="w-full h-40 object-cover">
                <div class="p-4">
                    <h4 class="font-semibold group-hover:text-blue-600">${item.name}</h4>
                    <div class="text-sm text-gray-600 mt-2">${item.createdAt}</div>
                </div>
            </div>
        </a>
    `).join('');
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
} 