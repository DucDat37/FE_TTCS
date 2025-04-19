// Chuyển sang form đăng ký
document.getElementById("registerLink").addEventListener("click", function (event) {
    event.preventDefault();
    document.getElementById("loginForm").style.display = "none";
    document.getElementById("registerForm").style.display = "block";
});

document.getElementById("registerNow").addEventListener("click", function (event) {
    event.preventDefault();
    document.getElementById("loginForm").style.display = "none";
    document.getElementById("registerForm").style.display = "block";
});

document.getElementById("loginLink2").addEventListener("click", function (event) {
    event.preventDefault();
    document.getElementById("loginForm").style.display = "block";
    document.getElementById("registerForm").style.display = "none";
});

// Chuyển sang form quên mật khẩu
document.getElementById("forgotPassword").addEventListener("click", function (event) {
    event.preventDefault();
    document.getElementById("loginForm").style.display = "none";
    document.getElementById("registerForm").style.display = "none";
    document.getElementById("ForgotPass").style.display = "block";
});

document.getElementById("returnLoginForm").addEventListener("click", function (event) {
    event.preventDefault();
    document.getElementById("loginForm").style.display = "block";
    document.getElementById("registerForm").style.display = "none";
    document.getElementById("ForgotPass").style.display = "none";
});

// Quay lại form đăng nhập từ form đăng ký
document.getElementById("backToLoginLink").addEventListener("click", function (event) {
    event.preventDefault();
    document.getElementById("registerForm").style.display = "none";
    document.getElementById("loginForm").style.display = "block";
});

// Xử lý gửi OTP
document.getElementById("sendOtpBtn").addEventListener("click", function () {
    var phone = document.getElementById("registerPhone").value;
    var accept = document.getElementById("accept").checked;
});

function checkFields() {
    var phone = document.getElementById("phone");
    var password = document.getElementById("password");
    var loginButton = document.getElementById("loginButton");

    if (phone.value.length !== 10 || isNaN(phone.value)) {
        // Hiển thị thông báo cảnh báo
        phoneWarning.classList.remove("hidden");
    } else {
        // Ẩn thông báo cảnh báo khi số điện thoại hợp lệ
        phoneWarning.classList.add("hidden");
    }

    if (password.value.length < 6) {
        passWordWarning.classList.remove("hidden")
    } else {
        passWordWarning.classList.add("hidden")
    }

    // Kiểm tra nếu các trường nhập liệu trống
    if (phone.value === "" || password.value === "" || isNaN(phone.value) || phone.value.length !== 10 || password.value.length < 6) {
        loginButton.disabled = true;  // Vô hiệu hóa nút đăng nhập
        loginButton.classList.remove('bg-blue-500', 'hover:bg-blue-600'); // Loại bỏ màu xanh khi vô hiệu hóa
        loginButton.classList.add('bg-gray-300', 'hover:bg-gray-400');  // Màu xám khi vô hiệu hóa
        loginButton.style.cursor = "not-allowed";  // Con trỏ biển báo cấm cho nút
    } else {
        phone.style.cursor = "auto";  // Con trỏ mặc định khi trường có dữ liệu
        password.style.cursor = "auto";  // Con trỏ mặc định khi trường có dữ liệu
        loginButton.disabled = false;  // Kích hoạt nút đăng nhập
        loginButton.classList.remove('bg-gray-300', 'hover:bg-gray-400'); // Loại bỏ màu xám
        loginButton.classList.add('bg-blue-500', 'hover:bg-blue-600');  // Đổi màu xanh khi nút hoạt động
        loginButton.style.cursor = "pointer";  // Con trỏ chỉ vào nút
    }
}

function checkRegister() {
    var phone = document.getElementById("registerPhone");
    var otpButton = document.getElementById("sendOtpBtn")
    var accept = document.getElementById("accept").checked;
    var email = document.getElementById("emailRegister").value;
    var userName = document.getElementById("userName");
    var passWord = document.getElementById("passwordRegister").value;
    var confirmPass = document.getElementById("passwordRegister2").value;

    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

    if (phone.value.length !== 10 || isNaN(phone.value)) {
        // Hiển thị thông báo cảnh báo
        phoneWarning2.classList.remove("hidden");
    } else {
        // Ẩn thông báo cảnh báo khi số điện thoại hợp lệ
        phoneWarning2.classList.add("hidden");
    }

    if (!emailRegex.test(email)) {
        emailWarning.classList.remove("hidden");
    } else {
        emailWarning.classList.add("hidden");
    }
    if (passWord.length < 6) {
        passWordWarning2.classList.remove("hidden");
    } else {
        passWordWarning2.classList.add("hidden");
    }
    if (confirmPass !== passWord) {
        passWordWarning3.classList.remove("hidden");
    } else {
        passWordWarning3.classList.add("hidden");
    }

    if (phone.value === "" || isNaN(phone.value) || phone.value.length !== 10 || userName.value === "" || !emailRegex.test(email) || !accept || confirmPass === "") {
        otpButton.disabled = true;
        otpButton.style.cursor = "not-allowed";
        otpButton.classList.add('bg-gray-300');
        otpButton.classList.remove('bg-blue-500', 'hover:bg-blue-600');
    } else {
        otpButton.disabled = false;
        otpButton.classList.remove('bg-gray-300');
        otpButton.classList.add('bg-blue-500', 'hover:bg-blue-600');
        otpButton.style.cursor = "pointer";
    }
}

function checkForgot() {
    var email = document.getElementById("email").value;
    var passWord = document.getElementById("passwordForgot").value;
    var confirmPassWord = document.getElementById("passwordForgot2").value;
    var sendOtpBtn = document.getElementById("sendOtp");
    var submitBtn = document.getElementById("submitButton");

    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

    if (!emailRegex.test(email)) {
        emailWarning2.classList.remove("hidden");
    } else {
        emailWarning2.classList.add("hidden");
        sendOtpBtn.disabled = false;
        sendOtpBtn.style.cursor = "pointer";
        sendOtpBtn.classList.add('hover:bg-green-600');
    }
    if (passWord.length < 6) {
        passWordWarning4.classList.remove("hidden");
    } else {
        passWordWarning4.classList.add("hidden");
    }
    if (passWord !== confirmPassWord) {
        passWordWarning5.classList.remove("hidden");
    } else {
        passWordWarning5.classList.add("hidden");
    }
    if (passWord === "" || !emailRegex.test(email) || confirmPassWord === "") {
        submitBtn.disabled = true;
        submitBtn.style.cursor = "not-allowed";
        submitBtn.classList.add('bg-gray-300');
        submitBtn.classList.remove('bg-blue-500', 'hover:bg-blue-600');
    } else {
        submitBtn.disabled = false;
        submitBtn.classList.remove('bg-gray-300');
        submitBtn.classList.add('bg-blue-500', 'hover:bg-blue-600');
        submitBtn.style.cursor = "pointer";
    }
}

async function handleLogin() {
    const phone = document.getElementById("phone").value;
    const password = document.getElementById("password").value;

    console.log('Attempting login with:', { phone, password }); // Debug log

    try {
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                emailOrPhone: phone,
                password: password
            })
        });

        console.log('Response status:', response.status); // Debug log

        const responseData = await response.json();
        console.log('Response data:', responseData); // Debug log

        if (response.ok) {
            // Store the access token in localStorage
            localStorage.setItem('access_token', responseData.data.access_token);
            // Store user data if needed
            localStorage.setItem('user', JSON.stringify(responseData.data.user));
            
            // Kiểm tra vai trò người dùng
            if (responseData.data.user.role === 'Admin') {
                // Nếu là Admin, chuyển hướng đến trang quản trị
                window.location.href = 'admin.html';
            } else {
                // Nếu không phải Admin, chuyển hướng đến trang chủ
                window.location.href = 'index.html';
            }
        } else {
            // Handle error response
            alert(responseData.message || 'Đăng nhập thất bại');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Có lỗi xảy ra khi đăng nhập');
    }
}

// Xử lý sự kiện click cho nút SendOTP
document.addEventListener('DOMContentLoaded', function() {
    // Xử lý sự kiện gửi OTP
    const sendOtpBtn = document.getElementById('sendOtp');
    if (sendOtpBtn) {
        sendOtpBtn.addEventListener('click', function() {
            const email = document.getElementById('email').value.trim();
            if (email) {
                // Hiển thị trạng thái đang gửi
                const originalText = sendOtpBtn.textContent;
                sendOtpBtn.textContent = 'Đang gửi...';
                sendOtpBtn.classList.add('whitespace-nowrap');
                sendOtpBtn.disabled = true;
                
                // Gọi API gửi OTP
                fetch(`http://localhost:5000/api/auth/send-email-reset-password?email=${encodeURIComponent(email)}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                .then(response => response.json())
                .then(data => {
                    if (data.isError === false && data.statusCode === 200) {
                        // Hiển thị thông báo thành công
                        alert(data.message);
                        // Focus vào ô nhập OTP
                        document.getElementById('enterOtp').focus();
                    } else {
                        // Hiển thị thông báo lỗi
                        alert('Có lỗi xảy ra: ' + (data.message || 'Không thể gửi OTP'));
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('Đã xảy ra lỗi khi gửi OTP. Vui lòng thử lại sau.');
                })
                .finally(() => {
                    // Khôi phục trạng thái nút
                    sendOtpBtn.textContent = originalText;
                    sendOtpBtn.classList.remove('whitespace-nowrap');
                    sendOtpBtn.disabled = false;
                });
            } else {
                alert('Vui lòng nhập email hợp lệ');
            }
        });
    }
    
    // Xử lý sự kiện đổi mật khẩu
    const submitButton = document.getElementById('submitButton');
    if (submitButton) {
        // Gắn sự kiện cho form chứa nút submit
        const forgotPasswordForm = submitButton.closest('form');
        forgotPasswordForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            // Lấy giá trị từ các trường nhập liệu
            const email = document.getElementById('email').value.trim();
            const otpCode = document.getElementById('enterOtp').value.trim();
            const password = document.getElementById('passwordForgot').value;
            const confirmPassword = document.getElementById('passwordForgot2').value;
            
            // Hiển thị trạng thái đang xử lý
            const originalText = submitButton.textContent;
            submitButton.textContent = 'Đang xử lý...';
            submitButton.disabled = true;
            
            // Gọi API đổi mật khẩu
            fetch('http://localhost:5000/api/auth/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: email,
                    code: otpCode,
                    password: password,
                    confirmPassword: confirmPassword
                })
            })
            .then(response => response.json())
            .then(data => {
                if (!data.error) {
                    // Đổi mật khẩu thành công
                    alert('Đổi mật khẩu thành công! Vui lòng đăng nhập lại.');
                    // Chuyển về trang đăng nhập
                    document.getElementById('loginForm').style.display = 'block';
                    document.getElementById('ForgotPass').style.display = 'none';
                } else {
                    // Xử lý lỗi
                    let errorMessage = data.message;
                    
                    // Hiển thị chi tiết lỗi nếu có
                    if (data.errors && data.errors.length > 0) {
                        errorMessage += ':\n';
                        data.errors.forEach(err => {
                            errorMessage += `- ${err.message}\n`;
                        });
                    }
                    
                    alert(errorMessage);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Đã xảy ra lỗi khi đổi mật khẩu. Vui lòng thử lại sau.');
            })
            .finally(() => {
                // Khôi phục trạng thái nút
                submitButton.textContent = originalText;
                submitButton.disabled = false;
            });
        });
    }
}); 