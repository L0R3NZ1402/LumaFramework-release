<?php
// luma-cli.php - CLI tool to update core.php settings using grouped blocks and sync key to core.js

if (php_sapi_name() !== 'cli') {
    exit("❌ This script can only be run from the command line.\n");
}

$coreFile = 'core.php';
$coreJSFile = 'core.js';

if (!file_exists($coreFile)) {
    exit("❌ Error: '$coreFile' not found in the current directory.\n");
}

$coreLines = file($coreFile);
$command   = $argv[1] ?? null;
$blockName = $argv[2] ?? null;
$pairArgs  = array_slice($argv, 3);

// === Function: Replace block content in core.php ===
function replaceBlockContent(&$lines, $block, $pairs): bool {
    $start = $end = null;
    $blockPattern = preg_quote($block, '/');

    foreach ($lines as $i => $line) {
        if (preg_match("/^\s*\/\/\s*$blockPattern\s*$/i", $line)) {
            if ($start === null) {
                $start = $i;
            } else {
                $end = $i;
                break;
            }
        }
    }

    if ($start === null || $end === null) {
        echo "❌ Block '//$block' not found or incomplete.\n";
        return false;
    }

    // Special handling for security block: only look for 'key=' and generate $key
    $newLines = [];
    if (strtolower($block) === 'security') {
        foreach ($pairs as $pair) {
            if (str_starts_with($pair, 'key=')) {
                $val = substr($pair, 4);
                $val = is_numeric($val) ? $val : "'" . addslashes($val) . "'";
                $newLines[] = "\$key = $val;\n";
                break;
            }
        }

        if (empty($newLines)) {
            echo "⚠️  'security' block update requires a 'key=value' pair.\n";
            return false;
        }
    } else {
        foreach ($pairs as $pair) {
            if (!str_contains($pair, '=')) {
                echo "⚠️  Invalid pair: '$pair' — must be key=value\n";
                continue;
            }

            [$key, $val] = explode('=', $pair, 2);
            $key = trim($key);
            $val = trim($val);
            $val = is_numeric($val) ? $val : "'" . addslashes($val) . "'";
            $newLines[] = "\$$key = $val;\n";
        }
    }

    // Replace block content
    $lines = array_merge(
        array_slice($lines, 0, $start + 1),
        $newLines,
        array_slice($lines, $end)
    );

    return true;
}

// === Function: update const key in core.js ===
function updateJSKey($jsFile, $newKey): bool {
    if (!file_exists($jsFile)) {
        echo "⚠️  JS file '$jsFile' not found. Skipping JS key update.\n";
        return false;
    }

    $jsLines = file($jsFile);
    $updated = false;

    foreach ($jsLines as &$line) {
        if (preg_match('/^\s*const\s+key\s*=\s*["\']?.+["\']?;/', $line)) {
            $line = "const key = " . addslashes($newKey) . ";\n";
            $updated = true;
            break;
        }
    }

    if ($updated) {
        file_put_contents($jsFile, implode('', $jsLines));
        echo "🟢 Updated 'key' in $jsFile.\n";
    } else {
        echo "⚠️  Could not find 'const key = ...;' in $jsFile.\n";
    }

    return $updated;
}

// === Command: set block key=value ... ===
if ($command === 'set') {
    if (!$blockName || empty($pairArgs)) {
        exit("❌ Usage: php luma-cli.php set [block] [key=value ...]\n");
    }

    if (replaceBlockContent($coreLines, $blockName, $pairArgs)) {
        file_put_contents($coreFile, implode('', $coreLines));
        echo "✅ Block '$blockName' updated successfully.\n";

        // Also update JS key if this is the security block
        if (strtolower($blockName) === 'security') {
            foreach ($pairArgs as $pair) {
                if (str_starts_with($pair, 'key=')) {
                    $newKey = substr($pair, 4);
                    updateJSKey($coreJSFile, $newKey);
                    break;
                }
            }
        }
    } else {
        echo "⚠️  Update failed. No changes made.\n";
    }

} elseif ($command === 'show') {
    echo "📦 Current Luma Config in $coreFile:\n";
    foreach ($coreLines as $line) {
        if (preg_match("/^\s*\$(\w+)\s*=\s*(.+);/", $line, $matches)) {
            echo "  - {$matches[1]}: " . trim(trim($matches[2]), "'\"") . "\n";
        }
    }

} elseif ($command === 'reload') {
    $coreLines = file($coreFile);
    echo "🔄 Reloaded content of $coreFile. You can now run further commands.\n";

} else {
    echo "🛠️  Luma CLI (Block-Based)\n";
    echo "Usage:\n";
    echo "  php luma-cli.php set [block] [key=value ...]   Replace variables inside a block\n";
    echo "  php luma-cli.php show                          Show all config variables\n";
    echo "  php luma-cli.php reload                        Reload the core.php file\n";
    echo "  Example blocks: connection, security, etc.\n";
}
?>
