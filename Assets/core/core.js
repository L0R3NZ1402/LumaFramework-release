window.Luma = window.Luma || {};

Luma._boundElements = []; // To store { $el, type, handler }
Luma.RoleRules = {}; // storage for current role rules

//Backend Logic
Luma.RunQuery = function (queries) {
    const key = Luma.GenerateXorKey();
    return Luma.EncryptData(key).then(encKey => {
        const encPayload = Luma.XorEncrypt(queries, key);
        return $.ajax({
            url: "Assets/core/core.php",
            type: "POST",
            dataType: "json",
            contentType: "application/json",
            data: JSON.stringify({ queries: encPayload, process: 'modify', key: encKey }),
        })
            .done(response => {
                if (response && response.success === false) {
                    console.error("Operation failed:", response.message || "No message provided.");
                }
            })
            .fail((xhr, status, error) => {
                console.error("AJAX request failed:", error);
            });
    });
};

Luma.Select = function (payload, selectAll = true) {
    // Parameter check
    if (!Luma.CheckParams(payload.query, payload.params)) {
        return Promise.reject(": Parameter check failed.");
    }

    if (payload.length) {
        return Promise.reject(": Your select function is in ARRAY, remove the [].");
    }

    const type = "select";
    const tables = Luma.ExtracTable(payload.query);
    const thisQuery = Luma.CheckQuerySafety(payload.query);

    if (!thisQuery.safe) {
        return Promise.reject(": Query failed safety check.");
    }

    if (thisQuery.type !== type) {
        return Promise.reject(`: You can't run ${thisQuery.type} on a ${type} function.`);
    }

    if (!Luma.Can(type, tables)) {
        return Promise.reject(": Permission denied for this query.");
    }

    const key = Luma.GenerateXorKey();
    return Luma.EncryptData(key).then(encKey => {
        const encPayload = Luma.XorEncrypt(payload, key);
        return $.ajax({
            url: "Assets/core/core.php",
            type: "POST",
            dataType: "json",
            contentType: "application/json",
            data: JSON.stringify({ encPayload: encPayload, process: 'select', key: encKey }),
        })
            .then(response => {
                if (response && response.success === false) {
                    return Promise.reject(response.message || "Operation failed.");
                }

                return selectAll ? response.data : response.data[0];
            })
            .catch(error => {
                return Promise.reject(error);
            });
    });
};

Luma.Insert = function (query) {
    if (query.length != 1) {
        return Promise.reject(": your insert function is not an ARRAY, add []");
    }

    const type = "insert";

    for (let element of query) {
        const tables = Luma.ExtracTable(element.query);
        const thisQuery = Luma.CheckQuerySafety(element.query);

        if (!Luma.CheckParams(element.query, element.params)) {
            return Promise.reject(": Parameter check failed.");
        }

        if (!thisQuery.safe) {
            return Promise.reject(": Query failed safety check.");
        }

        if (thisQuery.type !== type) {
            return Promise.reject(`: You can't run ${thisQuery.type} on a ${type} function.`);
        }

        if (!Luma.Can(type, tables)) {
            return Promise.reject(": Permission denied for this query.");
        }
    }

    // Only runs if all checks passed
    return Luma.RunQuery(query);
};

Luma.Update = function (query) {
    if (query.length != 1) {
        return Promise.reject(": your insert function is not an ARRAY, add []");
    }

    const type = "update";

    for (let element of query) {
        const tables = Luma.ExtracTable(element.query);
        const thisQuery = Luma.CheckQuerySafety(element.query);

        if (!Luma.CheckParams(element.query, element.params)) {
            return Promise.reject(": Parameter check failed.");
        }

        if (!thisQuery.safe) {
            return Promise.reject(": Query failed safety check.");
        }

        if (thisQuery.type !== type) {
            return Promise.reject(`: You can't run ${thisQuery.type} on a ${type} function.`);
        }

        if (!Luma.Can(type, tables)) {
            return Promise.reject(": Permission denied for this query.");
        }
    }

    return Luma.RunQuery(query);
};

Luma.Delete = function (query) {
    if (query.length != 1) {
        return Promise.reject(": your insert function is not an ARRAY, add []");
    }

    const type = "delete";

    for (let element of query) {
        const tables = Luma.ExtracTable(element.query);
        const thisQuery = Luma.CheckQuerySafety(element.query);

        if (!Luma.CheckParams(element.query, element.params)) {
            return Promise.reject(": Parameter check failed.");
        }

        if (!thisQuery.safe) {
            return Promise.reject(": Query failed safety check.");
        }

        if (thisQuery.type !== type) {
            return Promise.reject(`: You can't run ${thisQuery.type} on a ${type} function.`);
        }

        if (!Luma.Can(type, tables)) {
            return Promise.reject(": Permission denied for this query.");
        }
    }

    return Luma.RunQuery(query);
};

Luma.CheckParams = function (query, params) {
    if (!query) {
        console.error("Query is missing");
        return false;
    }

    // Detect wrong parameter styles
    if (query.includes("@")) {
        console.error("Invalid parameter style '@' detected. Use ':' instead.");
        return false;
    }
    if (query.includes("?")) {
        console.error("Invalid unnamed parameter '?' detected. Use named parameters with ':' instead.");
        return false;
    }

    // Extract placeholders like :param
    const matches = query.match(/:\w+/g) || [];
    const placeholders = [...new Set(matches)]; // unique placeholders
    const paramKeys = Object.keys(params || {});

    // 1. Check for missing parameters
    const missing = placeholders.filter(ph => !paramKeys.includes(ph.substring(1)));
    if (missing.length > 0) {
        console.error(`Missing parameters: ${missing.join(", ")}`);
        return false;
    }

    // 2. Check for extra parameters not in query
    const extra = paramKeys.filter(k => !placeholders.includes(":" + k));
    if (extra.length > 0) {
        console.error(`Extra parameters provided but not used in query: ${extra.join(", ")}`);
        return false;
    }

    // 3. Count mismatch
    if (placeholders.length !== paramKeys.length) {
        console.error(
            `Parameter mismatch: query expects ${placeholders.length} but got ${paramKeys.length}`
        );
        return false;
    }

    return true;
};

Luma.CheckQuerySafety = function (sql) {
    const normalized = sql.trim().toUpperCase();

    // 1. Detect the query type
    let type = null;
    if (normalized.startsWith("SELECT")) type = "select";
    else if (normalized.startsWith("INSERT")) type = "insert";
    else if (normalized.startsWith("UPDATE")) type = "update";
    else if (normalized.startsWith("DELETE")) type = "delete";

    if (!type) {
        console.error("Unsupported or unknown query type");
        return { safe: false, type: null };
    }

    // 2. List of taboo keywords
    const taboo = [
        "DROP",
        "TRUNCATE",
        "ALTER",
        "GRANT",
        "REVOKE",
        "EXEC",
        "EXECUTE",
        "UNION", // often abused in SQLi
        ";",     // stacked queries
        "--",    // inline comment (SQLi trick)
        "/*",    // block comment (SQLi trick)
        "XP_",   // SQL Server stored procs (common attack vector)
    ];

    for (let word of taboo) {
        if (normalized.includes(word)) {
            console.error(`Blocked query: contains forbidden keyword "${word}"`);
            return { safe: false, type };
        }
    }

    return { safe: true, type };
};

Luma.SetSession = function (sessionVars, clearSession) {
    //LumaFramework / LumaSetSession.php
    return new Promise(function (resolve, reject) {
        $.ajax({
            url: 'Assets/core/core.php',
            type: 'POST',
            dataType: 'json',
            data: { sessionData: sessionVars, clearSession: clearSession, process: 'session', sessionProcess: 'set' },
            success: function (response) {
                resolve(response.success || false);
            },
            error: function (xhr, status, error) {
                console.error('Session error:', error);
                reject(error);
            }
        });
    });
};

Luma.GetSession = function (sessionKeys) {
    return new Promise(function (resolve, reject) {
        $.ajax({
            url: 'Assets/core/core.php',
            type: 'POST',
            dataType: 'json',
            data: {
                'session[]': sessionKeys,  // <-- force array
                process: 'session',
                sessionProcess: 'get'
            },
            traditional: true, // important!
            success: function (response) {
                resolve(response);
            },
            error: function (xhr, status, error) {
                console.error('Session error:', error);
                reject(error);
            }
        });
    });
};

Luma.StopSession = function () {
    return new Promise(function (resolve, reject) {
        $.ajax({
            url: 'Assets/core/core.php',
            type: 'POST',
            dataType: 'json',
            data: { process: 'session', sessionProcess: 'stop' },
            success: function (response) {
                resolve(response);
            },
            error: function (xhr, status, error) {
                console.error('Session error:', error);
                reject(error);
            }
        });
    });
};

Luma.Upload = function (config) {
    var fileInput = $(config.file)[0]; // get the actual DOM input
    var location = config.location;
    var fileName = config.name;

    const formData = new FormData();
    formData.append('fileToUpload', fileInput.files[0]); // <-- fixed
    formData.append('location', location);
    formData.append('fileName', fileName);
    formData.append('process', 'upload');

    return new Promise(function (resolve, reject) {
        $.ajax({
            url: 'Assets/core/core.php',
            type: 'POST',
            dataType: 'json',
            data: formData,
            processData: false,
            contentType: false,
            success: function (response) {
                resolve(response || null);
            },
            error: function (xhr, status, error) {
                console.error('Upload error:', error);
                reject(error);
            }
        });
    });

};

Luma.Mailer = function (config) {
    //Luma.ShowLoading();

    const key = Luma.GenerateXorKey();
    return Luma.EncryptData(key).then(encKey => {
        const encPayload = Luma.XorEncrypt(config, key);

        return $.ajax({
            url: "Assets/core/core.php",
            type: "POST",
            dataType: "json",
            contentType: "application/json",
            data: JSON.stringify({ config: encPayload, process: 'mailer', key: encKey })
        }).always(() => {
        });

        return $.ajax({
            url: "Assets/core/core.php",
            type: "POST",
            dataType: "json",
            contentType: "application/json",
            data: JSON.stringify({ queries: encPayload, process: 'modify', key: encKey }),
        })
            .done(response => {
                if (response && response.success === false) {
                    console.error("Operation failed:", response.message || "No message provided.");
                }
            })
            .fail((xhr, status, error) => {
                console.error("AJAX request failed:", error);
            });
    });

    return Luma.EncryptData(config).then(encPayload => {
        return $.ajax({
            url: "Assets/core/core.php",
            type: "POST",
            dataType: "json",
            contentType: "application/json",
            data: JSON.stringify({ config: encPayload, process: 'mailer' })
        }).always(() => {
            //Luma.HideLoading();
        });
    });
};

Luma.GenerateWord = function (config) {
    return $.ajax({
        url: "Assets/core/core.php",
        type: "POST",
        dataType: "json",
        contentType: "application/json",
        data: JSON.stringify({ config: config, process: 'generate_docx' }),
    }).always(() => {
        Swal.close(); // Close the loading modal whether success or failure
    });
};

Luma.SendPayload = function (config) {
    const key = Luma.GenerateXorKey();
    return Luma.EncryptData(key).then(encryptedKey => {
        console.log('JS: ' + encryptedKey);
        const encConfig = Luma.XorEncrypt(config, key);
        console.log('JS: ' + encConfig);

        return $.ajax({
            url: "Assets/core/core.php",
            type: "POST",
            dataType: "json",
            contentType: "application/json",
            data: JSON.stringify({ config: encConfig, process: 'send_payload', key: encryptedKey }),
        }).always(() => {
        });
    })

};

//General Logic
Luma.$ = function (selector) {
    const el = typeof selector === 'string' ? document.querySelector(selector) : selector;

    if (!el) {
        console.warn(`Luma.$: Element not found for selector:`, selector);
        // Return a dummy object to avoid breaking chained calls
        return {
            val: () => undefined,
            text: () => undefined,
            html: () => undefined,
            show: () => { },
            hide: () => { },
            on: () => { },
            attr: () => undefined,
            addClass: () => { },
            removeClass: () => { },
            toggleClass: () => { }
        };
    }

    return {
        val(value) {
            if (value === undefined) return el.value;
            el.value = value;
        },
        text(value) {
            if (value === undefined) return el.textContent;
            el.textContent = value;
        },
        html(value) {
            if (value === undefined) return el.innerHTML;
            el.innerHTML = value;
        },
        show() {
            el.style.display = '';
        },
        hide() {
            el.style.display = 'none';
        },
        on(event, handler) {
            el.addEventListener(event, handler);
        },
        attr(name, value) {
            if (value === undefined) return el.getAttribute(name);
            el.setAttribute(name, value);
        },
        addClass(cls) {
            el.classList.add(cls);
        },
        removeClass(cls) {
            el.classList.remove(cls);
        },
        toggleClass(cls) {
            el.classList.toggle(cls);
        }
    };
};

Luma.SetRole = function (config) {
    const role = config.role;
    const params = config.params || {};

    // Set session only if params is not empty
    if (Object.keys(params).length > 0) {
        Luma.SetSession(params, true);
    }

    // Save role in sessionStorage
    sessionStorage.setItem('Luma.Role', role);

    // Run the role function
    const fn = Luma.Role[role];
    if (typeof fn === 'function') {
        fn(params);
    } else {
        console.warn(`No function found for role: ${role}`);
    }
};

Luma.CheckRole = function () {
    const role = sessionStorage.getItem('Luma.Role');

    if (role && typeof Luma.Role[role] === 'function') {
        const session = Luma.GetSession(); // assumes this returns stored params
        Luma.Role[role](session);
    } else {
        Luma.Role.Default();
    }
};

Luma.Can = function (action, tables) {
    let role = sessionStorage.getItem("Luma.Role") || "Default";

    // Use rules from Luma.RoleRules
    const roleRules = Luma.RoleRules || {};

    for (let table of tables) {
        let allowed =
            (roleRules[table] && roleRules[table][action]) ||
            (roleRules["*"] && roleRules["*"][action]);

        if (!allowed) {
            console.error(`${role} not allowed to ${action} on ${table}`);
            return false;
        }
    }
    return true;
};


Luma.ExtracTable = function (query) {
    let matches = query.match(/\bFROM\s+([a-zA-Z0-9_]+)|\bJOIN\s+([a-zA-Z0-9_]+)|\bUPDATE\s+([a-zA-Z0-9_]+)|\bINTO\s+([a-zA-Z0-9_]+)/gi) || [];
    return matches.map(m => m.split(/\s+/)[1]);
}


Luma.EncryptData = async function (data) {
    // 1. Convert data to JSON (same as before)
    const json = JSON.stringify(data);

    // 2. Load public key (from file, same function always)
    const response = await fetch("public.pem");
    const publicKey = await response.text();

    // 3. Initialize encryptor with the public key
    const encryptor = new JSEncrypt();
    encryptor.setPublicKey(publicKey);

    // 4. Encrypt the JSON string
    let encrypted = encryptor.encrypt(json);

    // 5. Return the encrypted result (like you did with btoa in XOR version)
    return encrypted;
};

Luma.GenerateXorKey = function (length = 16) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=';
    let key = '';
    const array = new Uint32Array(length);
    crypto.getRandomValues(array); // uses browser's secure RNG

    for (let i = 0; i < length; i++) {
        key += chars[array[i] % chars.length];
    }
    return key;
};

Luma.XorEncrypt = function (data, key) {
    const json = JSON.stringify(data);
    const jsonBytes = new TextEncoder().encode(json);
    const keyBytes = new TextEncoder().encode(key);

    const result = jsonBytes.map((byte, i) => byte ^ keyBytes[i % keyBytes.length]);
    return btoa(String.fromCharCode(...result));
};

//Front End
Luma.CreateHeader = function (config) {
    return new Promise((resolve) => {
        const user = config.user || { name: 'John Doe', avatar: 'Assets/img/def.jpg' };
        const dropdownItems = config.dropdown || [];

        // Build dropdown HTML
        let dropdownHTML = '';
        dropdownItems.forEach(item => {
            if (item.divider) {
                dropdownHTML += `<li><hr class="dropdown-divider" /></li>`;
            } else {
                dropdownHTML += `
                    <li>
                        <a class="dropdown-item" href="#" id="${item.id}">
                            <i class="${item.icon} me-2"></i> ${item.text}
                        </a>
                    </li>
                `;
            }
        });

        // Inject header HTML
        $('body').prepend(`
            <div id="header" class="container-fluid mt-3 px-4">
                <div class="card card-rounded shadow-sm">
                    <div class="card-body d-flex justify-content-between align-items-center">
                        <button class="btn p-0 m-0 border-0 bg-transparent" type="button" data-bs-toggle="offcanvas"
                            data-bs-target="#sidebar" aria-controls="sidebar" style="box-shadow: none;">
                            <i class="bi bi-list fs-4"></i>
                        </button>

                        <!-- Profile dropdown -->
                        <div class="dropdown">
                            <div class="profile-dropdown-toggle" id="profileDropdown" data-bs-toggle="dropdown"
                                aria-expanded="false">
                                <img src="${user.avatar}" alt="${user.name}" class="profile-pic" id="lumaAvatar"/>
                                <span id="lumaUsername">${user.name}</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                                    class="bi bi-chevron-down ms-2" viewBox="0 0 16 16">
                                    <path fill-rule="evenodd"
                                        d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z" />
                                </svg>
                            </div>
                            <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="profileDropdown">
                                ${dropdownHTML}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        `);

        resolve();
    });
};

Luma.InitPages = function (config) {
    $('body').prepend(`
        <div class="offcanvas offcanvas-start bg-white" tabindex="-1" id="sidebar" aria-labelledby="sidebarLabel">
            <div class="offcanvas-header">
                <h5 class="offcanvas-title" id="sidebarLabel">Menu</h5>
                <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
            </div>
            <div class="offcanvas-body">
                <ul class="nav flex-column" id="LumaSideBar"></ul>
            </div>
        </div>
    `);

    config.forEach(item => {
        if (item.children && item.children.length) {
            // Dropdown item
            const submenuId = `submenu_${item.id}`;

            // Add dropdown parent
            $('#LumaSideBar').append(`
                <li class="nav-item">
                    <a class="nav-link d-flex justify-content-between align-items-center" data-bs-toggle="collapse"
                        href="#${submenuId}" role="button" aria-expanded="false" aria-controls="${submenuId}">
                        <span><i class="${item.icon} me-2"></i> ${item.text}</span>
                        <i class="bi bi-caret-down-fill"></i>
                    </a>
                    <div class="collapse ps-3" id="${submenuId}">
                        <ul class="nav flex-column" id="${submenuId}_list"></ul>
                    </div>
                </li>
            `);

            // Add dropdown children items
            item.children.forEach(sub => {
                $(`#${submenuId}_list`).append(`
                    <li class="nav-item">
                        <div class="nav-link lnav-btn" id="${sub.id}">
                            ${sub.icon ? `<i class="${sub.icon} me-2"></i>` : ''}${sub.text}
                        </div>
                    </li>
                `);

                // Attach click handler for child item
                $(document).on('click', `#${sub.id}`, () => {
                    Luma.LoadPage({
                        file: sub.file,
                        init: sub.init,
                        showHeader: sub.showHeader !== false,
                        showSidebar: sub.showSidebar !== false,
                        forceReload: true
                    });
                    $('.lnav-btn').removeClass('active');
                    $(`#${sub.id}`).addClass('active');
                    const sidebar = bootstrap.Offcanvas.getOrCreateInstance(document.getElementById('sidebar'));
                    sidebar.hide();
                });
            });

        } else {
            // Normal item
            $('#LumaSideBar').append(`
                <li class="nav-item">
                    <div class="nav-link lnav-btn" id="${item.id}">
                        <i class="${item.icon} me-2"></i>
                        ${item.text}
                    </div>
                </li>
            `);

            // Attach click handler
            $(document).on('click', `#${item.id}`, () => {
                Luma.LoadPage({
                    id: item.id,
                    file: item.file,
                    init: item.init,
                    showHeader: item.showHeader !== false,
                    showSidebar: item.showSidebar !== false
                });
                $('.lnav-btn').removeClass('active');
                $(`#${item.id}`).addClass('active');
                const sidebar = bootstrap.Offcanvas.getOrCreateInstance(document.getElementById('sidebar'));
                sidebar.hide();
            });
        }
    });
};

Luma.LoadPage = function (route) {
    if (!route || !route.file) return;

    // Show loader early
    $('#page-loader').fadeIn(150);

    // Remove old route scripts
    $("script[id^='route-']").remove();

    // Call cleanup if defined
    if (typeof window.Luma.PageCleanup === 'function') {
        try {
            window.Luma.PageCleanup();
        } catch (e) {
            console.error("Error in PageCleanup:", e);
        }
        // Optional: cleanup reference if using single cleanup
        // window.Luma.PageCleanup = null;
    }

    // Load new script
    const script = document.createElement('script');
    script.src = route.file + '?v=' + Date.now(); // prevent caching
    script.id = `route-${Date.now()}`;

    script.onload = function () {
        if (Luma.View && typeof Luma.View[route.init] === 'function') {
            try {
                // Small delay for smoothness
                setTimeout(() => {
                    $('#main-content').empty();
                    Luma.View[route.init]();

                    // Toggle layout visibility
                    $('#header').toggle(route.showHeader !== false);
                    $('#sidebar').toggle(route.showSidebar !== false);

                    $('#page-loader').fadeOut(150);
                }, 100);
            } catch (e) {
                console.error("Error in route init:", e);
                $('#main-content').html('<p class="text-danger">Failed to initialize page.</p>');
                $('#page-loader').fadeOut(150);
            }
        } else {
            console.warn(`Luma.View.${route.init} is not defined or not a function`);
            $('#main-content').html('<p class="text-danger">Page function missing.</p>');
            $('#page-loader').fadeOut(150);
        }
    };

    script.onerror = function () {
        console.error(`Failed to load script: ${route.file}`);
        $('#main-content').html('<p class="text-danger">Error loading page script.</p>');
        $('#page-loader').fadeOut(150);
    };

    document.body.appendChild(script);
};

Luma.Alert = function (config) {
    return new Promise((resolve) => {
        const alert = config.alert || '';
        const title = config.title || 'Notice';
        const message = config.message || 'Something happened.';
        const showCancel = config.showCancel || false;

        let icon = '';
        switch (alert) {
            case 'success': icon = 'bi bi-check-circle-fill'; break;
            case 'error': icon = 'bi bi-x-circle-fill'; break;
            case 'warning': icon = 'bi bi-exclamation-circle-fill'; break;
            case 'info': icon = 'bi bi-info-circle-fill'; break;
            default: icon = 'bi bi-info-circle-fill';
        }

        const cancelBtn = showCancel
            ? `<button class="btn btn-outline-dark px-4" id="alertCancelBtn">Cancel</button>`
            : '';

        const html = `
            <div class="luma-alert-overlay" id="lumaAlertOverlay">
                <div class="luma-alert fade-in" id="lumaAlertBox">
                    <div class="mb-3">
                        <i class="${icon} text-dark"></i>
                    </div>
                    <h4 class="fw-bold text-black mb-2">${title}</h4>
                    <p class="text-muted mb-4">${message}</p>
                    <div class="d-flex justify-content-center gap-2">
                        ${cancelBtn}
                        <button class="btn btn-dark px-4" id="alertConfirmBtn">OK</button>
                    </div>
                </div>
            </div>
        `;

        $('body').append(html);
        $('#lumaAlertOverlay').css('display', 'flex');

        function closeAlert(isConfirmed) {
            $('#lumaAlertBox').removeClass('fade-in').addClass('fade-out');
            setTimeout(() => {
                $('#lumaAlertOverlay').remove();
                resolve({ isConfirmed });
            }, 300); // match fadeOut duration
        }

        $('#alertConfirmBtn').on('click', () => closeAlert(true));
        $('#alertCancelBtn').on('click', () => closeAlert(false));
    });
};

Luma.SetUser = function (sessionName) {
    Luma.Wait('#lumaUsername', () => {
        Luma.GetSession(sessionName).then(data => {
            $('#lumaUsername').text(data.session);
        });
    });
};

Luma.ShowLoading = function () {
    const loader = `
        <div class="luma-loader-overlay" id="lumaLoader">
            <div class="luma-loader-box">
                <i class="bi bi-arrow-repeat"></i>
            </div>
        </div>
    `;
    $('body').append(loader);
};

Luma.HideLoading = function () {
    $('#lumaLoader').fadeOut(300, function () {
        $('#lumaLoader').remove();
    });
};

Luma.CreateContent = function (config) {
    const $container = $('<div class="container-fluid mt-3 px-4"></div>');
    const $card = $('<div class="card shadow-sm custom-content-card"></div>');
    const $cardBody = $('<div class="card-body"></div>');

    function buildElement(data) {
        const $el = $(`<${data.element}></${data.element}>`);

        Object.entries(data).forEach(([key, value]) => {
            if (['element', 'text', 'html', 'content', 'click'].includes(key)) return;
            if (key === 'class') $el.addClass(value);
            else $el.attr(key, value);
        });

        if (data.html) $el.html(data.html);
        else if (data.text) $el.text(data.text);

        if (typeof data.click === 'function') {
            $el.on('click', data.click);
            Luma._boundElements.push({ $el, type: 'click', handler: data.click });
        }

        if (Array.isArray(data.content)) {
            data.content.forEach(child => {
                $el.append(buildElement(child));
            });
        }

        return $el;
    }

    config.elements.forEach(element => {
        $cardBody.append(buildElement(element));
    });

    $card.append($cardBody);
    $container.append($card);
    $(config.target).append($container);

    // Return a Promise that resolves immediately with the created container
    const result = {
        container: $container,
        card: $card,
        cardBody: $cardBody
    };

    const promise = Promise.resolve(result);

    // Merge the promise with the result for dual usage
    return Object.assign(promise, result);
};

Luma.CreateElement = function (config) {

    /** Recursively construct an element from its descriptor. */
    function buildElement(data) {
        const $el = $(`<${data.element}></${data.element}>`);

        // Copy attributes and classes (skip reserved keys)
        Object.entries(data).forEach(([key, value]) => {
            if (['element', 'text', 'html', 'content', 'click'].includes(key)) return;
            if (key === 'class') $el.addClass(value);
            else $el.attr(key, value);
        });

        // Apply inner content
        if (data.html) $el.html(data.html);
        else if (data.text) $el.text(data.text);

        // Bind events
        //if (typeof data.click === 'function') $el.on('click', data.click);
        if (typeof data.click === 'function') {
            $el.on('click', data.click);
            Luma._boundElements.push({ $el, type: 'click', handler: data.click });
        }

        // Recursively add children
        if (Array.isArray(data.content)) {
            data.content.forEach(child => $el.append(buildElement(child)));
        }

        return $el;
    }

    // Build everything, append to target
    const $target = $(config.target);
    const rootNodes = config.elements.map(buildElement);

    rootNodes.forEach($n => $target.append($n));

    // Return promise + handy refs
    const result = { roots: rootNodes };
    const promise = Promise.resolve(result);
    return Object.assign(promise, result);
};

Luma.CreateModal = function (config) {
    const modalId = config.id || 'lumaModal';

    // Remove any existing modal with the same ID before creating a new one
    $(`#${modalId}`).remove();

    const $modal = $(`
        <div class="modal fade" id="${modalId}" tabindex="-1" aria-hidden="true" ${config.static ? 'data-bs-backdrop="static" data-bs-keyboard="false"' : ''}>
            <div class="modal-dialog ${config.centered ? 'modal-dialog-centered' : ''} ${config.size || ''} ${config.scrollable ? 'modal-dialog-scrollable' : ''}">
                <div class="modal-content rounded-4 shadow"></div>
            </div>
        </div>
    `);

    const $modalContent = $modal.find('.modal-content');

    function buildElement(data) {
        const $el = $(`<${data.element}></${data.element}>`);

        Object.entries(data).forEach(([key, value]) => {
            if (['element', 'text', 'html', 'content', 'click'].includes(key)) return;
            if (key === 'class') $el.addClass(value);
            else $el.attr(key, value);
        });

        if (data.html) $el.html(data.html);
        else if (data.text) $el.text(data.text);

        // if (typeof data.click === 'function') $el.on('click', data.click);
        if (typeof data.click === 'function') {
            $el.on('click', data.click);
            Luma._boundElements.push({ $el, type: 'click', handler: data.click });
        }

        if (Array.isArray(data.content)) {
            data.content.forEach(child => {
                $el.append(buildElement(child));
            });
        }

        return $el;
    }

    function buildSection(className, section) {
        if (!Array.isArray(section)) return;
        const $section = $(`<div class="${className}"></div>`);
        section.forEach(el => $section.append(buildElement(el)));
        $modalContent.append($section);
    }

    buildSection('modal-header', config.header);
    buildSection('modal-body', config.body);
    buildSection('modal-footer', config.footer);

    $(config.target || 'body').append($modal);

    // Clean up modal after it's hidden
    $modal.on('hidden.bs.modal', () => {
        $modal.remove();
    });

    const result = {
        modal: $modal,
        show: () => new bootstrap.Modal($modal[0]).show(),
        hide: () => bootstrap.Modal.getInstance($modal[0])?.hide()
    };

    return Object.assign(Promise.resolve(result), result);
};

Luma.StructureConvert = function (html, returnJSON = true) {
    const container = document.createElement('div');
    container.innerHTML = html.trim();

    function processElement(el) {
        const obj = {
            element: el.tagName.toLowerCase()
        };

        // Capture all attributes
        for (const attr of el.attributes) {
            if (attr.name === 'class') obj.class = attr.value;
            else obj[attr.name] = attr.value;
        }

        // Text or HTML content
        const hasTextOnly =
            el.childNodes.length === 1 &&
            el.childNodes[0].nodeType === Node.TEXT_NODE;

        if (hasTextOnly) {
            const text = el.textContent.trim();
            if (text) obj.text = text;
        } else if (el.innerHTML && el.children.length === 0) {
            obj.html = el.innerHTML.trim();
        }

        // Recursively process children
        const children = Array.from(el.children);
        if (children.length > 0) {
            obj.content = children.map(processElement);
        }

        return obj;
    }

    const result = Array.from(container.children).map(processElement);
    return returnJSON ? JSON.stringify(result, null, 4) : result;
};

Luma.ClearUI = function () {
    let count = 0;

    Luma._boundElements.forEach(({ $el, type, handler }) => {
        const tag = $el.prop('tagName');
        const id = $el.attr('id') ? `#${$el.attr('id')}` : '';
        const className = $el.attr('class') ? `.${$el.attr('class').split(' ').join('.')}` : '';
        const description = `<${tag}${id}${className}>`;

        $el.off(type, handler);
        //console.log(`🔹 Cleared '${type}' event from ${description}`);
        count++;
    });

    // Reset event registry
    Luma._boundElements = [];

    // Clear main content container
    $('#main-content').empty();

    //console.log(`✅ Total ${count} event listener(s) cleared.`);
};

Luma.PageCleanup = function () {
    Luma.ClearUI();
    console.log("Cleaned up UI and event handlers.");
};

//System Configuration
Luma.SetSystemConfig = function (config) {
    return Luma.EncryptData(config).then(encPayload => {
        return $.ajax({
            url: "Assets/core/core.php",
            type: "POST",
            dataType: "json",
            contentType: "application/json",
            data: JSON.stringify({ config: encPayload, process: 'systemconfig' })
        }).always(() => {
            //Luma.HideLoading();
        });
    });
};

Luma.GetProjectDirectories = function () {
    return $.ajax({
        url: "Assets/core/core.php",
        type: "POST",
        dataType: "json",
        contentType: "application/json",
        data: JSON.stringify({ process: 'directories' })
    }).always(() => {
        //Luma.HideLoading();
    });
};

Luma.CreateProjectDirectory = function (config) {
    return Luma.EncryptData(config).then(encPayload => {
        return $.ajax({
            url: "Assets/core/core.php",
            type: "POST",
            dataType: "json",
            contentType: "application/json",
            data: JSON.stringify({ config: encPayload, process: 'createDirectory' })
        }).always(() => {
            //Luma.HideLoading();
        });
    });
};

Luma.CreatePage = function (config) {
    return Luma.EncryptData(config).then(encPayload => {
        return $.ajax({
            url: "Assets/core/core.php",
            type: "POST",
            dataType: "json",
            contentType: "application/json",
            data: JSON.stringify({ config: encPayload, process: 'createPage' })
        }).always(() => {
            //Luma.HideLoading();
        });
    });
};

Luma.GenerateNewKeys = function () {
    return $.ajax({
        url: "Assets/core/core.php",
        type: "POST",
        dataType: "json",
        contentType: "application/json",
        data: JSON.stringify({ process: 'generateKeys' })
    }).always(() => {
        //Luma.HideLoading();
    });
};

Luma.GetKeys = function () {
    return $.ajax({
        url: "Assets/core/core.php",
        type: "POST",
        dataType: "json",
        contentType: "application/json",
        data: JSON.stringify({ process: 'retreiveKeys' })
    }).always(() => {
        //Luma.HideLoading();
    });
};

Luma.GetDatabaseConnection = function () {
    return $.ajax({
        url: "Assets/core/core.php",
        type: "POST",
        dataType: "json",
        contentType: "application/json",
        data: JSON.stringify({ process: 'retreiveDatabase' })
    }).always(() => {
        //Luma.HideLoading();
    });
};

// $(document).on("keydown", function (e) {
//     if (e.ctrlKey && e.altKey && e.shiftKey && e.key.toLowerCase() === "s") {
//         e.preventDefault(); // stop browser default (like save page)
//         Luma.LoadPage({
//             file: 'js/pages/SystemConfig.js',
//             init: 'SystemConfig',
//             showHeader: false,
//             showSidebar: false
//         });
//     }
// });

//Expiremental