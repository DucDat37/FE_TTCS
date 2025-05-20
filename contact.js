function getTopicLabel(topic) {
    const topicLabels = {
      appointment: "Đặt lịch khám",
      inquiry: "Thắc mắc dịch vụ",
      feedback: "Góp ý, phản hồi",
      other: "Khác"
    };
  
    return topicLabels[topic] || topic;
  }
document.querySelector("form").addEventListener("submit", async function (e) {
  e.preventDefault(); // Ngăn form submit mặc định

  // Lấy dữ liệu từ các trường trong form
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const subject = document.getElementById("subject").value;
  const message = document.getElementById("message").value.trim();

  // Kiểm tra đơn giản
  if (!name || !email || !phone || !message) {
      alert("Vui lòng điền đầy đủ các trường bắt buộc.");
      return;
  }

  // Tạo đối tượng chứa dữ liệu
  const data = {
      name: name,
      email: email,
      phone: phone,
      topic: getTopicLabel(subject),
      content: message
  };

  // Gửi dữ liệu đến API
  try {
      const response = await fetch("http://localhost:5000/api/notification/contactus", {
          method: "POST",
          headers: {
              "Content-Type": "application/json"
          },
          body: JSON.stringify(data)
      });

      const result = await response.json();

      if (response.ok) {
          toast.success(result.message || "Gửi tin nhắn thành công!");
          document.querySelector("form").reset(); // Xóa dữ liệu form
      } else {
          let errorMessage = result.message || "Lỗi không xác định";
          if (result.errors && result.errors.length > 0) {
              errorMessage += ':\n';
              result.errors.forEach(err => {
                  errorMessage += `- ${err.message}\n`;
              });
          }
          toast.error(errorMessage);
      }
  } catch (error) {
      console.error('Error:', error);
      toast.error('Đã xảy ra lỗi khi gửi tin nhắn. Vui lòng thử lại sau.');
  }
});

// Lấy các phần tử DOM
const authSection = document.getElementById('authSection');
const loginBtn = document.getElementById('loginBtn');
const userDropdown = document.getElementById('userDropdown');
const userDropdownMenu = document.getElementById('userDropdownMenu');
const userAvatar = document.getElementById('userAvatar');
const userName = document.getElementById('userName');
const adminPage = document.getElementById('adminPage');

// Kiểm tra trạng thái đăng nhập khi trang được tải
document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.status) {
        // Người dùng đã đăng nhập
        loginBtn.classList.add('hidden');
        userDropdown.classList.remove('hidden');
        userAvatar.src = user.img || 'https://via.placeholder.com/40';
        userName.textContent = user.userName || 'User';
        
        // Kiểm tra quyền admin
        if (user.role === 'Admin') {
            adminPage.classList.remove('hidden');
        }
    } else {
        // Người dùng chưa đăng nhập
        loginBtn.classList.remove('hidden');
        userDropdown.classList.add('hidden');
    }
});

// Xử lý sự kiện click vào nút đăng nhập
loginBtn.addEventListener('click', () => {
    window.location.href = 'auth.html';
});

// Hàm toggle dropdown menu
function toggleDropdown() {
    userDropdownMenu.classList.toggle('hidden');
}

// Đóng dropdown khi click ra ngoài
document.addEventListener('click', (event) => {
    if (!userDropdown.contains(event.target)) {
        userDropdownMenu.classList.add('hidden');
    }
});

// Hàm đăng xuất
function logout() {
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}
