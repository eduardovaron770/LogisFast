const validViews = new Set([
  "view-login",
  "view-register",
  "view-error",
  "view-dashboard",
  "view-assign",
  "view-tracking",
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

  localStorage.setItem("logisfast_session", username)
  navigateTo("view-tracking")
})

document.getElementById("register-form").addEventListener("submit", (event) => {
  event.preventDefault()

  const formData = new FormData(event.currentTarget)
  const users = JSON.parse(localStorage.getItem("logisfast_users") || "[]")
  users.push({
    fullname: formData.get("fullname"),
    identity: formData.get("identity"),
    birthdate: formData.get("birthdate"),
    role: formData.get("role"),
  })
  localStorage.setItem("logisfast_users", JSON.stringify(users))
  event.currentTarget.reset()
  navigateTo("view-login")
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
  window.alert("Contacta al administrador para recuperar tu contraseña.")
})

document.querySelectorAll("[data-view]").forEach((element) => {
  element.addEventListener("click", (event) => {
    event.preventDefault()
    navigateTo(element.dataset.view)
  })
})

updateDashboard()