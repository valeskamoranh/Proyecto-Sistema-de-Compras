const express = require('express');
const cors = require('cors');
const path = require('path');

// Importamos la conexión para que se active al iniciar
require('./src/config/db'); 

const app = express();
const PORT = 3000; 

// --- MIDDLEWARES (Configuraciones previas) ---
app.use(cors());                 
app.use(express.json());         
app.use(express.urlencoded({ extended: true })); 

// --- ARCHIVOS ESTÁTICOS ---
app.use(express.static(path.join(__dirname, 'public')));

// --- RUTAS DE PRUEBA ---
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 1. IMPORTAR
const areaRoutes = require('./src/routes/areaRoutes'); 
const usuarioRoutes = require('./src/routes/usuarioRoutes');
const productoRoutes = require('./src/routes/productoRoutes');
const proveedorRoutes = require('./src/routes/proveedorRoutes');
const requisicionRoutes = require('./src/routes/requisicionRoutes');
const cotizacionRoutes = require('./src/routes/cotizacionRoutes');
const ordenRoutes = require('./src/routes/ordenRoutes');
const recepcionRoutes = require('./src/routes/recepcionRoutes');
const reportesRoutes = require('./src/routes/reportesRoutes');


// 2. CONECTAR
app.use('/api/areas', areaRoutes); 
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/proveedores', proveedorRoutes);
app.use('/api/requisiciones', requisicionRoutes);
app.use('/api/cotizaciones', cotizacionRoutes);
app.use('/api/ordenes', ordenRoutes);
app.use('/api/recepciones', recepcionRoutes);
app.use('/api/reportes', reportesRoutes);


// --- INICIAR SERVIDOR ---
app.listen(PORT, () => {
    console.log(`Servidor corriendo en: http://localhost:${PORT}`);
    console.log(`Sirviendo archivos desde: ${path.join(__dirname, 'public')}`);
});

// Captura errores de promesas no manejadas (como fallos de conexión a DB)
process.on('unhandledRejection', (reason, promise) => {
    console.error('⚠️ Error no manejado en promesa:', reason);
});

// Captura errores fatales del sistema
process.on('uncaughtException', (err) => {
    console.error('❌ Error fatal detectado:', err.message);
});
