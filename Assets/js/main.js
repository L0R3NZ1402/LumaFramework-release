window.addEventListener('load', () => {
    const loader = document.getElementById('page-loader');
    const mainContent = document.getElementById('main-content');

    // Show main content
    mainContent.style.display = 'block';

    // Fade out loader
    loader.classList.add('fade-out');

    // Remove loader from DOM after transition
    setTimeout(() => {
        loader.style.display = 'none';
    }, 500); // must match CSS transition duration
});

function showAlert() {
    document.getElementById('customAlert').style.display = 'flex';
}

function closeAlert() {
    document.getElementById('customAlert').style.display = 'none';
}
const toastContainer = document.getElementById('luma-toast-container');

function createToast(type, message) {
    const icons = {
        success: 'bi-check-circle-fill',
        error: 'bi-x-circle-fill',
        info: 'bi-info-circle-fill',
        warning: 'bi-exclamation-triangle-fill'
    };

    const toast = document.createElement('div');
    toast.className = `luma-toast ${type}`;

    toast.innerHTML = `
      <i class="bi ${icons[type]} text-dark"></i>
      <div class="toast-message text-dark">${message}</div>
      <div class="toast-close text-dark" aria-label="Close">&times;</div>
    `;

    toast.querySelector('.toast-close').addEventListener('click', () => {
        hideToast(toast);
    });

    toastContainer.appendChild(toast);

    // Show animation
    setTimeout(() => {
        toast.classList.add('show');
    }, 50);

    // Auto hide after 4 seconds
    setTimeout(() => {
        hideToast(toast);
    }, 4000);
}

function hideToast(toast) {
    toast.classList.remove('show');
    toast.addEventListener('transitionend', () => {
        toast.remove();
    });
}

// Button triggers
document.getElementById('btnSuccess').addEventListener('click', () => {
    createToast('success', 'Operation completed successfully!');
});

document.getElementById('btnError').addEventListener('click', () => {
    createToast('error', 'Oops! Something went wrong.');
});

document.getElementById('btnInfo').addEventListener('click', () => {
    createToast('info', 'Here is some important information.');
});

document.getElementById('btnWarning').addEventListener('click', () => {
    createToast('warning', 'Warning! Please check the details.');
});



