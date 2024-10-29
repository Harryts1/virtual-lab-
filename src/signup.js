document.addEventListener('DOMContentLoaded', function() {
    const signupForm = document.getElementById('signup-form');
    
    if (signupForm) {
        signupForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const username = document.getElementById('new-username').value;
            const email = document.getElementById('new-email').value;
            const password = document.getElementById('new-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            
            // Clear previous error messages
            const errorElement = document.getElementById('error-message');
            errorElement.textContent = '';

            // Validate password match
            if (password !== confirmPassword) {
                errorElement.textContent = 'Passwords do not match';
                return;
            }
            
            // Validate password strength
            if (password.length < 6) {
                errorElement.textContent = 'Password must be at least 6 characters long';
                return;
            }
            
            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                errorElement.textContent = 'Please enter a valid email address';
                return;
            }

            try {
                const response = await fetch('http://localhost:5000/api/signup', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username, email, password }),
                });

                const data = await response.json();

                if (response.ok) {
                    alert('Account created successfully! Please login.');
                    window.location.href = 'login.html';
                } else {
                    errorElement.textContent = data.message || 'Signup failed';
                }
            } catch (error) {
                console.error('Error:', error);
                errorElement.textContent = 'An error occurred. Please try again.';
            }
        });
    }
});