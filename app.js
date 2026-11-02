// Manejo de Vistas (SPA Router)
const views = document.querySelectorAll('.view');
const validViews = new Set(["view-login", "view-register", "view-error"]);

function navigateTo(viewId) {
    if (!validViews.has(viewId)) return;
    views.forEach(view => {
        if (view.id === viewId) {
            view.classList.remove('hidden');
        } else {
            view.classList.add('hidden');
        }
    });
}

// Eventos Fase 1
document.querySelector("#login-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const username = formData.get("username").trim();
    const password = formData.get("password").trim();

    // Simulación básica de error si están vacíos o es admin/admin
    if (!username || !password || (username === "admin" && password !== "1234")) {
        navigateTo("view-error");
        return;
    }

    // Por ahora (Fase 1), si el login es exitoso simplemente recargamos el form
    e.target.reset();
    alert(`Ingreso exitoso simulado para: ${username}`);
});

document.querySelector("#register-form").addEventListener("submit", (e) => {
    e.preventDefault();
    e.target.reset();
    alert("Cuenta creada. Ya puedes ingresar.");
    navigateTo("view-login");
});

document.querySelector("#go-register").addEventListener("click", () => navigateTo("view-register"));
document.querySelector("#back-login").addEventListener("click", () => navigateTo("view-login"));
document.querySelector("#accept-error").addEventListener("click", () => navigateTo("view-login"));
document.querySelector("#recover-link").addEventListener("click", (e) => {
    e.preventDefault();
    alert("Contacta al administrador para restablecer tu contraseña.");
});