<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <title>LumaFramework</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="icon" type="image/x-icon" href="Assets/img/icon.png">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" /> <!--bootstrap -->
    <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet"> <!-- poppins font -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.13.1/font/bootstrap-icons.min.css"> <!--bootstrap icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/atom-one-dark-reasonable.min.css"><!-- code formatter -->
    <link rel="stylesheet" href="style.css">
    <?php 
        include 'Assets/style.html';
    ?>
</head>

<body class="main-body" id="mainBody">
    <div id="page-loader" class="loader" style="
        position: fixed;
        inset: 0;
        background: rgba(255, 255, 255, 1);
        z-index: 9999;
        display: none;
        justify-content: center;
        align-items: center;
    ">
        <div class="spinner-border text-dark" role="status" style="width: 3rem; height: 3rem;">
            <span class="visually-hidden">Loading...</span>
        </div>
    </div>
    <main id="main-content">
    

    </main>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script> <!--bootstrap -->
    <script src="https://code.jquery.com/jquery-3.6.0.js"></script> <!-- jquery -->
    <script src="https://cdn.jsdelivr.net/npm/jsencrypt/bin/jsencrypt.min.js"></script> <!-- openssl encryptor -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
    <script src="Assets/core/core.js"></script>
    <script src="js/core/config.js"></script>
</body>

</html>