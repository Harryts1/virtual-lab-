document.addEventListener('DOMContentLoaded', function() {
    const signupForm = document.getElementById('signup-form');
    
    if (signupForm) {
        signupForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const username = document.getElementById('new-username').value;
            const email = document.getElementById('new-email').value;
            const password = document.getElementById('new-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;

            const errorElement = document.getElementById('error-message');
            errorElement.textContent = '';
            errorElement.style.color = 'red'; 

            if (password !== confirmPassword) {
                errorElement.textContent = 'Passwords do not match';
                return;
            }

            if (password.length < 6) {
                errorElement.textContent = 'Password must be at least 6 characters long';
                return;
            }
            
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                errorElement.textContent = 'Please enter a valid email address';
                return;
            }

            try {
                const response = await fetch('https://virtual-lab-beige.vercel.app/api/signup', {
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