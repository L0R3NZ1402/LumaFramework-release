$(document).ready(function () {
    Luma.CheckRole();
})

Luma.Role = Luma.Role || {};

Luma.Role.Default = function() {
    Luma.LoadPage({
        file: 'tools/SystemConfig.js',
        init: 'SystemConfig',
        showHeader: false,
        showSidebar: false
    });
}
