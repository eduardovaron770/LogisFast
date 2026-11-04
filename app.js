const validViews = new Set([
  "view-login",
  "view-register",
  "view-error",
  "view-dashboard",
  "view-assign",
  "view-tracking",
  "view-recover",
  "view-courier-deliveries",
  "view-courier-route",
  "view-courier-scan",
  "view-courier-report",
  "view-courier-profile",
])

function navigateTo(viewId) {
  if (!validViews.has(viewId)) {
    console.warn(`La vista "${viewId}" no existe.`)
    return
  }

  document.querySelectorAll(".view").forEach((view) => {
    view.classList.toggle("hidden", view.id !== viewId)
  })

  window.scrollTo({ top: 0, behavior: "smooth" })
}

function getShipments() {
  try {
    return JSON.parse(localStorage.getItem("logisfast_shipments")) || []
  } catch {
    return []
  }
}

function updateDashboard() {
  const shipmentCounter = document.getElementById("active-shipments")
  const dateLabel = document.getElementById("dashboard-date")

  shipmentCounter.textContent = String(45 + getShipments().length)
  dateLabel.textContent = new Intl.DateTimeFormat("es", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date())
}

document.getElementById("login-form").addEventListener("submit", (event) => {
  event.preventDefault()

  const formData = new FormData(event.currentTarget)
  const username = String(formData.get("username") || "").trim()
  const password = String(formData.get("password") || "").trim()

  if (!username || !password) {
    navigateTo("view-error")
    return
  }

  if (username.toLowerCase() === "admin") {
    localStorage.setItem("logisfast_session", "admin")
    updateDashboard()
    navigateTo("view-dashboard")
    return
  }

  if (username.toLowerCase() === "repartidor") {
    localStorage.setItem("logisfast_session", "repartidor")
    navigateTo("view-courier-deliveries")
    return
  }

  localStorage.setItem("logisfast_session", username)
  navigateTo("view-tracking")
})

document.getElementById("register-form").addEventListener("submit", (event) => {
  event.preventDefault()

  const formData = new FormData(event.currentTarget)
  const password = String(formData.get("password") || "")
  const passwordConfirm = String(formData.get("passwordConfirm") || "")
  const message = document.getElementById("register-message")

  if (password !== passwordConfirm) {
    message.textContent = "Las contraseñas no coinciden."
    document.getElementById("register-password-confirm").focus()
    return
  }

  const users = JSON.parse(localStorage.getItem("logisfast_users") || "[]")
  users.push({
    fullname: formData.get("fullname"),
    identity: formData.get("identity"),
    birthdate: formData.get("birthdate"),
    email: formData.get("email"),
    role: formData.get("role"),
  })
  localStorage.setItem("logisfast_users", JSON.stringify(users))
  event.currentTarget.reset()
  message.textContent = ""
  navigateTo("view-login")
})

document
  .querySelectorAll("#register-password, #register-password-confirm")
  .forEach((passwordInput) => {
    passwordInput.addEventListener("input", () => {
      document.getElementById("register-message").textContent = ""
    })
  })

document.getElementById("assign-form").addEventListener("submit", (event) => {
  event.preventDefault()

  const formData = new FormData(event.currentTarget)
  const shipments = getShipments()
  const guide = `LF-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`

  shipments.push({
    guide,
    name: formData.get("name"),
    address: formData.get("address"),
    weight: formData.get("weight"),
    courier: formData.get("courier"),
    status: "En tránsito",
  })

  localStorage.setItem("logisfast_shipments", JSON.stringify(shipments))
  event.currentTarget.reset()
  updateDashboard()
  navigateTo("view-dashboard")
})

document.getElementById("tracking-form").addEventListener("submit", (event) => {
  event.preventDefault()

  const guideInput = document.getElementById("tracking-number")
  const guide = guideInput.value.trim().toUpperCase()
  const message = document.getElementById("tracking-message")
  const result = document.getElementById("tracking-result")

  if (!guide) {
    message.textContent = "Ingresa un número de guía para realizar la búsqueda."
    result.classList.add("hidden")
    guideInput.focus()
    return
  }

  document.getElementById("result-guide").textContent = guide
  message.textContent = "Envío localizado correctamente."
  result.classList.remove("hidden")
})

document
  .getElementById("go-register")
  .addEventListener("click", () => navigateTo("view-register"))
document
  .getElementById("go-public-tracking")
  .addEventListener("click", () => navigateTo("view-tracking"))
document
  .getElementById("back-login")
  .addEventListener("click", () => navigateTo("view-login"))
document
  .getElementById("accept-error")
  .addEventListener("click", () => navigateTo("view-login"))
document
  .getElementById("new-shipment")
  .addEventListener("click", () => navigateTo("view-assign"))
document
  .getElementById("back-dashboard")
  .addEventListener("click", () => navigateTo("view-dashboard"))
document
  .getElementById("cancel-assignment")
  .addEventListener("click", () => navigateTo("view-dashboard"))
document
  .getElementById("employee-access")
  .addEventListener("click", () => navigateTo("view-login"))
document.getElementById("logout").addEventListener("click", () => {
  localStorage.removeItem("logisfast_session")
  document.getElementById("login-form").reset()
  navigateTo("view-login")
})

document.getElementById("recover-link").addEventListener("click", (event) => {
  event.preventDefault()
  navigateTo("view-recover")
})

document.getElementById("recover-back-login").addEventListener("click", () => {
  document.getElementById("recover-form").reset()
  document.getElementById("recover-message").textContent = ""
  navigateTo("view-login")
})

document.getElementById("recover-form").addEventListener("submit", (event) => {
  event.preventDefault()
  const email = new FormData(event.currentTarget).get("email")
  localStorage.setItem("logisfast_recovery_email", String(email))
  document.getElementById("recover-message").textContent =
    "Enlace enviado. Revisa tu bandeja de entrada."
})

let selectedDelivery = {
  guide: "LF-2024-08319",
  address: "Av. Central 458, Edificio Nova",
}

function getCompletedDeliveries() {
  try {
    return (
      JSON.parse(localStorage.getItem("logisfast_completed_deliveries")) || []
    )
  } catch {
    return []
  }
}

function updateCourierStats() {
  const completed = getCompletedDeliveries()
  const cards = [...document.querySelectorAll(".delivery-card")]

  cards.forEach((card) => {
    card.classList.toggle("hidden", completed.includes(card.dataset.guide))
  })

  document.getElementById("pending-count").textContent = String(
    cards.filter((card) => !completed.includes(card.dataset.guide)).length,
  )
  document.getElementById("profile-deliveries").textContent = String(
    18 + completed.length,
  )
}

document.querySelectorAll(".route-button").forEach((button) => {
  button.addEventListener("click", () => {
    const card = button.closest(".delivery-card")
    selectedDelivery = {
      guide: card.dataset.guide,
      address: card.dataset.address,
    }
    document.getElementById("route-guide").textContent = selectedDelivery.guide
    document.getElementById("route-address").textContent =
      selectedDelivery.address
    document.getElementById("report-guide").textContent = selectedDelivery.guide
    navigateTo("view-courier-route")
  })
})

document
  .getElementById("delivery-search")
  .addEventListener("input", (event) => {
    const query = event.currentTarget.value.trim().toLowerCase()
    const completed = getCompletedDeliveries()
    let visibleCards = 0

    document.querySelectorAll(".delivery-card").forEach((card) => {
      const content =
        `${card.dataset.guide} ${card.dataset.address}`.toLowerCase()
      const isVisible =
        !completed.includes(card.dataset.guide) && content.includes(query)
      card.classList.toggle("hidden", !isVisible)
      if (isVisible) visibleCards += 1
    })

    document
      .getElementById("delivery-empty")
      .classList.toggle("hidden", visibleCards !== 0)
  })

document.getElementById("confirm-delivery").addEventListener("click", () => {
  const completed = getCompletedDeliveries()
  if (!completed.includes(selectedDelivery.guide)) {
    completed.push(selectedDelivery.guide)
    localStorage.setItem(
      "logisfast_completed_deliveries",
      JSON.stringify(completed),
    )
  }
  updateCourierStats()
  navigateTo("view-courier-deliveries")
})

document.getElementById("report-problem").addEventListener("click", () => {
  document.getElementById("report-guide").textContent = selectedDelivery.guide
  navigateTo("view-courier-report")
})

document.getElementById("attach-photo").addEventListener("click", () => {
  document.getElementById("report-photo").click()
})

document.getElementById("report-photo").addEventListener("change", (event) => {
  const file = event.currentTarget.files[0]
  document.getElementById("photo-name").textContent = file
    ? `Foto seleccionada: ${file.name}`
    : "No se ha adjuntado ninguna foto."
})

document.getElementById("report-form").addEventListener("submit", (event) => {
  event.preventDefault()
  const formData = new FormData(event.currentTarget)
  const reports = JSON.parse(
    localStorage.getItem("logisfast_delivery_reports") || "[]",
  )
  reports.push({
    guide: selectedDelivery.guide,
    reason: formData.get("reason"),
    comments: formData.get("comments"),
    createdAt: new Date().toISOString(),
  })
  localStorage.setItem("logisfast_delivery_reports", JSON.stringify(reports))
  event.currentTarget.reset()
  document.getElementById("photo-name").textContent =
    "No se ha adjuntado ninguna foto."
  navigateTo("view-courier-deliveries")
})

document.getElementById("manual-entry-toggle").addEventListener("click", () => {
  const form = document.getElementById("manual-entry-form")
  form.classList.toggle("hidden")
  if (!form.classList.contains("hidden")) {
    document.getElementById("manual-guide").focus()
  }
})

document
  .getElementById("manual-entry-form")
  .addEventListener("submit", (event) => {
    event.preventDefault()
    const guideInput = document.getElementById("manual-guide")
    const guide = guideInput.value.trim().toUpperCase()
    localStorage.setItem("logisfast_last_scan", guide)
    document.getElementById("scan-message").textContent =
      `Guía ${guide} registrada correctamente.`
    event.currentTarget.reset()
  })

document.getElementById("courier-logout").addEventListener("click", () => {
  localStorage.removeItem("logisfast_session")
  document.getElementById("login-form").reset()
  navigateTo("view-login")
})

document.querySelectorAll("[data-view]").forEach((element) => {
  element.addEventListener("click", (event) => {
    event.preventDefault()
    navigateTo(element.dataset.view)
  })
})

updateDashboard()
updateCourierStats()
