// Inicializar Mercado Pago SDK
const mp = new MercadoPago('APP_USR-70e73a4b-4ada-48b5-a204-eeef10e3dc30', {
  locale: 'es-UY' // Cambia según tu país
});

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
    
    // Abrir checkout de Mercado Pago
    mp.checkout({
      preference: {
        id: data.id
      },
      render: {
        container: '.checkout-button', // Elemento donde se renderizará el botón (opcional)
        label: 'Pagar ahora' // Texto del botón (opcional)
      },
      theme: {
        elementsColor: '#6366f1', // Color primario de la app
        headerColor: '#6366f1' // Color del encabezado
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

// Función para manejar el botón de pago
function handlePaymentButton() {
  const payButton = document.getElementById('pagar');
  if (payButton) {
    payButton.addEventListener('click', iniciarPagoPremium);
    
    // Estilizar el botón
    payButton.className = 'nav-auth-btn';
    payButton.innerHTML = '<i class="fas fa-crown"></i> Actualizar a Premium';
  }
}

// Modificar la función upgradeToPremium existente
function upgradeToPremium() {
  iniciarPagoPremium();
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
  handlePaymentButton();
});