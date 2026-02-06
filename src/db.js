const mysql = require('mysql2');

// 1. Configuración de la conexión
const pool = mysql.createPool({
    host: 'localhost',      
    user: 'root',           
    password: '',           
    database: 'sistema_compras_db', 
    waitForConnections: true,
    connectionLimit: 10,    
    queueLimit: 0
});

// 2. Convertimos a promesas para poder usar async/await 
const promisePool = pool.promise();

// 3. Prueba de conexión 
pool.getConnection((err, connection) => {
    if (err) {
        console.error(' Error conectando a la Base de Datos:', err.code);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.error('   -> La conexión con la base de datos se cerró.');
        }
        if (err.code === 'ER_CON_COUNT_ERROR') {
            console.error('   -> La base de datos tiene muchas conexiones.');
        }
        if (err.code === 'ECONNREFUSED') {
            console.error('   -> Conexión rechazada. Verifica si MySQL está prendido.');
        }
        if (err.code === 'ER_BAD_DB_ERROR') {
            console.error('   -> La base de datos no existe. ¿Ejecutaste el script SQL?');
        }
    }
    if (connection) {
        console.log('¡Conexión exitosa a MySQL! Base de Datos: sistema_compras_db');
        connection.release();
    }
});

module.exports = promisePool;