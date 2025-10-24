$(document).ready(function () {
    Luma.CheckRole();
})

Luma.Role = Luma.Role || {};

Luma.Role.Default = function() {
    const rules = {
        role: 'default',
        rules: {
            your_table: { select: true, insert: true, update: true, delete: true },
        }
    };

    Luma.RoleRules = rules.rules;

    Luma.LoadPage({
        file: 'js/pages/GettingStarted.js',
        init: 'GettingStarted',
        showHeader: false,
        showSidebar: false
    });
}