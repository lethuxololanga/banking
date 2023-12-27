// Updated JavaScript with improved structure and additional features

document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const balanceContainer = document.getElementById('balance-container');
    const logoutButton = document.getElementById('logout');
    const transferForm = document.getElementById('transfer-form');
    const balanceDisplay = document.getElementById('balance');
    const depositForm = document.getElementById('deposit-form');
    const depositContainer = document.getElementById('deposit-container');
    const transactionHistoryContainer = document.getElementById('transaction-history');
    const accountSettingsContainer = document.getElementById('account-settings');

    depositForm.addEventListener('submit', async function (event) {
        event.preventDefault();

        const amount = document.getElementById('deposit-amount').value;

        try {
            await makeDeposit(currentUser.username, amount);
            // Optionally, update UI or show success message
        } catch (error) {
            console.error('Error during deposit:', error);
            // Optionally, display an error message to the user
        }
    });

    async function makeDeposit(username, amount) {
        const response = await fetch('/deposit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `username=${username}&amount=${amount}`,
        });

        if (!response.ok) {
            throw new Error(`Deposit failed: ${response.statusText}`);
        }

        const data = await response.json();
        updateBalanceUI(data.username, data.balance);
    }

    let currentUser = null;

    loginForm.addEventListener('submit', async function (event) {
        event.preventDefault();
    
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
    
        try {
            const success = await authenticateUser(username, password);
            if (success) {
                currentUser = { username };
                showBalance();
            } else {
                alert('Invalid username or password. Please try again.');
            }
        } catch (error) {
            console.error('Error during login:', error);
            // Optionally, display an error message to the user
        }
    });

    async function authenticateUser(username, password) {
        console.log('Authenticating user:', username);
    
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `username=${username}&password=${password}`,
        });
    
        if (!response.ok) {
            throw new Error(`Authentication failed: ${response.statusText}`);
        }
    
        const data = await response.json();
    
        // Update the logic based on the actual server response
        if (data.username) {
            currentUser = { username: data.username };
            showBalance(data.username, data.balance);
            console.log('Login successful:', data.username);
            return true;
        } else {
            console.log('Invalid username or password.');
            return false;
        }
    }
    
    

    signupForm.addEventListener('submit', async function (event) {
        event.preventDefault();

        const newUsername = document.getElementById('newUsername').value;
        const newPassword = document.getElementById('newPassword').value;

        try {
            const usernameExists = await checkUsernameExists(newUsername);
            if (usernameExists) {
                alert('Username already exists. Please choose another username.');
            } else {
                await createAccount(newUsername, newPassword);
                currentUser = { username: newUsername };
                showBalance();
            }
        } catch (error) {
            console.error('Error during account creation:', error);
            // Optionally, display an error message to the user
        }
    });

    async function checkUsernameExists(username) {
        const response = await fetch('/checkUsername', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `username=${username}`,
        });

        if (!response.ok) {
            throw new Error(`Username check failed: ${response.statusText}`);
        }

        const data = await response.json();
        return data.exists; // Replace with the actual exists property from your server response
    }

    async function createAccount(username, password) {
        const response = await fetch('/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `username=${username}&password=${password}`,
        });

        if (!response.ok) {
            throw new Error(`Account creation failed: ${response.statusText}`);
        }
    }

    transferForm.addEventListener('submit', function (event) {
        event.preventDefault();
        // Implement money transfer logic here
        showBalance();
    });

    logoutButton.addEventListener('click', async function () {
        try {
            console.log('Logout button clicked.');
            currentUser = null; // Move this line here
            await logoutUser(); // Implement logout logic on the server side
            showLoginForm();
        } catch (error) {
            console.error('Error during logout:', error);
            // Optionally, display an error message to the user
        }
    });
    

    async function logoutUser() {
        // Simulate logout logic (replace with server-side logic)
        const response = await fetch('/logout', {
            method: 'POST',
        });

        if (!response.ok) {
            throw new Error(`Logout failed: ${response.statusText}`);
        }
    }

    function showBalance() {
        // Display user's balance and deposit form
        balanceDisplay.textContent = `Balance for ${currentUser.username}: R0.00`;
        balanceContainer.style.display = 'block';
        depositContainer.style.display = 'block';
    
        // Assuming you have a loginForm variable
        if (loginForm) {
            loginForm.style.display = 'none';
        }
    
        signupForm.style.display = 'none';
        transactionHistoryContainer.style.display = 'none';
        accountSettingsContainer.style.display = 'none';
    }
    

    function showLoginForm() {
        // Display the login form and hide other sections
        balanceContainer.style.display = 'none';
        depositContainer.style.display = 'none';
        loginForm.style.display = 'block';
        signupForm.style.display = 'none';
        transactionHistoryContainer.style.display = 'none';
        accountSettingsContainer.style.display = 'none';
    }

    // Additional Features (placeholders, server-side implementation needed)
    function updateBalanceUI(username, balance) {
        // Update the displayed balance
        const newBalance = balance.toFixed(2);
        balanceDisplay.textContent = `Balance for ${username}: R${newBalance}`;
    }
});
