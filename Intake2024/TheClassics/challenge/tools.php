<?php
    # Include the config file
    include 'config.php';
    if (!isset($_SESSION["loggedin"]) || $_SESSION["loggedin"] !== true) {
        header("location: login.php");
        exit;
    }
    # Handle post requests
    if ($_SERVER["REQUEST_METHOD"] == "POST") {
        if (isset($_POST["uptime"])) {
            $output = shell_exec('uptime');
            echo "<pre>$output</pre>";
        } elseif (isset($_POST["logs"])) {
            $output = shell_exec('echo "Logs"');
            echo "<pre>$output</pre>";
        } elseif (isset($_POST["ping"])) {
            $ip = $_POST["ip"];
            # Check if the IP is set and not empty
            if (!isset($ip) || empty($ip)) {
                echo "Please enter an IP address.";
                return;
            }
            $output = shell_exec("ping -c 4 $ip");
            echo "<pre>$output</pre>";
        } elseif (isset($_POST["users"])) {
            $output = shell_exec('cat /etc/passwd | cut -d: -f1');
            echo "<pre>$output</pre>";
        }
        exit;
    }
    # If the request is not a POST request, return an error
    echo "Invalid request.";
?>
