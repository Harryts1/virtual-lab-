document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            try {
                const response = await fetch('https://virtual-lab-beige.vercel.app/api/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username, password }),
                    credentials: 'include',
                    mode: 'cors'
                });

                const data = await response.json();
                console.log('Login response:', data);
                
                if (response.ok) {
                    localStorage.setItem('loggedInUser', username);
                    setTimeout(() => {
                        window.location.href = 'home.html';
                    }, 100);
                } else {
                    const errorElement = document.getElementById('error-message');
                    if (errorElement) {
                        errorElement.textContent = data.message || 'Login failed';
                    } else {
                        alert(data.message || 'Login failed');
                    }
                }
            } catch (error) {
                console.error('Login error:', error);
                alert('Error connecting to server. Please try again.');
            }
        });
    }
});