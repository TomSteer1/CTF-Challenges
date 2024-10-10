<?php
    // Include the config file
    include 'config.php';

    // Check if the user is logged in, if not then redirect him to login page
    if(!isset($_SESSION["loggedin"]) || $_SESSION["loggedin"] !== true){
        header("location: login.php");
        exit;
    }
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>The best admin panel</title>
</head>
<body>

    <div class="page-header">
        <h1>Hi, <b><?php echo htmlspecialchars($_SESSION["username"]); ?></b>. Welcome to the admin portal.</h1>
    </div>
    <h1>Admin Panel</h1>
    <p>This is the admin panel. Only logged in users can see this page.</p>
    <p id="output"></p>
    <h2>Tools</h2>
    <h3>Uptime</h3>
    <p>Check the uptime of the server.</p>
    <button id="uptime">Check Uptime</button>
    <h3>Logs</h3>
    <p>View the logs of the server.</p>
    <button id="logs">View Logs</button>
    <h3>Ping</h3>
    <p>Ping an IP address.</p>
    <button id="ping">Ping</button>
    <input type="text" id="ip" placeholder="Enter IP address">
    <h3>Users</h3>
    <p>View the users of the server.</p>
    <button id="users">View Users</button>
</body>
<script>
    // Add event listeners to the buttons
    document.getElementById("uptime").addEventListener("click", function() {
        fetch("tools.php", {
            method: "POST",
            body: new URLSearchParams({
                uptime: true
            }),
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        }).then(response => response.text()).then(data => {
            document.getElementById("output").innerHTML = data;
        });
    });
    document.getElementById("logs").addEventListener("click", function() {
        fetch("tools.php", {
            method: "POST",
            body: new URLSearchParams({
                logs: true
            }),
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        }).then(response => response.text()).then(data => {
            document.getElementById("output").innerHTML = data;
        });
    });
    document.getElementById("ping").addEventListener("click", function() {
        var ip = document.getElementById("ip").value;
        fetch("tools.php", {
            method: "POST",
            body: new URLSearchParams({
                ping: true,
                ip: ip
            }),
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        }).then(response => response.text()).then(data => {
            document.getElementById("output").innerHTML = data;
        });
    });
    document.getElementById("users").addEventListener("click", function() {
        fetch("tools.php", {
            method: "POST",
            body: new URLSearchParams({
                users: true
            }),
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        }).then(response => response.text()).then(data => {
            document.getElementById("output").innerHTML = data;
        });
    });
</script>
</html>