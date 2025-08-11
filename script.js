// *** สำคัญ: แทนที่ด้วย Web App URL ของคุณที่ได้จาก Google Apps Script ***
const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbxytri08f5N5VKGbIB4WSDQE-u7mwnSEOBmtGn9KbxIDI87Wq2Pr1GNSgrDIsl1SYm6ZQ/exec'; 

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registrationForm');
    const responseMessage = document.getElementById('responseMessage');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const distanceSelect = document.getElementById('distance');
    const priceInput = document.getElementById('price');

    // Function to calculate age from DOB
    function calculateAge(dob) {
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    }

    // Auto-fill price based on selected distance
    distanceSelect.addEventListener('change', () => {
        const selectedOption = distanceSelect.options[distanceSelect.selectedIndex];
        const price = selectedOption.dataset.price || '';
        priceInput.value = price;
    });

    // Handle form submission
    form.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent default form submission
        event.stopPropagation(); // Stop event propagation

        // Bootstrap form validation
        form.classList.add('was-validated');
        if (!form.checkValidity()) {
            return; // If form is invalid, stop here
        }

        // Show loading spinner
        loadingSpinner.classList.remove('d-none');
        responseMessage.innerHTML = ''; // Clear previous messages

        // Get form data
        const formData = new FormData(form);
        const data = {};
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }

        // Calculate Age if DOB is provided
        if (data.dob) {
            data.age = calculateAge(data.dob);
            document.getElementById('age').value = data.age; // Update displayed age
        }
        
        // Ensure price is a number
        data.price = parseFloat(data.price);
        if (isNaN(data.price)) {
            data.price = 0; // Default to 0 or handle error
        }

        try {
            const response = await fetch(WEB_APP_URL, {
                method: 'POST',
                mode: 'cors', // Crucial for cross-origin requests
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            loadingSpinner.classList.add('d-none'); // Hide loading spinner

            if (result.status === 'success') {
                responseMessage.innerHTML = `
                    <div class="alert alert-success" role="alert">
                        <strong>สมัครสำเร็จ!</strong><br>
                        ${result.message || 'ข้อมูลของท่านได้รับการบันทึกเรียบร้อยแล้ว'}
                        ${result.bibNumber ? `<br>เลข Bib เบื้องต้นของท่านคือ: <strong>${result.bibNumber}</strong>` : ''}
                        <br><br>
                        กรุณาตรวจสอบอีเมลของท่านสำหรับรายละเอียดการชำระเงิน และดำเนินการชำระเงินให้เรียบร้อยโดยเร็วที่สุด
                    </div>
                `;
                form.reset(); // Clear form
                form.classList.remove('was-validated'); // Reset validation state
                priceInput.value = ''; // Clear price input after reset
            } else {
                responseMessage.innerHTML = `
                    <div class="alert alert-danger" role="alert">
                        <strong>เกิดข้อผิดพลาด!</strong><br>
                        ${result.message || 'ไม่สามารถส่งใบสมัครได้ กรุณาลองใหม่อีกครั้ง'}
                    </div>
                `;
            }
        } catch (error) {
            loadingSpinner.classList.add('d-none'); // Hide loading spinner
            responseMessage.innerHTML = `
                <div class="alert alert-danger" role="alert">
                    <strong>การเชื่อมต่อมีปัญหา!</strong><br>
                    ไม่สามารถเชื่อมต่อกับระบบได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตแล้วลองใหม่อีกครั้ง หรือติดต่อผู้จัดงาน
                    <br>รายละเอียด: ${error.message}
                </div>
            `;
            console.error('Fetch error:', error);
        }
    });

});
