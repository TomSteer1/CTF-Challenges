document.addEventListener('DOMContentLoaded', function() {
    // Get users and transactions
    fetch('/users')
        .then(response => response.json())
        .then(users => {
            const usersTable = document.getElementById('users');
            users.forEach(user => {
                const row = usersTable.insertRow();
                row.insertCell().textContent = user.username;
                row.insertCell().textContent = user.account_number;                
                row.insertCell().textContent = "£" + user.balance;
                if (user.approved) {
                    // Set the row to green
                    row.style.backgroundColor = 'lightgreen';
                }else {
                    row.style.backgroundColor = 'red';
                }
            });
        })
        .catch(error => console.error(error));
    fetch('/transactions')
        .then(response => response.json())
        .then(transactions => {
            const transactionsTable = document.getElementById('transactions');
            transactions.forEach(transaction => {
                const row = transactionsTable.insertRow();
                row.insertCell().textContent = transaction.username;
                row.insertCell().textContent = transaction.amount;
                row.insertCell().textContent = transaction.message;
                row.insertCell().textContent = transaction.timestamp;
            });
        })
        .catch(error => console.error(error));
});