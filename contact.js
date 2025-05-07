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
      subject: subject,
      message: message
  };

  // Gửi dữ liệu đến API
  try {
      const response = await fetch("https://localhost:5000/api/notification/contactus", {
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
