<?php
    // Include the config file
    include 'config.php';

    // Check if the user is logged in, if not then redirect him to login page
    if(isset($_SESSION["loggedin"]) && $_SESSION["loggedin"] == true){
        header("location: /");
        exit;
    }
    // Define variables and initialize with empty values
    $username = $password = "";
    // Processing form data when form is submitted
    if($_SERVER["REQUEST_METHOD"] == "POST"){
        // Check if username is empty
        if(empty(trim($_POST["username"]))){
            echo "Please enter username.";
        } else{
            $username = trim($_POST["username"]);
        }
        // Check if password is empty
        if(empty(trim($_POST["password"]))){
            echo "Please enter your password.";
        } else{
            $password = trim($_POST["password"]);
        }
        // Validate credentials
        if(!empty($username) && !empty($password)){
					foreach($users as $user){
                if($user['username'] == $username && password_verify($password, $user['password'])){
                    // Store data in session variables
                    $_SESSION["loggedin"] = true;
                    $_SESSION["username"] = $username;
                    // Redirect user to welcome page
                    header("location: /");
                } else{
                    // Display an error message if password is not valid
                    echo "The password you entered was not valid.";
                }
            }
        }
    }
    ?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login</title>
</head>
<body>
    


    <form action="login.php" method="post">
        <div class="container">
            <h2>Login</h2>
            <p>Please fill in your credentials to login.</p>
            <label for="username"><b>Username</b></label>
            <input type="text" placeholder="Enter Username" name="username" required>
            <label for="password"><b>Password</b></label>
            <input type="password" placeholder="Enter Password" name="password" required>
            <button type="submit">Login</button>
        </div>
</body>
</html>
