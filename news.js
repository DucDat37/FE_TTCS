let currentPage = 1;
const itemsPerPage = 12;
let allNews = [];
let filteredNews = [];
let currentSearch = '';
let currentCategory = '';
let currentAuthor = '';
let editor; // CKEditor instance
let editEditor; // CKEditor instance for edit

const CATEGORY_TYPES = {
    '0': { text: 'Không xác định', color: 'bg-gray-500' },
    '1': { text: 'Thông báo', color: 'bg-blue-500' },
    '2': { text: 'Tin tức', color: 'bg-green-500' },
    '3': { text: 'Giải trí', color: 'bg-purple-500' }
};

// Kiểm tra trạng thái đăng nhập
function checkLoginStatus() {
    const token = localStorage.getItem('access_token');
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    
    const userAvatar = document.getElementById('userAvatar');
    const userNameElement = document.querySelector('.cursor-pointer span');
    
    if (token && userData) {
        // Đã đăng nhập
        if (userData.img) {
            userAvatar.src = userData.img;
        }
        
        if (userData.userName) {
            userNameElement.textContent = userData.userName;
        } 
        else if (userData.role === 'Admin') {
            userNameElement.textContent = 'Admin';
        }
    } else {
        // Chưa đăng nhập, chuyển hướng về trang đăng nhập
        window.location.href = 'auth.html';
    }
}

function showGlobalLoading() {
    document.getElementById('globalLoading').style.display = 'flex';
}
function hideGlobalLoading() {
    document.getElementById('globalLoading').style.display = 'none';
}

// Fetch authors from users API
async function fetchAuthors() {
    try {
        showGlobalLoading();
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) {
            window.location.href = '/login.html';
            return;
        }
        const response = await fetch('http://localhost:5000/api/users?page=1&limit=999', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });
        const result = await response.json();
        if (result.statusCode === 200 && result.data) {
            const authors = result.data.users;
            populateAuthorFilter(authors);
        }
    } catch (error) {
        console.error('Error fetching authors:', error);
        toast.error('Không thể tải danh sách tác giả!');
    } finally {
        hideGlobalLoading();
    }
}

function populateAuthorFilter(authors) {
    const authorFilter = document.getElementById('authorFilter');
    authorFilter.innerHTML = '<option value="">Tất cả tác giả</option>';
    
    authors.forEach(author => {
        if (author.userName) {
            authorFilter.innerHTML += `<option value="${author.userName}">${author.userName}</option>`;
        }
    });
}

// Hàm fetch danh sách bài đăng
async function fetchNews() {
    try {
        showGlobalLoading();
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) {
            window.location.href = '/login.html';
            return;
        }
        const response = await fetch(`http://localhost:5000/api/news?page=${currentPage}&limit=${itemsPerPage}&search=${currentSearch}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });
        const result = await response.json();
        if (result.statusCode === 200 && result.data) {
            allNews = result.data.news;
            applyFilters();
            renderNews();
            updatePagination(result.data.total);
            updateTableInfo((currentPage - 1) * itemsPerPage + 1, Math.min(currentPage * itemsPerPage, result.data.total), result.data.total);
        }
    } catch (error) {
        console.error('Error fetching news:', error);
        toast.error('Không thể tải danh sách bài đăng!');
    } finally {
        hideGlobalLoading();
    }
}

function applyFilters() {
    filteredNews = allNews.filter(news => {
        const matchesCategory = !currentCategory || news.type === currentCategory;
        const matchesAuthor = !currentAuthor || news.user.userName === currentAuthor;
        return matchesCategory && matchesAuthor;
    });
}

// Hàm render danh sách bài đăng
function renderNews() {
    const tbody = document.getElementById('newsTableBody');
    tbody.innerHTML = '';
    
    if (!filteredNews.length) {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td colspan="7" class="text-center py-4 text-gray-500">Không có dữ liệu</td>`;
        tbody.appendChild(tr);
        return;
    }

    filteredNews.forEach((news, index) => {
        const category = CATEGORY_TYPES[news.type] || CATEGORY_TYPES['0'];
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">${index + 1}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <img src="${news.img || 'https://via.placeholder.com/40'}" alt="News" class="h-10 w-10 rounded">
            </td>
            <td class="px-6 py-4 whitespace-nowrap">${news.name || ''}</td>
            <td class="px-6 py-4 whitespace-nowrap">${news.user.userName || ''}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 py-1 text-xs font-semibold rounded-full text-white ${category.color}">
                    ${category.text}
                </span>
            </td>
            <td class="px-6 py-4 description-cell">${news.description || ''}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <button onclick="openEditModal('${news.id}')" class="text-blue-500 hover:text-blue-700 mr-3">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteNews('${news.id}')" class="text-red-500 hover:text-red-700">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function updateTableInfo(start, end, total) {
    const tableInfo = document.getElementById('tableInfo');
    if (total === 0) {
        tableInfo.textContent = 'Không có kết quả';
    } else {
        tableInfo.textContent = `Hiển thị ${start}-${end} trên ${total} kết quả`;
    }
}

function updatePagination(total) {
    const totalPages = Math.ceil(total / itemsPerPage);
    const paginationContainer = document.getElementById('pagination');
    
    let html = '';
    html += `<button class="px-3 py-1 border rounded" ${currentPage === 1 ? 'disabled' : ''} onclick="changePage(${currentPage - 1})">Trước</button>`;
    
    for (let i = 1; i <= totalPages; i++) {
        html += `<button class="px-3 py-1 ${currentPage === i ? 'bg-blue-500 text-white' : 'border'} rounded" onclick="changePage(${i})">${i}</button>`;
    }
    
    html += `<button class="px-3 py-1 border rounded" ${currentPage === totalPages ? 'disabled' : ''} onclick="changePage(${currentPage + 1})">Sau</button>`;
    
    paginationContainer.innerHTML = html;
}

function changePage(page) {
    currentPage = page;
    fetchNews();
}

function handleSearch() {
    currentSearch = document.getElementById('searchInput').value;
    currentPage = 1;
    fetchNews();
}

function handleCategoryFilter() {
    currentCategory = document.getElementById('categoryFilter').value;
    currentPage = 1; // Reset to first page when filtering
    applyFilters();
    renderNews();
}

function handleAuthorFilter() {
    currentAuthor = document.getElementById('authorFilter').value;
    currentPage = 1; // Reset to first page when filtering
    applyFilters();
    renderNews();
}

function populateFilters() {
    const categoryFilter = document.getElementById('categoryFilter');
    const authorFilter = document.getElementById('authorFilter');
    
    // Populate category filter
    categoryFilter.innerHTML = '<option value="">Tất cả thể loại</option>';
    Object.entries(CATEGORY_TYPES).forEach(([value, { text }]) => {
        categoryFilter.innerHTML += `<option value="${value}">${text}</option>`;
    });
    
    // Populate author filter
    const authors = [...new Set(allNews.map(news => news.user.userName))];
    authorFilter.innerHTML = '<option value="">Tất cả tác giả</option>';
    authors.forEach(author => {
        if (author) {
            authorFilter.innerHTML += `<option value="${author}">${author}</option>`;
        }
    });
}

// Initialize CKEditor
async function initCKEditor() {
    try {
        editor = await ClassicEditor
            .create(document.querySelector('#addContent'), {
                toolbar: ['heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', '|', 'undo', 'redo'],
                placeholder: 'Nhập nội dung bài đăng...'
            });
    } catch (error) {
        console.error('Error initializing CKEditor:', error);
    }
}

// Modal functions
function openAddModal() {
    document.getElementById('addModal').style.display = 'block';
    document.getElementById('addNewsForm').reset();
    document.getElementById('imagePreview').classList.add('hidden');
    initCKEditor();
}

function closeAddModal() {
    document.getElementById('addModal').style.display = 'none';
    if (editor) {
        editor.destroy();
        editor = null;
    }
}

// Handle image preview
document.getElementById('addImage').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById('imagePreview');
            preview.querySelector('img').src = e.target.result;
            preview.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    }
});

async function initEditCKEditor(content = '') {
    try {
        if (editEditor) {
            await editEditor.destroy();
        }
        editEditor = await ClassicEditor.create(document.querySelector('#editContent'), {
            toolbar: ['heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', '|', 'undo', 'redo'],
            placeholder: 'Nhập nội dung bài đăng...'
        });
        editEditor.setData(content);
    } catch (error) {
        console.error('Error initializing CKEditor (edit):', error);
    }
}

async function openEditModal(newsId) {
    try {
        showGlobalLoading();
        // Fetch news detail by id
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) {
            window.location.href = '/login.html';
            return;
        }
        const response = await fetch(`http://localhost:5000/api/news/${newsId}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });
        const result = await response.json();
        console.log(result);
        if (result.statusCode === 200 && result.data) {
            const news = result.data;
            document.getElementById('editNewsId').value = news.id;
            document.getElementById('editTitle').value = news.name || '';
            document.getElementById('editCategory').value = news.type || '0';
            // Preview image
            let preview = document.getElementById('editImagePreview');
            if (preview) {
                preview.innerHTML = news.img ? `<img src="${news.img}" alt="Preview" class="max-h-40 rounded">` : '';
            }
            await initEditCKEditor(news.description || '');
            document.getElementById('editModal').style.display = 'block';
        } else {
            toast.error(result.message || 'Không tìm thấy bài đăng!');
        }
    } catch (error) {
        toast.error(error.message || 'Có lỗi khi lấy thông tin bài đăng!');
    } finally {
        hideGlobalLoading();
    }
}

function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
    if (editEditor) {
        editEditor.destroy();
        editEditor = null;
    }
}

// Form submissions
document.getElementById('addNewsForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    try {
        showGlobalLoading();
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) {
            window.location.href = '/login.html';
            return;
        }
        const formData = new FormData();
        formData.append('name', document.getElementById('addTitle').value);
        formData.append('description', editor.getData());
        formData.append('type', document.getElementById('addCategory').value);
        const imageFile = document.getElementById('addImage').files[0];
        if (imageFile) {
            formData.append('file', imageFile);
        }
        const response = await fetch('http://localhost:5000/api/news/add', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            },
            body: formData
        });
        const result = await response.json();
        if (response.ok && result.statusCode === 201) {
            toast.success('Thêm bài đăng thành công!');
            closeAddModal();
            fetchNews();
        } else {
            toast.error(result.message || 'Thêm bài đăng thất bại!');
        }
    } catch (error) {
        console.error('Error adding news:', error);
        toast.error('Có lỗi xảy ra khi thêm bài đăng!');
    } finally {
        hideGlobalLoading();
    }
});

document.getElementById('editNewsForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    try {
        showGlobalLoading();
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) {
            window.location.href = '/login.html';
            return;
        }
        const newsId = document.getElementById('editNewsId').value;
        const formData = new FormData();
        formData.append('name', document.getElementById('editTitle').value);
        formData.append('description', editEditor.getData());
        formData.append('type', document.getElementById('editCategory').value);
        const imageFile = document.getElementById('editImage').files[0];
        if (imageFile) {
            formData.append('file', imageFile);
        }
        const response = await fetch(`http://localhost:5000/api/news/update/${newsId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            },
            body: formData
        });
        const result = await response.json();
        if (response.ok && result.statusCode === 200) {
            toast.success('Cập nhật bài đăng thành công!');
            closeEditModal();
            fetchNews();
        } else {
            toast.error(result.message || 'Cập nhật bài đăng thất bại!');
        }
    } catch (error) {
        toast.error('Có lỗi xảy ra khi cập nhật!');
    } finally {
        hideGlobalLoading();
    }
});

async function deleteNews(newsId) {
    if (!confirm('Bạn có chắc chắn muốn xóa bài đăng này?')) return;
    try {
        showGlobalLoading();
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) {
            window.location.href = '/login.html';
            return;
        }
        const response = await fetch(`http://localhost:5000/api/news/delete/${newsId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });
        if (response.ok) {
            toast.success('Xóa bài đăng thành công!');
            fetchNews();
        } else {
            const result = await response.json();
            toast.error(result.message || 'Xóa bài đăng thất bại!');
        }
    } catch (error) {
        toast.error('Có lỗi xảy ra khi xóa!');
    } finally {
        hideGlobalLoading();
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    checkLoginStatus();
    fetchAuthors(); // Fetch authors first
    fetchNews();
    
    // Populate category filter
    const categoryFilter = document.getElementById('categoryFilter');
    categoryFilter.innerHTML = '<option value="">Tất cả thể loại</option>';
    Object.entries(CATEGORY_TYPES).forEach(([value, { text }]) => {
        categoryFilter.innerHTML += `<option value="${value}">${text}</option>`;
    });
    
    // Add event listeners
    document.getElementById('searchInput').addEventListener('input', handleSearch);
    document.getElementById('categoryFilter').addEventListener('change', handleCategoryFilter);
    document.getElementById('authorFilter').addEventListener('change', handleAuthorFilter);
}); 