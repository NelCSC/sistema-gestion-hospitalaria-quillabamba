// ===========================================
// SISTEMA SIGH-Q - JAVASCRIPT PRINCIPAL
// Sistema Integral de Gestión Hospitalaria
// Hospital de Quillabamba
// ===========================================

// SIMULACIÓN DE BASE DE DATOS EN MEMORIA
// Para demostración del sistema

// Base de datos simulada para pacientes
let patientsDB = [
    {
        id: 1,
        name: "María González Pérez",
        dni: "12345678",
        birthDate: "1985-05-15",
        gender: "Femenino",
        phone: "987654321",
        email: "maria.gonzalez@email.com",
        address: "Av. Grau 123, Quillabamba"
    },
    {
        id: 2,
        name: "Carlos Rodríguez Silva",
        dni: "87654321",
        birthDate: "1978-12-03",
        gender: "Masculino",
        phone: "998877665",
        email: "carlos.rodriguez@email.com",
        address: "Jr. Cusco 456, Quillabamba"
    }
];

// Base de datos simulada para citas médicas
let appointmentsDB = [
    {
        id: 1,
        patientId: 1,
        patientName: "María González Pérez",
        doctor: "Dr. García",
        specialty: "Medicina General",
        date: "2025-09-14",
        time: "09:00",
        status: "Programada",
        notes: "Control rutinario"
    },
    {
        id: 2,
        patientId: 2,
        patientName: "Carlos Rodríguez Silva",
        doctor: "Dra. López",
        specialty: "Cardiología",
        date: "2025-09-13",
        time: "14:30",
        status: "Completada",
        notes: "Seguimiento hipertensión"
    }
];

// Variables globales para el sistema
let currentUser = null;
let patientIdCounter = patientsDB.length;
let appointmentIdCounter = appointmentsDB.length;

/* ==========================================
   MÓDULO DE AUTENTICACIÓN - RF001
   Gestión de login y sesiones de usuario
========================================== */

// Función para inicializar el sistema
document.addEventListener('DOMContentLoaded', function() {
    initializeSystem();
    initializeTestData();
    Logger.info('Sistema SIGH-Q cargado completamente');
});

function initializeSystem() {
    // Configurar eventos del formulario de login
    const loginForm = document.getElementById('loginForm');
    loginForm.addEventListener('submit', handleLogin);

    // Configurar navegación del sidebar
    setupNavigation();

    // Configurar formularios
    setupForms();

    // Configurar botón de logout
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);

    // Configurar sidebar responsive
    setupResponsiveSidebar();

    // Configurar exportar datos botones
    document.getElementById('exportDashboardBtn').addEventListener('click', () => {
        exportPatientsToCSV();
    });

    console.log('Sistema SIGH-Q inicializado correctamente');
}

function handleLogin(event) {
    event.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    if (validateCredentials(username, password)) {
        currentUser = {
            username: username,
            name: username === 'admin' ? 'Administrador' : 'Usuario',
            role: username === 'admin' ? 'admin' : 'user'
        };

        document.getElementById('currentUser').textContent = currentUser.name;

        document.getElementById('loginModule').style.display = 'none';
        document.getElementById('mainSystem').style.display = 'block';

        showModule('dashboard');

        showNotification('¡Bienvenido al Sistema SIGH-Q!', 'success');
    } else {
        showNotification('Usuario o contraseña incorrectos', 'error');
        document.getElementById('password').value = '';
    }
}

function validateCredentials(username, password) {
    const validCredentials = [
        { username: 'admin', password: '12345' },
        { username: 'doctor', password: '123' },
        { username: 'enfermera', password: '123' }
    ];
    return validCredentials.some(cred =>
        cred.username === username && cred.password === password
    );
}

function handleLogout() {
    currentUser = null;
    document.getElementById('loginModule').style.display = 'flex';
    document.getElementById('mainSystem').style.display = 'none';

    document.getElementById('loginForm').reset();

    showNotification('Sesión cerrada correctamente', 'info');
}

/* ==========================================
   SISTEMA DE NAVEGACIÓN
   Manejo de módulos y navegación entre secciones
========================================== */

function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link[data-module]');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const module = this.getAttribute('data-module');
            showModule(module);

            navLinks.forEach(nl => nl.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

function showModule(moduleName) {
    const modules = document.querySelectorAll('.module-content');
    modules.forEach(module => (module.style.display = 'none'));

    const targetModule = document.getElementById(moduleName + 'Module');
    if (targetModule) {
        targetModule.style.display = 'block';
        targetModule.classList.add('fade-in');

        switch (moduleName) {
            case 'dashboard':
                loadDashboardData();
                break;
            case 'patients':
                loadPatientsData();
                break;
            case 'appointments':
                loadAppointmentsData();
                break;
        }
    }
}

function setupResponsiveSidebar() {
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');

    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('show');
        });

        document.addEventListener('click', function(e) {
            if (window.innerWidth <= 768) {
                if (!sidebar.contains(e.target) && !sidebarToggle.contains(e.target)) {
                    sidebar.classList.remove('show');
                }
            }
        });
    }
}

/* ==========================================
   MÓDULO DASHBOARD - RF004
   Panel principal con estadísticas y datos
========================================== */

function loadDashboardData() {
    const totalPatients = patientsDB.length;
    const todayAppointments = getTodayAppointments().length;
    const pendingAppointments = appointmentsDB.filter(apt => apt.status === 'Programada').length;
    const completedAppointments = appointmentsDB.filter(apt => apt.status === 'Completada').length;

    // Actualiza tarjetas estadísticas en el dashboard
    const dashboardStats = document.getElementById('dashboardStats');
    dashboardStats.innerHTML = `
        <div class="col-xl-3 col-md-6 mb-4">
            <div class="stat-card p-4">
                <div class="d-flex align-items-center">
                    <div class="stat-icon patients me-3">
                        <i class="fas fa-users"></i>
                    </div>
                    <div>
                        <div class="text-xs font-weight-bold text-primary text-uppercase mb-1">Total Pacientes</div>
                        <div class="h5 mb-0 font-weight-bold text-gray-800">${totalPatients}</div>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-xl-3 col-md-6 mb-4">
            <div class="stat-card p-4">
                <div class="d-flex align-items-center">
                    <div class="stat-icon appointments me-3">
                        <i class="fas fa-calendar-check"></i>
                    </div>
                    <div>
                        <div class="text-xs font-weight-bold text-success text-uppercase mb-1">Citas Hoy</div>
                        <div class="h5 mb-0 font-weight-bold text-gray-800">${todayAppointments}</div>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-xl-3 col-md-6 mb-4">
            <div class="stat-card p-4">
                <div class="d-flex align-items-center">
                    <div class="stat-icon pending me-3">
                        <i class="fas fa-clock"></i>
                    </div>
                    <div>
                        <div class="text-xs font-weight-bold text-warning text-uppercase mb-1">Pendientes</div>
                        <div class="h5 mb-0 font-weight-bold text-gray-800">${pendingAppointments}</div>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-xl-3 col-md-6 mb-4">
            <div class="stat-card p-4">
                <div class="d-flex align-items-center">
                    <div class="stat-icon completed me-3">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <div>
                        <div class="text-xs font-weight-bold text-info text-uppercase mb-1">Completadas</div>
                        <div class="h5 mb-0 font-weight-bold text-gray-800">${completedAppointments}</div>
                    </div>
                </div>
            </div>
        </div>
    `;

    loadRecentAppointments();
    loadNotifications();
}

function getTodayAppointments() {
    const today = new Date().toISOString().split('T')[0];
    return appointmentsDB.filter(apt => apt.date === today);
}

function loadRecentAppointments() {
    const tableBody = document.getElementById('recentAppointmentsTable');
    const recentAppointments = appointmentsDB
        .sort((a, b) => new Date(b.date + ' ' + b.time) - new Date(a.date + ' ' + a.time))
        .slice(0, 5);

    tableBody.innerHTML = recentAppointments.map(apt => `
        <tr>
            <td>${formatDate(apt.date)}</td>
            <td>${apt.patientName}</td>
            <td>${apt.doctor}</td>
            <td><span class="badge bg-${getStatusColor(apt.status)}">${apt.status}</span></td>
        </tr>
    `).join('');
}

function loadNotifications() {
    const notificationsList = document.getElementById('notificationsList');
    const todayAppointments = getTodayAppointments();

    let notifications = [];

    if (todayAppointments.length > 0) {
        notifications.push({
            type: 'info',
            message: `Tienes ${todayAppointments.length} citas programadas para hoy`,
            icon: 'fas fa-calendar-check'
        });
    }

    const pendingCount = appointmentsDB.filter(apt => apt.status === 'Programada').length;
    if (pendingCount > 0) {
        notifications.push({
            type: 'warning',
            message: `${pendingCount} citas pendientes por revisar`,
            icon: 'fas fa-clock'
        });
    }

    notificationsList.innerHTML = notifications.map(notif => `
        <div class="alert alert-${notif.type} alert-custom mb-2" role="alert">
            <i class="${notif.icon} me-2"></i>
            ${notif.message}
        </div>
    `).join('') || `<p class="text-muted">No hay notificaciones pendientes</p>`;
}

/* ==========================================
   MÓDULO DE GESTIÓN DE PACIENTES - RF002
========================================== */

function loadPatientsData() {
    const searchInput = document.getElementById('searchPatient');

    searchInput.addEventListener('input', function() {
        filterPatients(this.value);
    });

    renderPatientsTable(patientsDB);
}

function renderPatientsTable(patients) {
    const tableBody = document.getElementById('patientsTable');

    if (patients.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-muted">No se encontraron pacientes</td>
            </tr>`;
        return;
    }

    tableBody.innerHTML = patients.map(patient => `
        <tr>
            <td>${patient.id}</td>
            <td>${patient.name}</td>
            <td>${patient.dni}</td>
            <td>${formatDate(patient.birthDate)}</td>
            <td>${patient.phone || 'N/A'}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary me-1" onclick="editPatient(${patient.id})" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deletePatient(${patient.id})" title="Eliminar">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function filterPatients(searchTerm) {
    const filtered = patientsDB.filter(patient =>
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.dni.includes(searchTerm)
    );
    renderPatientsTable(filtered);
}

function setupForms() {
    const patientForm = document.getElementById('patientForm');
    patientForm.addEventListener('submit', handlePatientSubmit);

    const appointmentForm = document.getElementById('appointmentForm');
    appointmentForm.addEventListener('submit', handleAppointmentSubmit);

    setupFormValidations();
}

function setupFormValidations() {
    const dniInput = document.getElementById('patientDni');
    dniInput.addEventListener('input', function() {
        this.value = this.value.replace(/[^0-9]/g, '').substr(0, 8);
    });

    const phoneInput = document.getElementById('patientPhone');
    phoneInput.addEventListener('input', function() {
        this.value = this.value.replace(/[^0-9]/g, '').substr(0, 9);
    });

    const appointmentDateInput = document.getElementById('appointmentDate');
    appointmentDateInput.addEventListener('change', function() {
        const selectedDate = new Date(this.value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (selectedDate < today) {
            this.value = '';
            showNotification('La fecha no puede ser anterior a hoy', 'error');
        }
    });
}

function openPatientModal(patientId = null) {
    const modalTitle = document.getElementById('patientModalTitle');
    const form = document.getElementById('patientForm');

    form.reset();

    if (patientId) {
        modalTitle.textContent = 'Editar Paciente';
        const patient = patientsDB.find(p => p.id === patientId);

        if (patient) {
            form.patientId.value = patient.id;
            form.patientName.value = patient.name;
            form.patientDni.value = patient.dni;
            form.patientBirthDate.value = patient.birthDate;
            form.patientGender.value = patient.gender;
            form.patientPhone.value = patient.phone || '';
            form.patientEmail.value = patient.email || '';
            form.patientAddress.value = patient.address || '';
        }
    } else {
        modalTitle.textContent = 'Nuevo Paciente';
        form.patientId.value = '';
    }
}

function handlePatientSubmit(event) {
    event.preventDefault();

    const form = event.target;
    const formData = {
        id: form.patientId.value || ++patientIdCounter,
        name: form.patientName.value,
        dni: form.patientDni.value,
        birthDate: form.patientBirthDate.value,
        gender: form.patientGender.value,
        phone: form.patientPhone.value,
        email: form.patientEmail.value,
        address: form.patientAddress.value
    };

    // Validar DNI único
    const existingPatient = patientsDB.find(p => p.dni === formData.dni && p.id != formData.id);
    if (existingPatient) {
        showNotification('Ya existe un paciente con este DNI', 'error');
        return;
    }

    if (form.patientId.value) {
        const index = patientsDB.findIndex(p => p.id == formData.id);
        if (index !== -1) {
            patientsDB[index] = { ...patientsDB[index], ...formData };
            showNotification('Paciente actualizado correctamente', 'success');
        }
    } else {
        patientsDB.push(formData);
        showNotification('Paciente registrado correctamente', 'success');
    }

    bootstrap.Modal.getInstance(document.getElementById('patientModal')).hide();
    renderPatientsTable(patientsDB);
    updatePatientSelect();
}

function editPatient(patientId) {
    openPatientModal(patientId);
    bootstrap.Modal.getOrCreateInstance(document.getElementById('patientModal')).show();
}

function deletePatient(patientId) {
    if (confirm('¿Está seguro de eliminar este paciente?')) {
        const hasAppointments = appointmentsDB.some(apt => apt.patientId === patientId && apt.status === 'Programada');

        if (hasAppointments) {
            showNotification('No se puede eliminar. El paciente tiene citas programadas.', 'error');
            return;
        }

        patientsDB = patientsDB.filter(p => p.id !== patientId);
        renderPatientsTable(patientsDB);
        updatePatientSelect();
        showNotification('Paciente eliminado correctamente', 'success');
    }
}

/* ==========================================
   MÓDULO DE CITAS MÉDICAS - RF003
========================================== */

function loadAppointmentsData() {
    const filterDate = document.getElementById('filterDate');
    const filterStatus = document.getElementById('filterStatus');

    filterDate.addEventListener('change', filterAppointments);
    filterStatus.addEventListener('change', filterAppointments);

    updatePatientSelect();

    renderAppointmentsTable(appointmentsDB);
}

function renderAppointmentsTable(appointments) {
    const tableBody = document.getElementById('appointmentsTable');

    if (appointments.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-muted">No se encontraron citas</td>
            </tr>`;
        return;
    }

    const sortedAppointments = appointments.sort((a, b) => {
        const dateA = new Date(a.date + ' ' + a.time);
        const dateB = new Date(b.date + ' ' + b.time);
        return dateB - dateA;
    });

    tableBody.innerHTML = sortedAppointments.map(apt => `
        <tr>
            <td>${formatDate(apt.date)}</td>
            <td>${apt.time}</td>
            <td>${apt.patientName}</td>
            <td>${apt.doctor}</td>
            <td>${apt.specialty}</td>
            <td><span class="badge bg-${getStatusColor(apt.status)}">${apt.status}</span></td>
            <td>
                <button class="btn btn-sm btn-outline-primary me-1" onclick="editAppointment(${apt.id})" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteAppointment(${apt.id})" title="Eliminar">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function filterAppointments() {
    const filterDate = document.getElementById('filterDate').value;
    const filterStatus = document.getElementById('filterStatus').value;

    let filtered = [...appointmentsDB];

    if (filterDate) {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        switch (filterDate) {
            case 'today':
                const todayStr = today.toISOString().split('T')[0];
                filtered = filtered.filter(apt => apt.date === todayStr);
                break;
            case 'tomorrow':
                const tomorrowStr = tomorrow.toISOString().split('T')[0];
                filtered = filtered.filter(apt => apt.date === tomorrowStr);
                break;
            case 'week':
                const weekEnd = new Date(today);
                weekEnd.setDate(weekEnd.getDate() + 7);
                filtered = filtered.filter(apt => {
                    const aptDate = new Date(apt.date);
                    return aptDate >= today && aptDate <= weekEnd;
                });
                break;
        }
    }

    if (filterStatus) {
        filtered = filtered.filter(apt => apt.status === filterStatus);
    }

    renderAppointmentsTable(filtered);
}

function updatePatientSelect() {
    const select = document.getElementById('appointmentPatient');
    select.innerHTML =
        '<option value="">Seleccionar paciente...</option>' +
        patientsDB.map(
            patient =>
                `<option value="${patient.id}">${patient.name} - DNI: ${patient.dni}</option>`
        ).join('');
}

function openAppointmentModal(appointmentId = null) {
    const modalTitle = document.getElementById('appointmentModalTitle');
    const form = document.getElementById('appointmentForm');

    form.reset();

    if (appointmentId) {
        modalTitle.textContent = 'Editar Cita';
        const appointment = appointmentsDB.find(a => a.id === appointmentId);

        if (appointment) {
            form.appointmentId.value = appointment.id;
            form.appointmentPatient.value = appointment.patientId;
            form.appointmentDoctor.value = appointment.doctor;
            form.appointmentDate.value = appointment.date;
            form.appointmentTime.value = appointment.time;
            form.appointmentSpecialty.value = appointment.specialty;
            form.appointmentStatus.value = appointment.status;
            form.appointmentNotes.value = appointment.notes || '';
        }
    } else {
        modalTitle.textContent = 'Nueva Cita';
        form.appointmentId.value = '';
        form.appointmentStatus.value = 'Programada';
    }
}

function handleAppointmentSubmit(event) {
    event.preventDefault();

    const form = event.target;
    const patientId = parseInt(form.appointmentPatient.value);
    const patient = patientsDB.find(p => p.id === patientId);

    if (!patient) {
        showNotification('Paciente no válido', 'error');
        return;
    }

    const formData = {
        id: form.appointmentId.value || ++appointmentIdCounter,
        patientId: patientId,
        patientName: patient ? patient.name : '',
        doctor: form.appointmentDoctor.value,
        specialty: form.appointmentSpecialty.value,
        date: form.appointmentDate.value,
        time: form.appointmentTime.value,
        status: form.appointmentStatus.value,
        notes: form.appointmentNotes.value
    };

    // Validar conflictos de horario
    const conflictingAppointment = appointmentsDB.find(apt =>
        apt.doctor === formData.doctor &&
        apt.date === formData.date &&
        apt.time === formData.time &&
        apt.id != formData.id &&
        apt.status !== 'Cancelada'
    );

    if (conflictingAppointment) {
        showNotification('El doctor ya tiene una cita programada en ese horario', 'error');
        return;
    }

    if (form.appointmentId.value) {
        const index = appointmentsDB.findIndex(a => a.id == formData.id);
        if (index !== -1) {
            appointmentsDB[index] = { ...appointmentsDB[index], ...formData };
            showNotification('Cita actualizada correctamente', 'success');
        }
    } else {
        appointmentsDB.push(formData);
        showNotification('Cita programada correctamente', 'success');
    }

    bootstrap.Modal.getInstance(document.getElementById('appointmentModal')).hide();
    renderAppointmentsTable(appointmentsDB);

    if (document.getElementById('dashboardModule').style.display !== 'none') {
        loadDashboardData();
    }
}

function editAppointment(appointmentId) {
    openAppointmentModal(appointmentId);
    bootstrap.Modal.getOrCreateInstance(document.getElementById('appointmentModal')).show();
}

function deleteAppointment(appointmentId) {
    if (confirm('¿Está seguro de eliminar esta cita?')) {
        appointmentsDB = appointmentsDB.filter(a => a.id !== appointmentId);
        renderAppointmentsTable(appointmentsDB);
        showNotification('Cita eliminada correctamente', 'success');

        if (document.getElementById('dashboardModule').style.display !== 'none') {
            loadDashboardData();
        }
    }
}

/* ==========================================
   FUNCIONES UTILITARIAS
========================================== */

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-PE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

function getStatusColor(status) {
    switch (status) {
        case 'Programada': return 'warning';
        case 'Completada': return 'success';
        case 'Cancelada': return 'danger';
        default: return 'secondary';
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 1060; min-width: 300px;';
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        if (notification && notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function calculateAge(birthDate) {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }

    return age;
}

function validateWorkingHours(time) {
    const [hours, minutes] = time.split(':').map(Number);
    const timeInMinutes = hours * 60 + minutes;
    const startTime = 8 * 60; // 8:00 AM
    const endTime = 18 * 60;  // 6:00 PM

    return timeInMinutes >= startTime && timeInMinutes <= endTime;
}

function formatPhoneNumber(phone) {
    if (!phone) return '';

    const numbers = phone.replace(/\D/g, '');

    if (numbers.length === 9) {
        return `${numbers.substring(0, 3)} ${numbers.substring(3, 6)} ${numbers.substring(6)}`;
    }

    return phone;
}

/* ==========================================
   FUNCIONES DE EXPORTACIÓN DE DATOS
========================================== */

function exportPatientsToCSV() {
    const headers = ['ID', 'Nombre', 'DNI', 'Fecha Nacimiento', 'Género', 'Teléfono', 'Email', 'Dirección'];
    const csvContent = [
        headers.join(','),
        ...patientsDB.map(patient => [
            patient.id,
            `"${patient.name}"`,
            patient.dni,
            patient.birthDate,
            patient.gender,
            patient.phone || '',
            patient.email || '',
            `"${patient.address || ''}"`
        ].join(','))
    ].join('\n');

    downloadCSV(csvContent, 'pacientes.csv');
}

function exportAppointmentsToCSV() {
    const headers = ['ID', 'Fecha', 'Hora', 'Paciente', 'Doctor', 'Especialidad', 'Estado', 'Observaciones'];
    const csvContent = [
        headers.join(','),
        ...appointmentsDB.map(apt => [
            apt.id,
            apt.date,
            apt.time,
            `"${apt.patientName}"`,
            `"${apt.doctor}"`,
            `"${apt.specialty}"`,
            apt.status,
            `"${apt.notes || ''}"`
        ].join(','))
    ].join('\n');

    downloadCSV(csvContent, 'citas.csv');
}

function downloadCSV(content, filename) {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

/* ==========================================
   FUNCIONES DE BÚSQUEDA AVANZADA
========================================== */

function advancedPatientSearch(filters) {
    return patientsDB.filter(patient => {
        let matches = true;

        if (filters.name) {
            matches = matches && patient.name.toLowerCase().includes(filters.name.toLowerCase());
        }

        if (filters.dni) {
            matches = matches && patient.dni.includes(filters.dni);
        }

        if (filters.gender) {
            matches = matches && patient.gender === filters.gender;
        }

        if (filters.ageMin || filters.ageMax) {
            const age = calculateAge(patient.birthDate);
            if (filters.ageMin) matches = matches && age >= filters.ageMin;
            if (filters.ageMax) matches = matches && age <= filters.ageMax;
        }

        return matches;
    });
}

function advancedAppointmentSearch(filters) {
    return appointmentsDB.filter(appointment => {
        let matches = true;

        if (filters.patientName) {
            matches = matches && appointment.patientName.toLowerCase().includes(filters.patientName.toLowerCase());
        }

        if (filters.doctor) {
            matches = matches && appointment.doctor.toLowerCase().includes(filters.doctor.toLowerCase());
        }

        if (filters.specialty) {
            matches = matches && appointment.specialty === filters.specialty;
        }

        if (filters.status) {
            matches = matches && appointment.status === filters.status;
        }

        if (filters.dateFrom) {
            matches = matches && appointment.date >= filters.dateFrom;
        }

        if (filters.dateTo) {
            matches = matches && appointment.date <= filters.dateTo;
        }

        return matches;
    });
}

/* ==========================================
   FUNCIONES DE VALIDACIÓN AVANZADA
========================================== */

function isDoctorAvailable(doctor, date, time, excludeAppointmentId = null) {
    return !appointmentsDB.some(apt =>
        apt.doctor === doctor &&
        apt.date === date &&
        apt.time === time &&
        apt.status !== 'Cancelada' &&
        apt.id !== excludeAppointmentId
    );
}

function validatePatientDailyLimit(patientId, date, excludeAppointmentId = null) {
    const dailyLimit = 2; // Máximo 2 citas por día
    const patientAppointments = appointmentsDB.filter(apt =>
        apt.patientId === patientId &&
        apt.date === date &&
        apt.status !== 'Cancelada' &&
        apt.id !== excludeAppointmentId
    );

    return patientAppointments.length < dailyLimit;
}

function validatePeruvianDNI(dni) {
    if (!/^\d{8}$/.test(dni)) {
        return false;
    }

    if (/^(\d)\1{7}$/.test(dni)) {
        return false;
    }

    return true;
}

function validateDateRange(startDate, endDate) {
    if (!startDate || !endDate) return true;
    return new Date(startDate) <= new Date(endDate);
}

/* ==========================================
   FUNCIONES DE ESTADÍSTICAS AVANZADAS
========================================== */

function getMonthlyStats(year, month) {
    const monthStr = `${year}-${month.toString().padStart(2, '0')}`;

    const monthlyAppointments = appointmentsDB.filter(apt =>
        apt.date.startsWith(monthStr)
    );

    return {
        totalAppointments: monthlyAppointments.length,
        completedAppointments: monthlyAppointments.filter(apt => apt.status === 'Completada').length,
        canceledAppointments: monthlyAppointments.filter(apt => apt.status === 'Cancelada').length,
        pendingAppointments: monthlyAppointments.filter(apt => apt.status === 'Programada').length,
        appointmentsBySpecialty: getAppointmentsBySpecialty(monthlyAppointments),
        appointmentsByDoctor: getAppointmentsByDoctor(monthlyAppointments)
    };
}

function getAppointmentsBySpecialty(appointments = appointmentsDB) {
    const specialties = {};

    appointments.forEach(apt => {
        if (!specialties[apt.specialty]) {
            specialties[apt.specialty] = 0;
        }
        specialties[apt.specialty]++;
    });

    return specialties;
}

function getAppointmentsByDoctor(appointments = appointmentsDB) {
    const doctors = {};

    appointments.forEach(apt => {
        if (!doctors[apt.doctor]) {
            doctors[apt.doctor] = 0;
        }
        doctors[apt.doctor]++;
    });

    return doctors;
}

function getPatientsAgeDistribution() {
    const ageGroups = {
        '0-18': 0,
        '19-30': 0,
        '31-50': 0,
        '51-70': 0,
        '71+': 0
    };

    patientsDB.forEach(patient => {
        const age = calculateAge(patient.birthDate);

        if (age <= 18) ageGroups['0-18']++;
        else if (age <= 30) ageGroups['19-30']++;
        else if (age <= 50) ageGroups['31-50']++;
        else if (age <= 70) ageGroups['51-70']++;
        else ageGroups['71+']++;
    });

    return ageGroups;
}

function getAppointmentComplianceRate() {
    const totalAppointments = appointmentsDB.length;
    const completedAppointments = appointmentsDB.filter(apt => apt.status === 'Completada').length;

    return totalAppointments > 0 ? (completedAppointments / totalAppointments * 100).toFixed(1) : 0;
}

/* ==========================================
   FUNCIONES DE CONFIGURACIÓN DEL SISTEMA
========================================== */

const workingHours = {
    start: '08:00',
    end: '18:00',
    lunchBreakStart: '12:00',
    lunchBreakEnd: '13:00',
    appointmentDuration: 30 // minutos
};

function generateTimeSlots(date, doctor) {
    const slots = [];
    const start = timeToMinutes(workingHours.start);
    const end = timeToMinutes(workingHours.end);
    const lunchStart = timeToMinutes(workingHours.lunchBreakStart);
    const lunchEnd = timeToMinutes(workingHours.lunchBreakEnd);
    const duration = workingHours.appointmentDuration;

    for (let time = start; time < end; time += duration) {
        if (time >= lunchStart && time < lunchEnd) {
            continue;
        }

        const timeStr = minutesToTime(time);

        if (isDoctorAvailable(doctor, date, timeStr)) {
            slots.push(timeStr);
        }
    }

    return slots;
}

function timeToMinutes(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
}

function minutesToTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

/* ==========================================
   INICIALIZACIÓN DE DATOS DE PRUEBA
========================================== */

function initializeTestData() {
    if (patientsDB.length < 5) {
        const additionalPatients = [
            {
                id: 3,
                name: "Ana López Martínez",
                dni: "45678912",
                birthDate: "1992-08-20",
                gender: "Femenino",
                phone: "987123456",
                email: "ana.lopez@email.com",
                address: "Calle Real 789, Quillabamba"
            },
            {
                id: 4,
                name: "Luis Quispe Huamán",
                dni: "78912345",
                birthDate: "1965-03-10",
                gender: "Masculino",
                phone: "956789123",
                email: "luis.quispe@email.com",
                address: "Av. Ejercito 321, Quillabamba"
            }
        ];

        patientsDB.push(...additionalPatients);
        patientIdCounter = Math.max(...patientsDB.map(p => p.id));
    }

    if (appointmentsDB.length < 5) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];

        const additionalAppointments = [
            {
                id: 3,
                patientId: 3,
                patientName: "Ana López Martínez",
                doctor: "Dr. Martínez",
                specialty: "Ginecología",
                date: tomorrowStr,
                time: "10:30",
                status: "Programada",
                notes: "Control ginecológico anual"
            },
            {
                id: 4,
                patientId: 4,
                patientName: "Luis Quispe Huamán",
                doctor: "Dr. García",
                specialty: "Medicina General",
                date: "2025-09-15",
                time: "15:00",
                status: "Programada",
                notes: "Consulta por dolor de espalda"
            }
        ];

        appointmentsDB.push(...additionalAppointments);
        appointmentIdCounter = Math.max(...appointmentsDB.map(a => a.id));
    }
}

/* ==========================================
   MANEJO DE ERRORES Y LOGGING
========================================== */

const Logger = {
    log: function(message, level = 'INFO') {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] [${level}] SIGH-Q: ${message}`);
    },
    error: function(message, error = null) {
        this.log(`ERROR: ${message}`, 'ERROR');
        if (error) {
            console.error(error);
        }
    },
    warn: function(message) {
        this.log(`WARNING: ${message}`, 'WARN');
    },
    info: function(message) {
        this.log(message, 'INFO');
    }
};

window.addEventListener('error', function(event) {
    Logger.error(`Error no manejado: ${event.message}`, event.error);
    showNotification('Ha ocurrido un error inesperado. Por favor, recargue la página.', 'error');
});

window.addEventListener('unhandledrejection', function(event) {
    Logger.error(`Promesa rechazada: ${event.reason}`);
    showNotification('Error en operación asíncrona', 'error');
});
