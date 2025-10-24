Luma.View = Luma.View || {};

Luma.View.SystemConfig = function () {
    Luma.CreateElement({
        target: '#main-content',
        elements: [
            {
                element: 'div',
                style: 'height: 100vh;',
                content: [
                    {
                        "element": "div",
                        "class": "navbar navbar-light bg-light px-3 d-flex justify-content-between shadow",
                        "content": [
                            {
                                "element": "div",
                                "class": "d-flex gap-3",
                                "content": [
                                    {
                                        "element": "button",
                                        "class": "btn add_underline hover-zoom text-dark text-uppercase fw-bold",
                                        "text": "Security Keys",
                                        click: () => showGenerateKeysContainer()
                                    },
                                    {
                                        "element": "button",
                                        "class": "btn add_underline hover-zoom text-dark text-uppercase fw-bold",
                                        "text": "Database Connection",
                                        click: () => showDatabaseContainer()
                                    },
                                    {
                                        "element": "button",
                                        "class": "btn add_underline hover-zoom text-dark text-uppercase fw-bold",
                                        "text": "Project Configuration",
                                        click: () => showProjectContainer()
                                    },
                                    {
                                        "element": "button",
                                        "class": "btn add_underline hover-zoom text-dark text-uppercase fw-bold",
                                        "text": "HTML to JSON Converter",
                                        click: () => showConverterContainer()
                                    },
                                ]
                            },
                            {
                                "element": "div",
                                "class": "d-flex align-items-start",
                                "content": [
                                    {
                                        "element": "div",
                                        "style": "line-height: 1.2;", // Optional: reduce space between lines
                                        "content": [
                                            {
                                                "element": "div",
                                                "class": "fw-bold fs-3 text-dark text-end", // Larger title
                                                "text": "LumaTools"
                                            },
                                            {
                                                "element": "div",
                                                "class": "text-success fw-bold",
                                                style: 'font-size: .8rem;',
                                                "text": "LumaFramework Integrated Tools"
                                            }
                                        ]
                                    },
                                    {
                                        "element": "i",
                                        "class": "bi bi-tools display-6 me-3 text-dark" // Big icon with spacing
                                    }
                                ]
                            },
                        ]
                    },
                    {
                        element: 'div',
                        class: 'd-flex justify-content-center align-items-center gap-3 h-75',
                        content: [
                            {
                                element: 'div',
                                id: 'securityConfigContainer',
                                class: 'shadow p-5 rounded-4 w-75',
                                content: [
                                    {
                                        elemen: 'div',
                                        class: 'row',
                                        content: [
                                            {
                                                element: 'div',
                                                class: 'col-6',
                                                content: [
                                                    {
                                                        "element": "div",
                                                        "class": "mb-3",
                                                        "content": [
                                                            {
                                                                "element": "label",
                                                                "for": "privateKey",
                                                                "class": "form-label fw-semibold",
                                                                "text": "Private Key"
                                                            },
                                                            {
                                                                "element": "textarea",
                                                                "name": "privateKey",
                                                                "id": "privateKey",
                                                                "class": "form-control",
                                                                "placeholder": "Private Key",
                                                                readonly: true,
                                                                style: 'min-height: 400px;'
                                                            }
                                                        ]
                                                    },
                                                ]
                                            },
                                            {
                                                element: 'div',
                                                class: 'col-6',
                                                content: [
                                                    {
                                                        "element": "div",
                                                        "class": "mb-3",
                                                        "content": [
                                                            {
                                                                "element": "label",
                                                                "for": "publicKey",
                                                                "class": "form-label fw-semibold",
                                                                "text": "Public Key"
                                                            },
                                                            {
                                                                "element": "textarea",
                                                                "name": "publicKey",
                                                                "id": "publicKey",
                                                                "class": "form-control",
                                                                "placeholder": "Public Key",
                                                                readonly: true,
                                                                style: 'min-height: 400px;'
                                                            }
                                                        ]
                                                    },
                                                ]
                                            }
                                        ]
                                    },
                                    {
                                        element: 'button',
                                        class: 'btn btn-primary',
                                        click: () => generateNewKeys(),
                                        text: 'Generate New Keys ',
                                        "content": [
                                            {
                                                "element": "i",
                                                "class": "bi bi-arrow-repeat"
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                element: 'div',
                                id: 'databaseConfigContainer',
                                class: 'shadow p-5 rounded-4',
                                content: [
                                    {
                                        element: 'p',
                                        class: 'fw-bold fs-5 text-center text-uppercase text-secondary',
                                        text: 'Database Connection'
                                    },
                                    {
                                        "element": "div",
                                        "class": "input-group mb-3",
                                        "content": [
                                            {
                                                "element": "span",
                                                "class": "input-group-text bg-danger text-light",
                                                content: [
                                                    {
                                                        element: 'i',
                                                        class: 'bi bi-pc'
                                                    }
                                                ]
                                            },
                                            {
                                                "element": "div",
                                                "class": "form-floating",
                                                "content": [
                                                    {
                                                        "element": "input",
                                                        "type": "text",
                                                        "class": "form-control",
                                                        "id": "inputHost",
                                                        "name": "host",
                                                        "placeholder": "Host"
                                                    },
                                                    {
                                                        "element": "label",
                                                        "for": "inputHost",
                                                        "text": "Host"
                                                    }
                                                ]
                                            }
                                        ]
                                    },
                                    {
                                        "element": "div",
                                        "class": "input-group mb-3",
                                        "content": [
                                            {
                                                "element": "span",
                                                "class": "input-group-text bg-danger text-light",
                                                content: [
                                                    {
                                                        element: 'i',
                                                        class: 'bi bi-person-fill'
                                                    }
                                                ]
                                            },
                                            {
                                                "element": "div",
                                                "class": "form-floating",
                                                "content": [
                                                    {
                                                        "element": "input",
                                                        "type": "text",
                                                        "class": "form-control",
                                                        "id": "inputUsername",
                                                        "name": "username",
                                                        "placeholder": "Username"
                                                    },
                                                    {
                                                        "element": "label",
                                                        "for": "inputUsername",
                                                        "text": "Username"
                                                    }
                                                ]
                                            }
                                        ]
                                    },
                                    {
                                        "element": "div",
                                        "class": "input-group mb-3",
                                        "content": [
                                            {
                                                "element": "span",
                                                "class": "input-group-text bg-danger text-light",
                                                content: [
                                                    {
                                                        element: 'i',
                                                        class: 'bi bi-key-fill'
                                                    }
                                                ]
                                            },
                                            {
                                                "element": "div",
                                                "class": "form-floating",
                                                "content": [
                                                    {
                                                        "element": "input",
                                                        "type": "password",
                                                        "class": "form-control",
                                                        "id": "inputPassword",
                                                        "name": "password",
                                                        "placeholder": "Password"
                                                    },
                                                    {
                                                        "element": "label",
                                                        "for": "inputPassword",
                                                        "text": "Password"
                                                    }
                                                ]
                                            }
                                        ]
                                    },
                                    {
                                        "element": "div",
                                        "class": "input-group mb-3",
                                        "content": [
                                            {
                                                "element": "span",
                                                "class": "input-group-text bg-danger text-light",
                                                content: [
                                                    {
                                                        element: 'i',
                                                        class: 'bi bi-database-fill'
                                                    }
                                                ]
                                            },
                                            {
                                                "element": "div",
                                                "class": "form-floating",
                                                "content": [
                                                    {
                                                        "element": "input",
                                                        "type": "text",
                                                        "class": "form-control",
                                                        "id": "inputDatabase",
                                                        "name": "database",
                                                        "placeholder": "Database"
                                                    },
                                                    {
                                                        "element": "label",
                                                        "for": "inputDatabase",
                                                        "text": "Database"
                                                    }
                                                ]
                                            }
                                        ]
                                    },
                                    {
                                        element: 'button',
                                        class: 'btn btn-primary w-100',
                                        text: 'Save ',
                                        click: () => saveDatabaseConfig(),
                                        content: [
                                            {
                                                element: 'i',
                                                class: 'bi bi-floppy2-fill'
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                element: 'div',
                                id: 'projectConfigContainer',
                                class: 'shadow p-5 rounded-4',
                                content: [
                                    {
                                        element: 'p',
                                        class: 'fw-bold fs-5 text-center text-uppercase text-secondary',
                                        text: 'Project Configuration'
                                    },
                                    {
                                        element: 'hr',
                                    },
                                    {
                                        element: 'p',
                                        class: 'text-secondary',
                                        text: 'Create new project directory'
                                    },
                                    {
                                        "element": "div",
                                        "class": "input-group mb-3",
                                        "content": [
                                            {
                                                "element": "span",
                                                "class": "input-group-text bg-primary text-light",
                                                content: [
                                                    {
                                                        element: 'i',
                                                        class: 'bi bi-folder-fill'
                                                    }
                                                ]
                                            },
                                            {
                                                "element": "div",
                                                "class": "form-floating",
                                                "content": [
                                                    {
                                                        "element": "input",
                                                        "type": "text",
                                                        "class": "form-control",
                                                        "id": "inputProjectDiretory",
                                                        "name": "host",
                                                        "placeholder": "Folder Name"
                                                    },
                                                    {
                                                        "element": "label",
                                                        "for": "inputProjectDiretory",
                                                        "text": "Folder Name"
                                                    }
                                                ]
                                            }
                                        ]
                                    },
                                    {
                                        element: 'button',
                                        class: 'btn btn-primary w-100 mb-3',
                                        text: 'Create new directory ',
                                        click: () => createNewDirectory(),
                                        content: [
                                            {
                                                element: 'i',
                                                class: 'bi bi-folder-plus'
                                            }
                                        ]
                                    },
                                    {
                                        element: 'hr',
                                    },
                                    {
                                        element: 'p',
                                        class: 'text-secondary',
                                        text: 'Create new page'
                                    },
                                    {
                                        "element": "div",
                                        "class": "form-floating mb-3",
                                        "content": [
                                            {
                                                "element": "select",
                                                "class": "form-select",
                                                "id": "directoryList",
                                                "aria-label": "Floating label select example",
                                                "content": [
                                                    {
                                                        "element": "option",
                                                        "selected": "",
                                                        "text": "Parent",
                                                        value: 'Parent'
                                                    },
                                                ]
                                            },
                                            {
                                                "element": "label",
                                                "for": "floatingSelect",
                                                "text": "Select a directory"
                                            }
                                        ]
                                    },
                                    {
                                        "element": "div",
                                        "class": "input-group mb-3",
                                        "content": [
                                            {
                                                "element": "span",
                                                "class": "input-group-text bg-primary text-light",
                                                content: [
                                                    {
                                                        element: 'i',
                                                        class: 'bi bi-javascript'
                                                    }
                                                ]
                                            },
                                            {
                                                "element": "div",
                                                "class": "form-floating",
                                                "content": [
                                                    {
                                                        "element": "input",
                                                        "type": "text",
                                                        "class": "form-control",
                                                        "id": "inputPageName",
                                                        "name": "username",
                                                        "placeholder": "Page"
                                                    },
                                                    {
                                                        "element": "label",
                                                        "for": "inputPageName",
                                                        "text": "Page"
                                                    }
                                                ]
                                            }
                                        ]
                                    },
                                    {
                                        element: 'button',
                                        class: 'btn btn-primary w-100',
                                        text: 'Save ',
                                        click: () => createNewPage(),
                                        content: [
                                            {
                                                element: 'i',
                                                class: 'bi bi-floppy2-fill'
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                element: 'div',
                                id: 'converterContainer',
                                class: 'shadow p-5 rounded-4 w-75',
                                content: [
                                    {
                                        "element": "div",
                                        "class": "tools-header d-flex align-items-center justify-content-between",
                                        "content": [
                                            {
                                                "element": "h2",
                                                text: 'HTML to JSON Converter',
                                                "content": [
                                                    {
                                                        "element": "i",
                                                        "class": "bi bi-tools"
                                                    }
                                                ]
                                            }
                                        ]
                                    },
                                    {
                                        "element": "div",
                                        "class": "mb-3",
                                        "content": [
                                            {
                                                "element": "label",
                                                "for": "code",
                                                "class": "form-label fw-semibold",
                                                "text": "Paste your HTML here"
                                            },
                                            {
                                                "element": "textarea",
                                                "name": "code",
                                                "id": "code",
                                                style: 'height: 500px; font-family: monospace; font- size: 14px; resize: vertical; ',
                                                "class": "form-control",
                                                "placeholder": "Type or paste your HTML code..."
                                            }
                                        ]
                                    },
                                    {
                                        "element": "div",
                                        "class": "run-btn",
                                        "content": [
                                            {
                                                "element": "button",
                                                "id": "run",
                                                "class": "btn btn-primary",
                                                text: 'Convert to JSON ',
                                                click: () => convertToJson(),
                                                "content": [
                                                    {
                                                        "element": "i",
                                                        "class": "bi bi-arrow-repeat"
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            },
                        ]
                    },
                ]
            }
        ]
    }).then(() => {
        $('#databaseConfigContainer').hide();
        $('#projectConfigContainer').hide();
        $('#converterContainer').hide();

        Luma.GetKeys().then(data => {
            // console.log(data);
            const privateKey = data.Keys.private;
            const publicKey = data.Keys.public;
            $('#privateKey').text(privateKey);
            $('#publicKey').text(publicKey);
        });

        Luma.GetDatabaseConnection().then(data => {
            $('#inputHost').val(data.connection.host);
            $('#inputUsername').val(data.connection.user);
            $('#inputPassword').val(data.connection.password);
            $('#inputDatabase').val(data.connection.db);
        });

        Luma.GetProjectDirectories().then(data => {
            const directories = data.directories;
            console.log(directories);
            directories.forEach(element => {
                Luma.CreateElement({
                    target: '#directoryList',
                    elements: [
                        {
                            "element": "option",
                            value: element,
                            "text": element
                        }
                    ]
                })
            });
        });
    });

    function showGenerateKeysContainer() {
        $('#projectConfigContainer').hide();
        $('#converterContainer').hide();
        $('#databaseConfigContainer').hide();
        $('#securityConfigContainer').fadeIn('slow');
    }

    function showDatabaseContainer() {
        $('#projectConfigContainer').hide();
        $('#converterContainer').hide();
        $('#securityConfigContainer').hide();
        $('#databaseConfigContainer').fadeIn('slow');
    }

    function showProjectContainer() {
        $('#databaseConfigContainer').hide();
        $('#converterContainer').hide();
        $('#securityConfigContainer').hide();
        $('#projectConfigContainer').fadeIn('slow');
    }

    function showConverterContainer() {
        $('#databaseConfigContainer').hide();
        $('#projectConfigContainer').hide();
        $('#securityConfigContainer').hide();
        $('#converterContainer').fadeIn('slow');
    }

    function generateNewKeys() {
        Luma.GenerateNewKeys().then(res => {
            if (res.success) {
                Luma.Alert({
                    alert: 'success',
                    title: 'Success!',
                    message: 'New keys was generated'
                }).then(res => {
                    if (res.isConfirmed) {
                        location.reload();
                    }
                });
            }
        });
    }

    function saveDatabaseConfig() {
        const host = $('#inputHost').val() ?? '';
        const username = $('#inputUsername').val() ?? '';
        const password = $('#inputPassword').val() ?? '';
        const database = $('#inputDatabase').val() ?? '';

        if (!host || !username || !database) {
            Luma.Alert({
                alert: 'error',
                title: 'Invalid Input',
                message: 'Please input a valid database connection details'
            });
            return;
        }

        console.log(host, username, password, database);

        Luma.SetSystemConfig({
            host: host,
            username: username,
            password: password,
            database: database,
        }).then(res => {
            if (res.success) {
                Luma.Alert({
                    alert: 'success',
                    title: 'Success!',
                    message: 'System configuration has been updated successfully'
                }).then(res => {
                    if (res.isConfirmed) {
                        location.reload();
                    }
                });
            }
        });

    }

    function createNewDirectory() {
        const folder = $('#inputProjectDiretory').val();

        if (!folder) {
            Luma.Alert({
                alert: 'error',
                title: 'Invalid Input',
                message: 'Please input a valid directory name'
            });
            return;
        }

        Luma.CreateProjectDirectory({
            directory: folder
        }).then(res => {
            if (res.success) {
                Luma.Alert({
                    alert: 'success',
                    title: 'Success!',
                    message: 'Project directory was created successfully'
                }).then(res => {
                    if (res.isConfirmed) {
                        location.reload();
                    }
                });
            }
        });
    }

    function createNewPage() {
        const page = $('#inputPageName').val();
        const directory = $('#directoryList').val();
        
        //console.log(page, directory);

        if (!page) {
            Luma.Alert({
                alert: 'error',
                title: 'Invalid Input',
                message: 'Please input a valid page name'
            });
            return;
        }

        Luma.CreatePage({
            directory: directory,
            page: page
        }).then(res => {
            if (res.success) {
                Luma.Alert({
                    alert: 'success',
                    title: 'Success!',
                    message: 'Page was created successfully'
                }).then(res => {
                    if (res.isConfirmed) {
                        location.reload();
                    }
                });
            }
        });
    }

    function convertToJson() {
        const input = $('#code').val();
        try {
            const result = Luma.StructureConvert(input);
            $('#code').val(result);
        } catch (e) {
            Luma.Alert({
                alert: 'error',
                title: 'error',
                message: 'Invalid HTML structure or syntax.'
            });
        }
    }
}