// --- FUNCIONES VISUALES (Muestran/Ocultan rojo) ---

function mostrarError(inputId, errorId, mensaje) {
    const input = document.getElementById(inputId);
    const errorDiv = document.getElementById(errorId);

    if (input && errorDiv) {
        input.classList.add('input-error'); // Clase definida en tu CSS
        errorDiv.innerText = mensaje;
        errorDiv.style.display = 'block';
    }
}

function limpiarErrores() {
    // Quita el borde rojo de todos los inputs
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => input.classList.remove('input-error'));

    // Oculta todos los textos de error
    const mensajes = document.querySelectorAll('.error-msg');
    mensajes.forEach(msg => msg.style.display = 'none');
}

// --- FUNCIONES DE LÓGICA (Devuelven true/false) ---

// Valida si está vacío
function esVacio(valor) {
    return valor === null || valor.trim() === "";
}

// Valida si solo tiene letras (para Nombres/Apellidos)
function esSoloTexto(valor) {
    // Regex: Letras mayúsculas, minúsculas, tildes y ñ
    return /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(valor);
}

// Valida longitud mínima
function cumpleLongitudMinima(valor, min) {
    return valor.trim().length >= min;
}

// Valida formato de correo (ej: texto@texto.com)
function esEmailValido(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// Valida que solo contenga números
function esSoloNumeros(valor) {
    return /^[0-9]+$/.test(valor);
}

// Valida una longitud exacta (para la cédula de 10 dígitos)
function esLongitudExacta(valor, longitud) {
    return valor.trim().length === longitud;
}

// Valida si es un número mayor a cero (para precios, stock, etc.)
function esNumeroPositivo(valor) {
    if (valor === "" || isNaN(valor)) return false;
    return Number(valor) > 0;
}

// Valida que el texto tenga una longitud entre un mínimo y un máximo
function esLongitudRango(valor, min, max) {
    if (!valor) return false;
    const longitud = valor.trim().length;
    return longitud >= min && longitud <= max;
}