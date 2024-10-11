document.addEventListener('DOMContentLoaded', function() {
    // Get users and transactions
    fetch('/users')
        .then(response => response.json())
        .then(users => {
            const usersTable = document.getElementById('users');
            users.forEach(user => {
                if (user.approved) {
                    return;
                }
                const row = usersTable.insertRow();
                row.insertCell().textContent = user.username;
                row.insertCell().textContent = user.account_number;     
                const downloadLink = document.createElement('a');
                downloadLink.textContent = 'View ID';
                downloadLink.href = `/uploads?username=${user.username}`;
                downloadLink.target = '_blank';
                row.insertCell().appendChild(downloadLink);
                const approveButton = document.createElement('button');
                approveButton.textContent = 'Approve';
                approveButton.id = 'approve';
                approveButton.onclick = function() {
                    fetch('/approve', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ username: user.username })
                    })
                        .then(response => {
                            if (response.ok) {
                                row.remove();
                            }
                        })
                        .catch(error => console.error(error));
                };
                row.insertCell().appendChild(approveButton);
                const denyButton = document.createElement('button');
                denyButton.textContent = 'Deny';
                denyButton.onclick = function() {
                    fetch('/deny', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ username: user.username })
                    })
                        .then(response => {
                            if (response.ok) {
                                // Remove the row
                                row.remove();
                            }
                        })
                        .catch(error => console.error(error));
                };
                row.insertCell().appendChild(denyButton);
            });
        })
        .catch(error => console.error(error));
});