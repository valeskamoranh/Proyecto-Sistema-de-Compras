// --- FUNCIONES VISUALES (Muestran/Ocultan rojo) ---

function mostrarError(inputId, errorId, mensaje) {
    const input = document.getElementById(inputId);
    const errorDiv = document.getElementById(errorId);

    if (input && errorDiv) {
        input.classList.add('input-error'); 
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

function esCedulaEcuatoriana(cedula) {
    // 1. Validar longitud y que sean números
    if (!cedula || cedula.length !== 10 || isNaN(cedula)) return false;

    // 2. Validar código de provincia (2 primeros dígitos: 01-24 o 30)
    const provincia = parseInt(cedula.substring(0, 2));
    if ((provincia < 1 || provincia > 24) && provincia !== 30) return false;

    // 3. Validar tercer dígito (debe ser menor a 6 para personas naturales)
    const digito3 = parseInt(cedula.substring(2, 3));
    if (digito3 >= 6) return false; 

    // 4. Algoritmo Módulo 10
    const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
    let suma = 0;

    for (let i = 0; i < 9; i++) {
        let valor = parseInt(cedula[i]) * coeficientes[i];
        if (valor >= 10) valor -= 9;
        suma += valor;
    }

    const digitoVerificador = parseInt(cedula[9]);
    // Calculamos la decena superior
    const decenaSuperior = Math.ceil(suma / 10) * 10;
    let resultado = decenaSuperior - suma;
    
    // Si el resultado es 10, el dígito verificador es 0
    if (resultado === 10) resultado = 0;

    return resultado === digitoVerificador;
}

function esRucEcuatoriano(ruc) {
    // 1. Validaciones básicas de formato
    if (!ruc || ruc.length !== 13 || isNaN(ruc)) return false;

    // 2. Validación de Provincia (2 primeros dígitos)
    const provincia = parseInt(ruc.substring(0, 2));
    if ((provincia < 1 || provincia > 24) && provincia !== 30) return false;

    // 3. Validación de los últimos dígitos (siempre deben ser 001, aunque en teoría pueden variar, lo estándar es 001)
    if (ruc.substring(10, 13) !== '001') return false;

    const tercerDigito = parseInt(ruc[2]);

    // CASO A: Persona Natural (El tercer dígito es menor a 6)
    // Se valida igual que la cédula (Módulo 10) usando los primeros 10 dígitos
    if (tercerDigito < 6) {
        return esCedulaEcuatoriana(ruc.substring(0, 10));
    }

    // CASO B: Sociedad Pública (El tercer dígito es 6)
    // Se valida con Módulo 11 usando los primeros 9 dígitos. El dígito 9 es el verificador.
    else if (tercerDigito === 6) {
        const coeficientes = [3, 2, 7, 6, 5, 4, 3, 2];
        let suma = 0;
        for (let i = 0; i < 8; i++) {
            suma += parseInt(ruc[i]) * coeficientes[i];
        }
        let residuo = suma % 11;
        let verificador = residuo === 0 ? 0 : 11 - residuo;
        
        return verificador === parseInt(ruc[8]);
    }

    // CASO C: Sociedad Privada (El tercer dígito es 9)
    // Se valida con Módulo 11 usando los primeros 10 dígitos. El dígito 10 es el verificador.
    else if (tercerDigito === 9) {
        const coeficientes = [4, 3, 2, 7, 6, 5, 4, 3, 2];
        let suma = 0;
        for (let i = 0; i < 9; i++) {
            suma += parseInt(ruc[i]) * coeficientes[i];
        }
        let residuo = suma % 11;
        let verificador = residuo === 0 ? 0 : 11 - residuo;

        return verificador === parseInt(ruc[9]);
    }

    // Si el tercer dígito no es ni <6, ni 6, ni 9, es inválido
    return false;
}

// Valida que la fecha no sea mayor a hoy (No Futuro)
function esFechaNoFutura(fecha) {
    if (!fecha) return false;

    const fechaIngresada = new Date(fecha + "T00:00:00");
    const hoy = new Date();
    
    hoy.setHours(0, 0, 0, 0);

    return fechaIngresada <= hoy;
}