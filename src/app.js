const express = require('express');
const cors = require('cors');
const path = require('path');

// Importamos la conexión para que se active al iniciar
require('./db'); 

const app = express();
const PORT = 3000; 

// --- MIDDLEWARES (Configuraciones previas) ---
app.use(cors());                 
app.use(express.json());         
app.use(express.urlencoded({ extended: true })); 

// --- ARCHIVOS ESTÁTICOS ---
app.use(express.static(path.join(__dirname, '../public')));

// --- RUTAS DE PRUEBA ---
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// 1. IMPORTAR
const areaRoutes = require('./routes/areaRoutes'); 
const usuarioRoutes = require('./routes/usuarioRoutes');
const productoRoutes = require('./routes/productoRoutes');
const proveedorRoutes = require('./routes/proveedorRoutes');
const requisicionRoutes = require('./routes/requisicionRoutes');
const cotizacionRoutes = require('./routes/cotizacionRoutes');
const ordenRoutes = require('./routes/ordenRoutes');
const recepcionRoutes = require('./routes/recepcionRoutes');


// 2. CONECTAR
app.use('/api/areas', areaRoutes); 
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/proveedores', proveedorRoutes);
app.use('/api/requisiciones', requisicionRoutes);
app.use('/api/cotizaciones', cotizacionRoutes);
app.use('/api/ordenes', ordenRoutes);
app.use('/api/recepciones', recepcionRoutes);


// --- INICIAR SERVIDOR ---
app.listen(PORT, () => {
    console.log(`Servidor corriendo en: http://localhost:${PORT}`);
    console.log(`Sirviendo archivos desde: ${path.join(__dirname, '../public')}`);
});