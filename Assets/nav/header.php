<div class="container-fluid mt-3 px-4">
    <div class="card card-rounded shadow-sm">
        <div class="card-body d-flex justify-content-between align-items-center">
            <button class="btn p-0 m-0 border-0 bg-transparent" type="button" data-bs-toggle="offcanvas"
                data-bs-target="#sidebar" aria-controls="sidebar" style="box-shadow: none;">
                <i class="bi bi-list fs-4"></i> <!-- Increased icon size using fs-2 -->
            </button>

            <!-- Profile dropdown -->
            <div class="dropdown">
                <div class="profile-dropdown-toggle" id="profileDropdown" data-bs-toggle="dropdown"
                    aria-expanded="false">
                    <img src="Assets/img/def.jpg" alt="John Doe" class="profile-pic" />
                    <span id="lumaUsername">John Doe</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                        class="bi bi-chevron-down ms-2" viewBox="0 0 16 16">
                        <path fill-rule="evenodd"
                            d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z" />
                    </svg>
                </div>

                <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="profileDropdown">
                    <li>
                        <a class="dropdown-item" href="#" id="LumaProfilePage">
                            <i class="bi bi-person-fill me-2"></i> Profile
                        </a>
                    </li>
                    <li>
                        <a class="dropdown-item" href="#" id="LumaSettingsPage">
                            <i class="bi bi-gear-fill me-2"></i> Settings
                        </a>
                    </li>
                    <li>
                        <hr class="dropdown-divider" />
                    </li>
                    <li>
                        <a class="dropdown-item" href="#" id="LumaLogoutBtn">
                            <i class="bi bi-box-arrow-right me-2"></i> Logout
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</div>