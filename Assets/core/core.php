<?php
header("Content-Type: application/json");

if (file_exists("config.php")) {
    include "config.php";
} else {
    sendResponse(false, "❌ System Config missing");
    exit; // stop further execution
}

$thisHost = $host;
$thisUser = $username;
$thisPassword = $password;
$thisDb = $database;

$autoloadFile = __DIR__ . '/../../vendor/autoload.php';

if (file_exists($autoloadFile)) {
    require $autoloadFile;
}

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use PhpOffice\PhpWord\TemplateProcessor;

// === Database Connection ===
function getConnection($thisHost, $thisDb, $thisUser, $thisPassword)
{
    try {
        $conn = new PDO("mysql:host=$thisHost;dbname=$thisDb;charset=utf8", $thisUser, $thisPassword);
        $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        return $conn;
    } catch (PDOException $e) {
        sendResponse(false, "Database connection failed: " . $e->getMessage());
        exit;
    }
}

// === XOR Decryption ===
// function xorDecrypt($data, $thisKey)
// {
//     $decoded = base64_decode($data, true);
//     if ($decoded === false) return null;

//     $output = '';
//     for ($i = 0; $i < strlen($decoded); $i++) {
//         $output .= chr(ord($decoded[$i]) ^ $thisKey);
//     }

//     $json = json_decode($output, true);
//     return json_last_error() === JSON_ERROR_NONE ? $json : null;
// }

function xorDecrypt($data)
{
    $encrypted = $data; // direct from JSON payload

    $privateKey = file_get_contents("../../private.pem");

    // base64 decode first!
    $ciphertext = base64_decode($encrypted);

    $decrypted = '';
    $ok = openssl_private_decrypt($ciphertext, $decrypted, $privateKey);

    if ($ok && $decrypted) {
        $data = json_decode($decrypted, true);

        return $data;
    } else {
        sendResponse(false, "❌ Decryption failed.");
    }
}

// === Response Handler ===
function sendResponse($success, $message, $extra = [])
{
    echo json_encode(array_merge([
        "success" => $success,
        "message" => $message
    ], $extra));
    exit;
}

function handleModify($conn, $encryptedQueries, $enckey)
{
    $key = xorDecrypt($enckey);

    $data = DecryptPayload($encryptedQueries, $key);

    if (!is_array($data)) {
        sendResponse(false, "Decryption failed or invalid payload.");
    }

    try {
        $conn->beginTransaction();
        $lastId = null;

        foreach ($data as $q) {
            if (!isset($q['query'], $q['params']) || !is_array($q['params'])) {
                throw new Exception("Invalid query format.");
            }

            $stmt = $conn->prepare($q['query']);
            $stmt->execute($q['params']);
            $lastId = $conn->lastInsertId();
        }

        $conn->commit();
        sendResponse(true, "Transaction completed successfully.", ["id" => $lastId]);
    } catch (Exception $e) {
        $conn->rollBack();
        sendResponse(false, "Transaction failed: " . $e->getMessage());
    }
}

function handleSelect($conn, $encryptedPayload, $key)
{
    //decrypt key
    $key = xorDecrypt($key);

    //decrypt payload
    $data = DecryptPayload($encryptedPayload, $key);
    if (!isset($data['query'])) {
        sendResponse(false, "Missing query in payload.");
    }

    $stmt = $conn->prepare($data['query']);
    $stmt->execute($data['params'] ?? []);
    $result = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // echo json_encode(["data" => $result]);
    sendResponse(true, "✅ Data was selected successfully", ['data' => $result]);
    exit;
}

function handleUpload()
{
    if (isset($_FILES['fileToUpload']) && isset($_POST['location']) && isset($_POST['fileName'])) {
        $file = $_FILES['fileToUpload'];
        $location = rtrim($_POST['location'], '/'); // remove trailing slash if any
        $name = $_POST['fileName'];

        // Sanitize location & file name (important!)
        $location = preg_replace('/[^a-zA-Z0-9_\/\-]/', '', $location);
        $name = preg_replace('/[^a-zA-Z0-9_\-]/', '', $name);

        $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
        $targetPath = $location . '/' . $name . '.' . $extension;

        try {
            $relativePath = '../../' . $location;
            if (!file_exists($relativePath)) {
                mkdir($relativePath, 0777, true);
            }

            $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
            $targetPath = $relativePath . '/' . $name . '.' . $extension;

            if (move_uploaded_file($file['tmp_name'], $targetPath)) {
                echo json_encode(["success" => true, "path" => $targetPath, "fileName" => $name . '.' . $extension]);
            } else {
                echo json_encode(["success" => false, "message" => "Failed to move uploaded file."]);
            }
        } catch (Exception $e) { // 🛠️ FIXED: added correct Exception class
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
    } else {
        echo json_encode(["success" => false, "message" => "Missing required data/No file selected."]);
    }
}

function handleSession($process)
{
    if ($process == 'set') {
        session_start();

        header('Content-Type: application/json');
        if (isset($_POST['clearSession']) && $_POST['clearSession'] === 'true') {
            session_unset();
        }
        foreach ($_POST['sessionData'] as $key => $value) {
            $_SESSION[$key] = $value;
        }
        sendResponse(true, "Session Cleared: " . $_POST['clearSession']);
    } else if ($process == 'get') {
        session_start();
        header('Content-Type: application/json');

        $result = null;

        if (isset($_POST['session'])) {
            if (is_array($_POST['session'])) {
                // Multiple keys
                $result = [];
                foreach ($_POST['session'] as $k) {
                    $result[$k] = $_SESSION[$k] ?? null;
                }
            } else {
                // Single key
                $result = $_SESSION[$_POST['session']] ?? null;
            }
        }

        sendResponse(true, 'session retrieved', ["session" => $result]);

    } else if ($process == 'stop') {
        // Start session
        session_start();

        // Unset all session variables
        session_unset();

        // Destroy the session
        session_destroy();
        sendResponse(true, 'session stopped');
    }
}

function handleMail($encypedConfig, $enckey)
{
    error_reporting(E_ALL);
    ini_set('display_errors', 1);

    $key = xorDecrypt($enckey);

    $decrypted = DecryptPayload($encypedConfig, $key);

    if (!isset($decrypted)) {
        echo json_encode(['success' => false, 'message' => 'Missing config.', 'Config' => $decrypted]);
        exit;
    }

    $config = $decrypted;

    // Required fields
    $requiredFields = ['Host', 'Username', 'Password', 'Port', 'FromEmail', 'FromName', 'ToEmail', 'ToName', 'Subject', 'Body'];

    foreach ($requiredFields as $field) {
        if (empty($config[$field])) {
            echo json_encode(['success' => false, 'message' => "Missing field: $field"]);
            exit;
        }
    }

    // Send email using PHPMailer
    $mail = new PHPMailer(true);

    try {
        $mail->isSMTP();
        $mail->Host = $config['Host'];
        $mail->SMTPAuth = true;
        $mail->Username = $config['Username'];
        $mail->Password = $config['Password'];
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port = $config['Port'];

        $mail->setFrom($config['FromEmail'], $config['FromName']);
        $mail->addAddress($config['ToEmail'], $config['ToName']);

        $mail->Subject = $config['Subject'];
        $mail->isHTML(true);
        $mail->Body = $config['Body'];

        // Optional: add plain text version
        if (!empty($config['AltBody'])) {
            $mail->AltBody = $config['AltBody'];
        }

        $mail->send();
        echo json_encode(['success' => true, 'message' => 'Email sent successfully.']);
    } catch (Exception $e) {
        error_log("Email error: " . $mail->ErrorInfo);
        echo json_encode(['success' => false, 'message' => 'Mailer Error: ' . $mail->ErrorInfo]);
    }
}

function handleDocx($config)
{
    if (!$config || !isset($config['template'], $config['fileName'], $config['data'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid config format.']);
        exit;
    }

    $templatePath = "../../" . $config['template'];
    $outputFile = $config['fileName'];
    $data = $config['data'];

    // Validate template path
    if (!file_exists($templatePath)) {
        http_response_code(404);
        echo json_encode(['error' => 'Template not found.']);
        exit;
    }

    // Directory where temp files are stored
    $dir = 'temp/';

    // Clear temp directory to avoid clutter
    if (is_dir($dir)) {
        $files = glob($dir . '*'); // get all file names in temp folder
        foreach ($files as $file) {
            if (is_file($file)) {
                unlink($file); // delete file
            }
        }
    } else {
        mkdir($dir, 0777, true);
    }

    // Process template
    $template = new TemplateProcessor($templatePath);

    foreach ($data as $key => $value) {
        $template->setValue($key, $value);
    }

    // Save final file
    $uniqueName = uniqid() . '.docx';
    $finalPath = $dir . $uniqueName;
    $template->saveAs($finalPath);

    // Return the file path as JSON
    // echo json_encode(['fileUrl' => "LumaFramework/" . $finalPath]);
    sendResponse(true, 'Generated docx: ', ['fileUrl' => "Assets/core/" . $finalPath]);
}

function handleSystemConfig($config)
{
    $decrypted = xorDecrypt($config);

    $host = $decrypted['host'] ?? '';
    $user = $decrypted['username'] ?? '';
    $pass = $decrypted['password'] ?? '';
    $db = $decrypted['database'] ?? '';

    // --- Build PHP config ---
    $configContent = "<?php\n";
    $configContent .= "\$host = '$host';\n";
    $configContent .= "\$username = '$user';\n";
    $configContent .= "\$password = '$pass';\n";
    $configContent .= "\$database = '$db';\n";
    $configContent .= "?>\n";


    // --- Save files ---
    $filePhp = __DIR__ . "/config.php";

    $phpSaved = @file_put_contents($filePhp, $configContent);

    if ($phpSaved !== false) {
        sendResponse(true, '✅ Config and Security saved successfully.');
    } else {
        sendResponse(false, '❌ Failed to save one or more config files. Check file permissions.');
    }
}

function handleGetProjectDirectories()
{
    $dir = '../../js/pages';
    $folders = [];

    foreach (scandir($dir) as $item) {
        if ($item !== '.' && $item !== '..' && is_dir($dir . '/' . $item)) {
            $folders[] = $item;
        }
    }

    sendResponse(true, 'Directories retreived: ', ["directories" => $folders]);
}

function handleCreateProjectDirectory($config)
{
    $decrypted = xorDecrypt($config);
    $path = "../../js/pages/" . $decrypted['directory'];

    if (!file_exists($path)) {
        if (mkdir($path, 0777, true)) {
            sendResponse(true, 'Directory was created');
        } else {
            sendResponse(false, 'Directory creation failed');
        }
    } else {
        sendResponse(false, 'Directory already exist');
    }
}

function handleCreatePage($config)
{
    $decrypted = xorDecrypt($config);

    $directory = $decrypted['directory'] ?? '';
    $page = $decrypted['page'] ?? '';

    $newDirectory = '';
    if ($directory == 'Parent') {
        $newDirectory = $page . '.js';
    } else {
        $newDirectory = $directory . '/' . $page . '.js';
    }

    // --- Build page defaults ---
    $configContent = "Luma.View = Luma.View || {}; \n\n";
    $configContent .= "Luma.View.{$page} = function () {\n";
    $configContent .= "//Your codes here!! \n\n}";

    $fileJs = "../../js/pages/" . $newDirectory;

    $jsSaved = @file_put_contents($fileJs, $configContent);

    if ($jsSaved !== false) {
        sendResponse(true, '✅ Page was created');
    } else {
        sendResponse(false, '❌ Page creation failed');
    }
}

function handleDecryptData($config)
{
    $encrypted = $config; // direct from JSON payload

    $privateKey = file_get_contents("../../private.pem");

    // base64 decode first!
    $ciphertext = base64_decode($encrypted);

    if (!$ciphertext) {
        sendResponse(false, "❌ Invalid base64 input.");
        return;
    }

    $decrypted = '';
    $ok = openssl_private_decrypt($ciphertext, $decrypted, $privateKey);

    if ($ok && $decrypted) {
        $data = json_decode($decrypted, true);
        if ($data) {
            sendResponse(true, "✅ Data decrypted successfully", ['data' => $data]);
        } else {
            sendResponse(false, "❌ JSON parse failed after decryption.");
        }
    } else {
        sendResponse(false, "❌ Decryption failed.");
    }
}

function handleGenerateNewKeys()
{
    $openssl = '"C:\\Program Files\\OpenSSL-Win64\\bin\\openssl.exe"'; // adjust for dev env

    $privateKey = __DIR__ . "../../../private.pem";
    $publicKey = __DIR__ . "../../../public.pem";

    // Generate private key
    exec("$openssl genrsa -out $privateKey 2048 2>&1", $outputPrivate, $resultPrivate);

    // Generate public key
    exec("$openssl rsa -in $privateKey -outform PEM -pubout -out $publicKey 2>&1", $outputPublic, $resultPublic);

    if ($resultPrivate === 0 && $resultPublic === 0) {
        sendResponse(true, '🔑 Keys regenerated successfully!');
    } else {
        sendResponse(false, "❌ Failed to generate keys.", ["details" => [$outputPrivate, $outputPublic]]);
    }
    exit;
}

function handleGetKeys()
{
    $privateKey = @file_get_contents(__DIR__ . "../../../private.pem");
    $publicKey = @file_get_contents(__DIR__ . "../../../public.pem");

    sendResponse(true, '🔑 Keys retreived!', ['Keys' => ['public' => $publicKey, 'private' => $privateKey]]);
    exit;
}

function DecryptPayload($encryptedBase64, $key)
{
    $encrypted = base64_decode($encryptedBase64);
    $keyBytes = array_map('ord', str_split((string) $key));
    $keyLen = count($keyBytes);

    $output = '';
    for ($i = 0; $i < strlen($encrypted); $i++) {
        $output .= chr(ord($encrypted[$i]) ^ $keyBytes[$i % $keyLen]);
    }

    return json_decode($output, true);
}

function GetPayload($config, $key)
{
    $decryptedKey = xorDecrypt($key);
    $dec = DecryptPayload($config, $decryptedKey);
    sendResponse(true, 'Payload Received', ['config' => $dec]);
}

// === Main Execution ===
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    // Try to parse JSON input
    $input = json_decode(file_get_contents("php://input"), true);

    // If not JSON, fallback to $_POST (likely a file upload)
    $process = $input['process'] ?? $_POST['process'] ?? null;

    if (!$process) {
        sendResponse(false, "Missing 'process' key.");
        exit;
    }

    switch ($process) {
        case 'modify':
            $queries = $input['queries'] ?? null;
            $encKey = $input['key'] ?? null;
            if (!$queries || !$encKey) {
                sendResponse(false, "Missing 'queries' or 'encKey' parameter.");
                exit;
            }
            $conn = getConnection($thisHost, $thisDb, $thisUser, $thisPassword);
            handleModify($conn, $queries, $encKey);
            break;

        case 'select':
            $encPayload = $input['encPayload'] ?? null;
            $encKey = $input['key'] ?? null;
            if (!$encPayload || !$encKey) {
                sendResponse(false, "Missing 'encPayload' or 'encKey' parameter.");
                exit;
            }
            $conn = getConnection($thisHost, $thisDb, $thisUser, $thisPassword);
            handleSelect($conn, $encPayload, $encKey);
            break;

        case 'upload':
            if (!isset($_FILES['fileToUpload'])) {
                sendResponse(false, "File upload missing.");
                exit;
            }
            handleUpload(); // You can decrypt other fields here if needed
            break;

        case 'session':
            if (!isset($_POST['sessionProcess'])) {
                sendResponse(false, "session process not set.");
                exit;
            }
            handleSession($_POST['sessionProcess']);
            break;

        case 'mailer':
            $config = $input['config'] ?? null;
            $encKey = $input['key'] ?? null;
            if (!$config || !$encKey) {
                sendResponse(false, "Missing mailer config or enc key.");
                exit;
            }
            handleMail($config, $encKey);
            break;

        case 'generate_docx':
            $config = $input['config'] ?? null;
            if (!$config) {
                sendResponse(false, "Missing docx config.");
                exit;
            }
            handleDocx($config);
            break;

        case 'systemconfig':
            $config = $input['config'] ?? null;
            if (!$config) {
                sendResponse(false, "Missing config");
                exit;
            }
            handleSystemConfig($config);
            break;

        case 'directories':
            handleGetProjectDirectories();
            break;

        case 'createDirectory':
            $config = $input['config'] ?? null;
            if (!$config) {
                sendResponse(false, "Missing config");
                exit;
            }
            handleCreateProjectDirectory($config);
            break;

        case 'createPage':
            $config = $input['config'] ?? null;
            if (!$config) {
                sendResponse(false, "Missing config");
                exit;
            }
            handleCreatePage($config);
            break;

        case 'decryptData':
            $config = $input['config'] ?? null;
            if (!$config) {
                sendResponse(false, "Missing config");
                exit;
            }
            handleDecryptData($config);
            break;

        case 'generateKeys':
            handleGenerateNewKeys();
            break;

        case 'retreiveKeys':
            handleGetKeys();
            break;

        case 'retreiveDatabase':
            $databaseVar = ['host' => $thisHost, 'user' => $thisUser, 'password' => $thisPassword, 'db' => $thisDb];
            sendResponse(true, 'Database Retreived', ['connection' => $databaseVar]);
            break;

        case 'send_payload':
            $config = $input['config'] ?? null;
            $key = $input['key'] ?? null;
            GetPayload($config, $key);
            break;

        default:
            sendResponse(false, "Invalid process value.");
    }
} else {
    sendResponse(false, "Invalid request method.");
}

// === Database Connection ===
