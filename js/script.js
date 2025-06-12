// Variables globales
let currentUser = null;
let authToken = null;
let currentType = 'renuncia';
let currentData = {};
let apiOnline = false;
let letterHistory = [];

// Ejemplos predefinidos
const examples = {
    renuncia: {
        nombre: "María González",
        cargo: "Analista de Sistemas",
        empresa: "TechCorp S.A.",
        destinatario: "Sr. Director de Recursos Humanos",
        motivo: "He recibido una oferta laboral que representa una oportunidad significativa de crecimiento profesional en el área de desarrollo de software, la cual se alinea perfectamente con mis objetivos de carrera a largo plazo.",
        fechas: "15 de marzo de 2024",
        tono: "formal",
        contacto: "maria.gonzalez@email.com"
    },
    vacaciones: {
        nombre: "Carlos Rodríguez",
        cargo: "Gerente de Ventas",
        empresa: "Comercial ABC",
        destinatario: "Sra. Directora General",
        motivo: "Deseo tomar mis vacaciones anuales para descansar y pasar tiempo de calidad con mi familia. He planificado este período considerando que es una época de menor actividad comercial.",
        fechas: "del 1 al 15 de julio de 2024",
        tono: "cordial",
        contacto: "carlos.rodriguez@email.com"
    },
    recomendacion: {
        nombre: "Dr. Roberto Martínez",
        cargo: "Director de Proyectos",
        empresa: "Innovación Tech",
        destinatario: "A quien corresponda",
        motivo: "Ana Pérez trabajó bajo mi supervisión durante 3 años como Desarrolladora Senior. Durante este tiempo demostró excepcionales habilidades técnicas, liderazgo natural y una ética de trabajo impecable. Lideró exitosamente el proyecto de migración de sistemas que resultó en un ahorro del 30% en costos operativos.",
        fechas: "",
        tono: "formal",
        contacto: "roberto.martinez@email.com"
    }
};

// Inicialización
document.addEventListener('DOMContentLoaded', function () {
    loadUserFromStorage();
    initializeTemplates();
    initializeForm();
    loadTheme();
    addFormValidation();
    checkApiStatus();
    loadHistory();
});

// ==================== FUNCIONES DE AUTENTICACIÓN ====================

function showAuthModal(type = 'login') {
    const modal = document.getElementById('authModal');
    modal.style.display = 'block';

    if (type === 'login') {
        showLoginForm();
    } else {
        showRegisterForm();
    }
}

function closeAuthModal() {
    const modal = document.getElementById('authModal');
    modal.style.display = 'none';
}

function showLoginForm() {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('registerForm').style.display = 'none';
}

function showRegisterForm() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
}

async function handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const btn = document.getElementById('loginBtn');

    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Iniciando sesión...';

    try {
        const response = await fetch('https://redactafacil.onrender.com/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            authToken = data.token;
            currentUser = data.user;

            localStorage.setItem('authToken', authToken);
            localStorage.setItem('currentUser', JSON.stringify(currentUser));

            updateUserInterface();
            closeAuthModal();
            showToast('¡Bienvenido de vuelta! 🎉', 'success');
        } else {
            showToast(data.error || 'Error al iniciar sesión', 'error');
        }
    } catch (error) {
        console.error('Error en login:', error);
        showToast('Error de conexión. Intenta nuevamente.', 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Iniciar Sesión';
    }
}

async function handleRegister(event) {
    event.preventDefault();

    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const btn = document.getElementById('registerBtn');

    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creando cuenta...';

    try {
        const response = await fetch('https://redactafacil.onrender.com/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();

        if (response.ok) {
            authToken = data.token;
            currentUser = data.user;

            localStorage.setItem('authToken', authToken);
            localStorage.setItem('currentUser', JSON.stringify(currentUser));

            updateUserInterface();
            closeAuthModal();
            showToast('¡Cuenta creada exitosamente! Bienvenido a RedactaFácil 🚀', 'success');
        } else {
            showToast(data.error || 'Error al crear la cuenta', 'error');
        }
    } catch (error) {
        console.error('Error en registro:', error);
        showToast('Error de conexión. Intenta nuevamente.', 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-user-plus"></i> Crear Cuenta';
    }
}

function logout() {
    authToken = null;
    currentUser = null;

    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');

    updateUserInterface();
    showToast('Sesión cerrada correctamente', 'success');
}

function updateUserInterface() {
    const guestActions = document.getElementById('guestActions');
    const userActions = document.getElementById('userActions');

    if (currentUser) {
        guestActions.style.display = 'none';
        userActions.style.display = 'flex';

        // Actualizar información del usuario
        const userAvatar = document.getElementById('userAvatar');
        const userName = document.getElementById('userName');
        const userPlan = document.getElementById('userPlan');

        userAvatar.textContent = currentUser.name.charAt(0).toUpperCase();
        userName.textContent = currentUser.name;
        userPlan.innerHTML = currentUser.isPremium ?
            '<span class="premium-badge">Premium</span>' :
            'Plan Básico';

        // Mostrar indicador de uso
        updateUsageIndicator();
    } else {
        guestActions.style.display = 'flex';
        userActions.style.display = 'none';

        // Eliminar indicador de uso si existe
        const usageIndicator = document.getElementById('usageIndicator');
        if (usageIndicator) {
            usageIndicator.remove();
        }
    }
}

function updateUsageIndicator() {
    if (!currentUser) return;

    // Crear o actualizar indicador de uso
    let usageIndicator = document.getElementById('usageIndicator');
    if (!usageIndicator) {
        usageIndicator = document.createElement('div');
        usageIndicator.id = 'usageIndicator';
        usageIndicator.className = 'usage-indicator';

        const formSection = document.querySelector('.form-section');
        formSection.insertBefore(usageIndicator, formSection.firstChild);
    }

    const limit = currentUser.isPremium ? 100 : 3;
    const used = currentUser.isPremium ? currentUser.usage.monthlyCount : currentUser.usage.weeklyCount;
    const period = currentUser.isPremium ? 'mensual' : 'semanal';
    const percentage = (used / limit) * 100;

    let fillClass = '';
    if (percentage >= 90) fillClass = 'danger';
    else if (percentage >= 70) fillClass = 'warning';

    usageIndicator.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
            <span style="font-weight: 600; color: var(--text-primary);">
                <i class="fas fa-chart-bar"></i> Uso ${period}
            </span>
            ${!currentUser.isPremium ? `<button class="upgrade-btn" onclick="upgradeToPremium()">
                <i class="fas fa-crown"></i> Actualizar a Premium
            </button>` : ''}
        </div>
        <div style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 0.5rem;">
            ${used} de ${limit} generaciones utilizadas
        </div>
        <div class="usage-bar">
            <div class="usage-fill ${fillClass}" style="width: ${percentage}%"></div>
        </div>
    `;
}

async function upgradeToPremium() {
    if (!authToken) return;

    try {
        const mp = new MercadoPago('APP_USR-70e73a4b-4ada-48b5-a204-eeef10e3dc30', {
            locale: 'es-UY'
        });

        const res = await fetch("/api/crear-preferencia-premium", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                descripcion: "Actualización a Premium",
                precio: 3,
                cantidad: 1
            })
        });

        const data = await res.json();

        if (data.id) {
            mp.checkout({
                preference: { id: data.id },
                autoOpen: true,
            });
        } else {
            showToast("No se pudo generar el pago", "error");
        }

    } catch (error) {
        console.error('Error iniciando pago:', error);
        showToast('Error iniciando pago', 'error');
    }
}

function loadUserFromStorage() {
    const savedToken = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('currentUser');

    if (savedToken && savedUser) {
        try {
            authToken = savedToken;
            currentUser = JSON.parse(savedUser);
            updateUserInterface();
        } catch (error) {
            console.error('Error loading user from storage:', error);
            localStorage.removeItem('authToken');
            localStorage.removeItem('currentUser');
        }
    }
}

// ==================== FUNCIONES PRINCIPALES ====================

function initializeTemplates() {
    const templateCards = document.querySelectorAll('.template-card');

    templateCards.forEach(card => {
        card.addEventListener('click', function () {
            // Remover clase active de todas las tarjetas
            templateCards.forEach(c => c.classList.remove('active'));

            // Agregar clase active a la tarjeta seleccionada
            this.classList.add('active');

            // Actualizar tipo actual
            currentType = this.dataset.type;

            // Actualizar placeholder del motivo según el tipo
            updateMotivoPlaceholder();

            // Limpiar formulario
            clearForm();
        });
    });
}

function updateMotivoPlaceholder() {
    const motivoInput = document.getElementById('motivo');
    const placeholders = {
        renuncia: "Explica el motivo de tu renuncia. Ej: He recibido una oferta laboral que representa una oportunidad de crecimiento profesional...",
        vacaciones: "Indica las fechas y motivo de tus vacaciones. Ej: Solicito vacaciones del 15 al 30 de julio para descanso familiar...",
        reclamo: "Describe detalladamente tu reclamo. Ej: El servicio recibido no cumplió con las expectativas acordadas...",
        recomendacion: "Describe las cualidades y logros de la persona. Ej: Juan trabajó bajo mi supervisión durante 2 años demostrando...",
        agradecimiento: "Explica el motivo de tu agradecimiento. Ej: Agradezco la oportunidad brindada durante mi tiempo en la empresa...",
        correo: "Describe el propósito de tu correo profesional. Ej: Me dirijo a usted para solicitar información sobre...",
        presentacion: "Describe tu perfil y objetivos profesionales. Ej: Soy un profesional con 5 años de experiencia en...",
        solicitud: "Detalla lo que estás solicitando. Ej: Solicito autorización para participar en el curso de capacitación...",
        invitacion: "Describe el evento y detalles de la invitación. Ej: Tenemos el agrado de invitarle a nuestro evento anual...",
        disculpa: "Explica el motivo de la disculpa y cómo planeas solucionarlo. Ej: Lamento profundamente el inconveniente causado...",
        propuesta: "Describe tu propuesta comercial o profesional. Ej: Presentamos una propuesta para optimizar sus procesos...",
        cotizacion: "Especifica qué productos o servicios necesitas cotizar. Ej: Solicito cotización para servicios de desarrollo web..."
    };

    motivoInput.placeholder = placeholders[currentType] || "Describe el motivo de tu carta con el mayor detalle posible...";
}

function initializeForm() {
    const form = document.getElementById('letterForm');
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        generarCarta();
    });
}

function addFormValidation() {
    const requiredFields = ['nombre', 'empresa', 'motivo'];

    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        field.addEventListener('blur', function () {
            validateField(this);
        });

        field.addEventListener('input', function () {
            if (this.classList.contains('error')) {
                validateField(this);
            }
        });
    });
}

function validateField(field) {
    const value = field.value.trim();

    if (!value) {
        field.classList.add('error');
        field.style.borderColor = 'var(--danger)';
        return false;
    } else {
        field.classList.remove('error');
        field.style.borderColor = 'var(--border)';
        return true;
    }
}

function highlightRequiredFields() {
    const requiredFields = ['nombre', 'empresa', 'motivo'];

    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (!field.value.trim()) {
            field.style.borderColor = 'var(--danger)';
            field.classList.add('error');
        }
    });
}

async function generarCarta() {
    // Verificar autenticación
    if (!authToken) {
        showToast('Debes iniciar sesión para generar cartas', 'warning');
        showAuthModal('login');
        return;
    }

    const datos = {
        tipo: currentType,
        nombre: document.getElementById('nombre').value.trim(),
        empresa: document.getElementById('empresa').value.trim(),
        cargo: document.getElementById('cargo').value.trim(),
        destinatario: document.getElementById('destinatario').value.trim(),
        motivo: document.getElementById('motivo').value.trim(),
        fechas: document.getElementById('fechas').value.trim(),
        tono: document.getElementById('tono').value,
        contacto: document.getElementById('contacto').value.trim()
    };

    // Validación mejorada
    if (!datos.nombre || !datos.empresa || !datos.motivo) {
        showToast('Por favor, completa todos los campos obligatorios (*)', 'error');
        highlightRequiredFields();
        return;
    }

    if (datos.motivo.length < 20) {
        showToast('Por favor, proporciona una explicación más detallada del motivo', 'warning');
        document.getElementById('motivo').focus();
        return;
    }

    currentData = datos;
    const btn = document.querySelector('.generate-btn');
    const resultado = document.getElementById('resultado');
    const actions = document.getElementById('resultActions');

    // Estado de carga
    btn.classList.add('loading');
    btn.disabled = true;
    resultado.innerHTML = '<div class="pulse" style="text-align: center; color: var(--primary);"><i class="fas fa-magic" style="font-size: 2rem; margin-bottom: 1rem;"></i><br>Generando tu carta personalizada con IA...<br><small style="opacity: 0.7;">Esto puede tomar unos segundos</small></div>';
    resultado.classList.add('empty');
    actions.classList.remove('show');

    try {
        const response = await fetch('https://redactafacil.onrender.com/api/generar-carta', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                tipo: datos.tipo,
                nombre: datos.nombre,
                empresa: datos.empresa,
                cargo: datos.cargo,
                motivo: datos.motivo,
                fechas: datos.fechas
            })
        });

        const data = await response.json();

        if (response.ok) {
            // Actualizar uso del usuario
            if (currentUser.isPremium) {
                currentUser.usage.monthlyCount = data.usage.used;
            } else {
                currentUser.usage.weeklyCount = data.usage.used;
            }
            localStorage.setItem('currentUser', JSON.stringify(currentUser));

            // Mostrar resultado con animación
            setTimeout(() => {
                resultado.innerHTML = data.carta;
                resultado.classList.remove('empty');
                resultado.classList.add('fade-in');
                actions.classList.add('show');

                btn.classList.remove('loading');
                btn.disabled = false;

                showToast('¡Carta generada exitosamente! 🎉', 'success');

                // Actualizar indicador de uso
                updateUsageIndicator();

                // Guardar en historial
                saveToHistory(datos, data.carta);

                // Scroll suave al resultado
                resultado.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 500);
        } else {
            if (response.status === 429) {
                // Límite alcanzado
                showToast(data.error, 'warning');
                if (!currentUser.isPremium) {
                    setTimeout(() => {
                        if (confirm('¿Quieres actualizar a Premium para obtener más generaciones?')) {
                            upgradeToPremium();
                        }
                    }, 2000);
                }
            } else {
                showToast(data.error || 'Error al generar la carta', 'error');
            }

            resultado.innerHTML = '<div style="text-align: center; color: var(--danger);"><i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 1rem;"></i><br>Error al generar la carta<br><small>Por favor, intenta nuevamente</small></div>';
            resultado.classList.add('empty');

            btn.classList.remove('loading');
            btn.disabled = false;
        }
    } catch (error) {
        console.error('Error:', error);
        resultado.innerHTML = '<div style="text-align: center; color: var(--danger);"><i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 1rem;"></i><br>Error de conexión<br><small>Verifica tu conexión a internet</small></div>';
        resultado.classList.add('empty');

        btn.classList.remove('loading');
        btn.disabled = false;

        showToast('Error de conexión. Intenta nuevamente.', 'error');
    }
}

// ==================== FUNCIONES DE UTILIDAD ====================

function showToast(message, type = 'success') {
    // Remover toast existente si hay uno
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icon = type === 'success' ? 'fa-check-circle' :
        type === 'error' ? 'fa-exclamation-circle' :
            'fa-exclamation-triangle';

    toast.innerHTML = `
        <i class="fas ${icon}"></i>
        <span>${message}</span>
    `;

    document.body.appendChild(toast);

    // Mostrar toast
    setTimeout(() => toast.classList.add('show'), 100);

    // Ocultar toast después de 4 segundos
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

function clearForm() {
    const form = document.getElementById('letterForm');
    const inputs = form.querySelectorAll('input, textarea, select');

    inputs.forEach(input => {
        if (input.type !== 'submit') {
            input.value = '';
            input.style.borderColor = 'var(--border)';
            input.classList.remove('error');
        }
    });

    // Resetear tono a formal
    document.getElementById('tono').value = 'formal';

    // Limpiar resultado
    const resultado = document.getElementById('resultado');
    const actions = document.getElementById('resultActions');

    resultado.innerHTML = `
        <div class="empty-icon">📝</div>
        <div>Completa el formulario y haz clic en "Generar Carta" para ver tu carta personalizada aquí.</div>
        <div style="font-size: 0.875rem; margin-top: 0.5rem; opacity: 0.7;">Tu carta será generada con IA avanzada</div>
    `;
    resultado.classList.add('empty');
    resultado.classList.remove('fade-in');
    actions.classList.remove('show');
}

function useExample(type) {
    if (examples[type]) {
        const example = examples[type];

        // Seleccionar el tipo de plantilla
        const templateCard = document.querySelector(`[data-type="${type}"]`);
        if (templateCard) {
            templateCard.click();
        }

        // Llenar el formulario con los datos del ejemplo
        document.getElementById('nombre').value = example.nombre;
        document.getElementById('cargo').value = example.cargo;
        document.getElementById('empresa').value = example.empresa;
        document.getElementById('destinatario').value = example.destinatario;
        document.getElementById('motivo').value = example.motivo;
        document.getElementById('fechas').value = example.fechas;
        document.getElementById('tono').value = example.tono;
        document.getElementById('contacto').value = example.contacto;

        // Scroll al formulario
        document.querySelector('.form-section').scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });

        showToast('Ejemplo cargado correctamente. Puedes modificar los datos antes de generar.', 'success');
    }
}

// ==================== FUNCIONES DE ACCIONES ====================

function copyToClipboard() {
    const resultado = document.getElementById('resultado');
    const text = resultado.textContent;

    navigator.clipboard.writeText(text).then(() => {
        showToast('Carta copiada al portapapeles', 'success');
    }).catch(() => {
        // Fallback para navegadores que no soportan clipboard API
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showToast('Carta copiada al portapapeles', 'success');
    });
}

function downloadTxt() {
    const resultado = document.getElementById('resultado');
    const text = resultado.textContent;
    const filename = `carta_${currentType}_${new Date().toISOString().split('T')[0]}.txt`;

    const blob = new Blob([text], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    showToast('Carta descargada como archivo TXT', 'success');
}

function printLetter() {
    const resultado = document.getElementById('resultado');
    const printWindow = window.open('', '_blank');

    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Carta - ${currentType}</title>
            <style>
                body {
                    font-family: 'Times New Roman', serif;
                    line-height: 1.6;
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 2rem;
                    color: #333;
                }
                h1, h2, h3 {
                    color: #2c3e50;
                }
                @media print {
                    body { margin: 0; padding: 1rem; }
                }
            </style>
        </head>
        <body>
            ${resultado.innerHTML}
        </body>
        </html>
    `);

    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 250);

    showToast('Preparando carta para imprimir', 'success');
}

function regenerate() {
    if (Object.keys(currentData).length > 0) {
        generarCarta();
    } else {
        showToast('No hay datos para regenerar. Completa el formulario primero.', 'warning');
    }
}

function shareByEmail() {
    const resultado = document.getElementById('resultado');
    const text = resultado.textContent;
    const subject = `Carta de ${currentType} - RedactaFácil`;
    const body = encodeURIComponent(`Hola,\n\nTe comparto esta carta generada con RedactaFácil:\n\n${text}\n\nSaludos.`);

    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${body}`);
    showToast('Cliente de email abierto', 'success');
}

// ==================== FUNCIONES DE HISTORIAL ====================

function saveToHistory(datos, carta) {
    const historyItem = {
        id: Date.now(),
        tipo: datos.tipo,
        titulo: `${datos.tipo.charAt(0).toUpperCase() + datos.tipo.slice(1)} - ${datos.empresa}`,
        fecha: new Date().toLocaleDateString('es-ES'),
        datos: datos,
        carta: carta
    };

    letterHistory.unshift(historyItem);

    // Mantener solo los últimos 10 elementos
    if (letterHistory.length > 10) {
        letterHistory = letterHistory.slice(0, 10);
    }

    localStorage.setItem('letterHistory', JSON.stringify(letterHistory));
    updateHistoryDisplay();
}

function loadHistory() {
    const saved = localStorage.getItem('letterHistory');
    if (saved) {
        try {
            letterHistory = JSON.parse(saved);
            updateHistoryDisplay();
        } catch (error) {
            console.error('Error loading history:', error);
            letterHistory = [];
        }
    }
}

function updateHistoryDisplay() {
    const historyList = document.getElementById('historyList');

    if (letterHistory.length === 0) {
        historyList.innerHTML = '<div style="text-align: center; color: var(--text-secondary); font-size: 0.875rem; padding: 1rem;">No hay historial disponible</div>';
        return;
    }

    historyList.innerHTML = letterHistory.map(item => `
        <div class="history-item" onclick="loadFromHistory(${item.id})">
            <div class="history-item-title">${item.titulo}</div>
            <div class="history-item-date">${item.fecha}</div>
        </div>
    `).join('');
}

function loadFromHistory(id) {
    const item = letterHistory.find(h => h.id === id);
    if (!item) return;

    // Seleccionar tipo
    const templateCard = document.querySelector(`[data-type="${item.datos.tipo}"]`);
    if (templateCard) {
        templateCard.click();
    }

    // Cargar datos
    Object.keys(item.datos).forEach(key => {
        const element = document.getElementById(key);
        if (element) {
            element.value = item.datos[key];
        }
    });

    // Mostrar carta
    const resultado = document.getElementById('resultado');
    const actions = document.getElementById('resultActions');

    resultado.innerHTML = item.carta;
    resultado.classList.remove('empty');
    actions.classList.add('show');

    // Scroll al resultado
    resultado.scrollIntoView({ behavior: 'smooth', block: 'start' });

    showToast('Carta cargada desde el historial', 'success');
}

function clearHistory() {
    if (confirm('¿Estás seguro de que quieres limpiar todo el historial?')) {
        letterHistory = [];
        localStorage.removeItem('letterHistory');
        updateHistoryDisplay();
        showToast('Historial limpiado', 'success');
    }
}

// ==================== FUNCIONES DE TEMA ====================

function toggleTheme() {
    const body = document.body;
    const themeIcon = document.getElementById('theme-icon');

    if (body.getAttribute('data-theme') === 'dark') {
        body.removeAttribute('data-theme');
        themeIcon.className = 'fas fa-moon';
        localStorage.setItem('theme', 'light');
    } else {
        body.setAttribute('data-theme', 'dark');
        themeIcon.className = 'fas fa-sun';
        localStorage.setItem('theme', 'dark');
    }
}

function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    const themeIcon = document.getElementById('theme-icon');

    if (savedTheme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        themeIcon.className = 'fas fa-sun';
    } else {
        themeIcon.className = 'fas fa-moon';
    }
}

// ==================== FUNCIONES DE API ====================

async function checkApiStatus() {
    const statusElement = document.getElementById('apiStatus');

    try {
        const response = await fetch('https://redactafacil.onrender.com/api/status');
        if (response.ok) {
            statusElement.className = 'api-status online';
            statusElement.innerHTML = '<div class="api-status-indicator"></div><span>API Online</span>';
            apiOnline = true;
        } else {
            throw new Error('API not responding');
        }
    } catch (error) {
        statusElement.className = 'api-status offline';
        statusElement.innerHTML = '<div class="api-status-indicator"></div><span>API Offline</span>';
        apiOnline = false;
    }
}

// Verificar estado de la API cada 30 segundos
setInterval(checkApiStatus, 30000);

// ==================== EVENT LISTENERS ====================

// Cerrar modal al hacer clic fuera
window.onclick = function (event) {
    const modal = document.getElementById('authModal');
    if (event.target === modal) {
        closeAuthModal();
    }
}

// Atajos de teclado
document.addEventListener('keydown', function (e) {
    // Ctrl/Cmd + Enter para generar carta
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (!document.querySelector('.generate-btn').disabled) {
            generarCarta();
        }
    }

    // Escape para cerrar modal
    if (e.key === 'Escape') {
        closeAuthModal();
    }
});
async function downloadPDF() {
    const resultado = document.getElementById('resultado');
    const { jsPDF } = window.jspdf;

    if (!resultado || !resultado.textContent.trim()) {
        showToast('No hay contenido para descargar como PDF', 'warning');
        return;
    }

    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const maxLineWidth = pageWidth - margin * 2;

    // Título
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Carta Generada", pageWidth / 2, 30, { align: "center" });

    // Línea divisoria
    doc.setDrawColor(0);
    doc.line(margin, 35, pageWidth - margin, 35);

    // Texto del cuerpo
    const text = resultado.textContent.trim();
    const lines = doc.splitTextToSize(text, maxLineWidth);

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(12);

    let y = 45;

    lines.forEach(line => {
        if (y > 280) {
            doc.addPage();
            y = 20;
        }
        doc.text(line, margin, y);
        y += 7;
    });

    const nombre = currentData?.nombre?.replace(/\s+/g, '-') || 'documento';
    const tipo = currentType || 'carta';
    doc.save(`carta-${tipo}-${nombre}.pdf`);
}
// Auto-resize para textarea
document.getElementById('motivo').addEventListener('input', function () {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 300) + 'px';
});
// Variables globales

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    loadUserFromStorage();
    initializeTemplates();
    initializeForm();
    loadTheme();
    addFormValidation();
    checkApiStatus();
    loadHistory();
    initializeEditableResult();
    initializeMercadoPago();
});

// Inicializar Mercado Pago
function initializeMercadoPago() {
    // Configurar el botón de pago
    const payButton = document.getElementById('pagar');
    if (payButton) {
        payButton.className = 'nav-auth-btn';
        payButton.innerHTML = '<i class="fas fa-crown"></i> Actualizar a Premium';
        payButton.addEventListener('click', iniciarPagoPremium);
    }
}

// Función para iniciar el proceso de pago
async function iniciarPagoPremium() {
    if (!authToken) {
        showToast('Debes iniciar sesión para actualizar a Premium', 'warning');
        showAuthModal('login');
        return;
    }

    try {
        showToast('Iniciando proceso de pago...', 'info');
        
        const response = await fetch('https://redactafacil.onrender.com/api/crear-preferencia-premium', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Error al crear preferencia de pago');
        }
        
        // Inicializar Mercado Pago SDK
        const mp = new MercadoPago('APP_USR-70e73a4b-4ada-48b5-a204-eeef10e3dc30', {
            locale: 'es-UY' // Cambia según tu país
        });
        
        // Abrir checkout de Mercado Pago
        mp.checkout({
            preference: {
                id: data.id
            },
            autoOpen: true // Abrir automáticamente el checkout
        });
        
        // Iniciar polling para verificar estado del pago
        iniciarVerificacionPago();
        
    } catch (error) {
        console.error('Error al iniciar pago:', error);
        showToast('Error al iniciar el proceso de pago', 'error');
    }
}

// Función para verificar estado del pago mediante polling
function iniciarVerificacionPago() {
    if (!currentUser || !authToken) return;
    
    const userId = currentUser._id;
    const checkInterval = setInterval(async () => {
        try {
            const response = await fetch(`https://redactafacil.onrender.com/api/verificar-pago/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Error al verificar pago');
            }
            
            const data = await response.json();
            
            if (data.isPremium) {
                clearInterval(checkInterval);
                
                // Actualizar datos del usuario
                currentUser.isPremium = true;
                currentUser.usage.monthlyCount = 0;
                currentUser.usage.monthlyLimit = 100;
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                
                // Actualizar interfaz
                updateUserInterface();
                showToast('¡Felicidades! Tu cuenta ha sido actualizada a Premium 👑', 'success');
            }
        } catch (error) {
            console.error('Error al verificar pago:', error);
            clearInterval(checkInterval);
        }
    }, 5000); // Verificar cada 5 segundos
    
    // Detener el polling después de 5 minutos
    setTimeout(() => {
        clearInterval(checkInterval);
    }, 5 * 60 * 1000);
}

// ==================== FUNCIONES DE AUTENTICACIÓN ====================

function showAuthModal(type = 'login') {
    const modal = document.getElementById('authModal');
    modal.style.display = 'block';
    
    if (type === 'login') {
        showLoginForm();
    } else {
        showRegisterForm();
    }
}

function closeAuthModal() {
    const modal = document.getElementById('authModal');
    modal.style.display = 'none';
}

function showLoginForm() {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('registerForm').style.display = 'none';
}

function showRegisterForm() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
}

async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const btn = document.getElementById('loginBtn');
    
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Iniciando sesión...';
    
    try {
        const response = await fetch('https://redactafacil.onrender.com/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            authToken = data.token;
            currentUser = data.user;
            
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            updateUserInterface();
            closeAuthModal();
            showToast('¡Bienvenido de vuelta! 🎉', 'success');
        } else {
            showToast(data.error || 'Error al iniciar sesión', 'error');
        }
    } catch (error) {
        console.error('Error en login:', error);
        showToast('Error de conexión. Intenta nuevamente.', 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Iniciar Sesión';
    }
}

async function handleRegister(event) {
    event.preventDefault();
    
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const btn = document.getElementById('registerBtn');
    
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creando cuenta...';
    
    try {
        const response = await fetch('https://redactafacil.onrender.com/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            authToken = data.token;
            currentUser = data.user;
            
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            updateUserInterface();
            closeAuthModal();
            showToast('¡Cuenta creada exitosamente! Bienvenido a RedactaFácil 🚀', 'success');
        } else {
            showToast(data.error || 'Error al crear la cuenta', 'error');
        }
    } catch (error) {
        console.error('Error en registro:', error);
        showToast('Error de conexión. Intenta nuevamente.', 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-user-plus"></i> Crear Cuenta';
    }
}

function logout() {
    authToken = null;
    currentUser = null;
    
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    
    updateUserInterface();
    showToast('Sesión cerrada correctamente', 'success');
}

function updateUserInterface() {
    const guestActions = document.getElementById('guestActions');
    const userActions = document.getElementById('userActions');
    
    if (currentUser) {
        guestActions.style.display = 'none';
        userActions.style.display = 'flex';
        
        // Actualizar información del usuario
        const userAvatar = document.getElementById('userAvatar');
        const userName = document.getElementById('userName');
        const userPlan = document.getElementById('userPlan');
        
        userAvatar.textContent = currentUser.name.charAt(0).toUpperCase();
        userName.textContent = currentUser.name;
        userPlan.innerHTML = currentUser.isPremium ? 
            '<span class="premium-badge">Premium</span>' : 
            'Plan Básico';
        
        // Mostrar indicador de uso
        updateUsageIndicator();
    } else {
        guestActions.style.display = 'flex';
        userActions.style.display = 'none';
        
        // Eliminar indicador de uso si existe
        const usageIndicator = document.getElementById('usageIndicator');
        if (usageIndicator) {
            usageIndicator.remove();
        }
    }
}

function updateUsageIndicator() {
    if (!currentUser) return;
    
    // Crear o actualizar indicador de uso
    let usageIndicator = document.getElementById('usageIndicator');
    if (!usageIndicator) {
        usageIndicator = document.createElement('div');
        usageIndicator.id = 'usageIndicator';
        usageIndicator.className = 'usage-indicator';
        
        const formSection = document.querySelector('.form-section');
        formSection.insertBefore(usageIndicator, formSection.firstChild);
    }
    
    const limit = currentUser.isPremium ? 100 : 3;
    const used = currentUser.isPremium ? currentUser.usage.monthlyCount : currentUser.usage.weeklyCount;
    const period = currentUser.isPremium ? 'mensual' : 'semanal';
    const percentage = (used / limit) * 100;
    
    let fillClass = '';
    if (percentage >= 90) fillClass = 'danger';
    else if (percentage >= 70) fillClass = 'warning';
    
    usageIndicator.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
            <span style="font-weight: 600; color: var(--text-primary);">
                <i class="fas fa-chart-bar"></i> Uso ${period}
            </span>
            ${!currentUser.isPremium ? `<button class="upgrade-btn" onclick="upgradeToPremium()">
                <i class="fas fa-crown"></i> Actualizar a Premium
            </button>` : ''}
        </div>
        <div style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 0.5rem;">
            ${used} de ${limit} generaciones utilizadas
        </div>
        <div class="usage-bar">
            <div class="usage-fill ${fillClass}" style="width: ${percentage}%"></div>
        </div>
    `;
}

// Reemplazar la función upgradeToPremium existente
function upgradeToPremium() {
    iniciarPagoPremium();
}

function loadUserFromStorage() {
    const savedToken = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('currentUser');
    
    if (savedToken && savedUser) {
        try {
            authToken = savedToken;
            currentUser = JSON.parse(savedUser);
            updateUserInterface();
        } catch (error) {
            console.error('Error loading user from storage:', error);
            localStorage.removeItem('authToken');
            localStorage.removeItem('currentUser');
        }
    }
}

// Inicializar el resultado editable
function initializeEditableResult() {
    const resultado = document.getElementById('resultado');
    if (resultado) {
        resultado.addEventListener('focus', function() {
            if (this.classList.contains('empty')) {
                this.innerHTML = '';
                this.classList.remove('empty');
            }
        });
    }
}

// ==================== FUNCIONES PRINCIPALES ====================

function initializeTemplates() {
    const templateCards = document.querySelectorAll('.template-card');
    
    templateCards.forEach(card => {
        card.addEventListener('click', function() {
            // Remover clase active de todas las tarjetas
            templateCards.forEach(c => c.classList.remove('active'));
            
            // Agregar clase active a la tarjeta seleccionada
            this.classList.add('active');
            
            // Actualizar tipo actual
            currentType = this.dataset.type;
            
            // Actualizar placeholder del motivo según el tipo
            updateMotivoPlaceholder();
            
            // Limpiar formulario
            clearForm();
        });
    });
}

// El resto del código se mantiene igual...
// (Incluir el resto de las funciones del archivo script.js original)

// Función para descargar PDF
async function downloadPDF() {
    const resultado = document.getElementById('resultado');
    const { jsPDF } = window.jspdf;

    if (!resultado || !resultado.textContent.trim()) {
        showToast('No hay contenido para descargar como PDF', 'warning');
        return;
    }

    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const maxLineWidth = pageWidth - margin * 2;

    // Título
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Carta Generada", pageWidth / 2, 30, { align: "center" });

    // Línea divisoria
    doc.setDrawColor(0);
    doc.line(margin, 35, pageWidth - margin, 35);

    // Texto del cuerpo
    const text = resultado.textContent.trim();
    const lines = doc.splitTextToSize(text, maxLineWidth);

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(12);

    let y = 45;

    lines.forEach(line => {
        if (y > 280) {
            doc.addPage();
            y = 20;
        }
        doc.text(line, margin, y);
        y += 7;
    });

    const nombre = currentData?.nombre?.replace(/\s+/g, '-') || 'documento';
    const tipo = currentType || 'carta';
    doc.save(`carta-${tipo}-${nombre}.pdf`);
    
    showToast('PDF descargado correctamente', 'success');
}