// login.js
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            try {
                const response = await fetch('http://localhost:5000/api/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username, password }),
                    credentials: 'include'
                });

                const data = await response.json();

                if (response.ok) {
                    // Simpan username di localStorage
                    localStorage.setItem('loggedInUser', username);
                    window.location.href = 'home.html';
                } else {
                    const errorElement = document.getElementById('error-message');
                    errorElement.textContent = data.message;
                }
            } catch (error) {
                console.error('Error:', error);
            }
        });
    }
});