// Inicializar Mercado Pago SDK con la Public Key correcta
const mp = new MercadoPago("APP_USR-70e73a4b-4ada-48b5-a204-eeef10e3dc30", {
  locale: "es-UY", // Cambia según tu país
})

// Declaración de variables
const authToken = localStorage.getItem("authToken")
const currentUser = localStorage.getItem("currentUser") ? JSON.parse(localStorage.getItem("currentUser")) : null

// Función para mostrar notificaciones
function showToast(message, type) {
  // Remover toast existente si hay uno
  const existingToast = document.querySelector(".toast")
  if (existingToast) {
    existingToast.remove()
  }

  const toast = document.createElement("div")
  toast.className = `toast ${type}`

  const icon =
    type === "success" ? "fa-check-circle" : type === "error" ? "fa-exclamation-circle" : "fa-exclamation-triangle"

  toast.innerHTML = `
      <i class="fas ${icon}"></i>
      <span>${message}</span>
  `

  document.body.appendChild(toast)

  // Mostrar toast
  setTimeout(() => toast.classList.add("show"), 100)

  // Ocultar toast después de 4 segundos
  setTimeout(() => {
    toast.classList.remove("show")
    setTimeout(() => toast.remove(), 300)
  }, 4000)
}

// Función para mostrar modal de autenticación
function showAuthModal(type) {
  const modal = document.getElementById("authModal")
  modal.style.display = "block"

  if (type === "login") {
    document.getElementById("loginForm").style.display = "block"
    document.getElementById("registerForm").style.display = "none"
  } else {
    document.getElementById("loginForm").style.display = "none"
    document.getElementById("registerForm").style.display = "block"
  }
}

// Función para iniciar el proceso de pago
window.iniciarPagoPremium = async () => {
  // Actualizar token y usuario desde localStorage
  const authToken = localStorage.getItem("authToken")
  const currentUser = localStorage.getItem("currentUser") ? JSON.parse(localStorage.getItem("currentUser")) : null

  if (!authToken) {
    showToast("Debes iniciar sesión para actualizar a Premium", "warning")
    showAuthModal("login")
    return
  }

  try {
    showToast("Iniciando proceso de pago...", "info")

    const response = await fetch("https://redactafacil.onrender.com/api/crear-preferencia-premium", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || "Error al crear preferencia de pago")
    }

    // Abrir checkout de Mercado Pago
    window.location.href = data.init_point

    // Iniciar polling para verificar estado del pago
    iniciarVerificacionPago()
  } catch (error) {
    console.error("Error al iniciar pago:", error)
    showToast("Error al iniciar el proceso de pago", "error")
  }
}

// Función para verificar estado del pago mediante polling
function iniciarVerificacionPago() {
  const authToken = localStorage.getItem("authToken")
  const currentUser = localStorage.getItem("currentUser") ? JSON.parse(localStorage.getItem("currentUser")) : null

  if (!currentUser || !authToken) return

  const userId = currentUser.id
  const checkInterval = setInterval(async () => {
    try {
      const response = await fetch(`https://redactafacil.onrender.com/api/verificar-pago/${userId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })

      if (!response.ok) {
        throw new Error("Error al verificar pago")
      }

      const data = await response.json()

      if (data.isPremium) {
        clearInterval(checkInterval)

        // Actualizar datos del usuario
        currentUser.isPremium = true
        currentUser.usage.monthlyCount = 0
        currentUser.usage.monthlyLimit = 100
        localStorage.setItem("currentUser", JSON.stringify(currentUser))

        // Actualizar interfaz
        if (typeof updateUserInterface === "function") {
          window.updateUserInterface()
        }
        showToast("¡Felicidades! Tu cuenta ha sido actualizada a Premium 👑", "success")
      }
    } catch (error) {
      console.error("Error al verificar pago:", error)
      clearInterval(checkInterval)
    }
  }, 5000) // Verificar cada 5 segundos

  // Detener el polling después de 5 minutos
  setTimeout(
    () => {
      clearInterval(checkInterval)
    },
    5 * 60 * 1000,
  )
}

// Función para manejar el botón de pago
function handlePaymentButton() {
  const upgradeButtons = document.querySelectorAll(".upgrade-btn")
  if (upgradeButtons.length > 0) {
    upgradeButtons.forEach((button) => {
      button.addEventListener("click", window.iniciarPagoPremium)
    })
  }
}

// Modificar la función upgradeToPremium existente
function upgradeToPremium() {
  window.iniciarPagoPremium()
}

// Inicializar cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
  handlePaymentButton()

  // Verificar si venimos de una redirección de pago
  const urlParams = new URLSearchParams(window.location.search)
  const status = urlParams.get("status")

  if (status === "approved") {
    // Actualizar usuario a premium
    const currentUser = JSON.parse(localStorage.getItem("currentUser"))
    if (currentUser) {
      currentUser.isPremium = true
      currentUser.usage = {
        ...currentUser.usage,
        monthlyCount: 0,
        monthlyLimit: 100,
      }
      localStorage.setItem("currentUser", JSON.stringify(currentUser))

      // Mostrar mensaje de éxito
      setTimeout(() => {
        showToast("¡Felicidades! Tu cuenta ha sido actualizada a Premium 👑", "success")
      }, 1000)
    }
  }
})
