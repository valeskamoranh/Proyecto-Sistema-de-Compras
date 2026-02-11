const usuarioQueries = require('../consultas/usuarioQueries');
const Usuario = require('../modelo/Usuario');

const usuarioController = {};

// REGISTRAR USUARIO
usuarioController.crearUsuario = async (req, res) => {
    try {
        const { id_usuario, nombre, email, cargo, id_area } = req.body;

        if (!id_usuario || !nombre || !email || !id_area) {
            return res.status(400).json({ mensaje: "Faltan datos obligatorios" });
        }

        const nuevoUsuario = new Usuario(id_usuario, nombre, cargo, email, id_area);

        await usuarioQueries.insertar(nuevoUsuario);
        res.json({ mensaje: "¡Usuario registrado exitosamente!" });

    } catch (error) {
        console.error(error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ mensaje: "El usuario (cédula) o correo ya existe." });
        }
        res.status(500).json({ mensaje: "Error al registrar el usuario." });
    }
};

// LISTAR 
usuarioController.listar = async (req, res) => {
    try {
        const [usuarios] = await usuarioQueries.obtenerTodos();
        res.json(usuarios);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Error del servidor" });
    }
};

// ACTUALIZAR
usuarioController.actualizar = async (req, res) => {
    const { id } = req.params;
    const { id_area, nombre, cargo, email } = req.body;
    try {
        const usuarioEditado = new Usuario(id, nombre, cargo, email, id_area);

        await usuarioQueries.actualizar(usuarioEditado);
        res.status(200).json({ mensaje: "Usuario actualizado correctamente" });
    } catch (error) {
        res.status(500).json({ mensaje: "Error al actualizar usuario" });
    }
};

// ELIMINAR
usuarioController.eliminar = async (req, res) => {
    const { id } = req.params;
    try {
        await usuarioQueries.eliminar(id);
        res.status(200).json({ mensaje: "Usuario eliminado correctamente" });
    } catch (error) {
        res.status(500).json({ mensaje: "No se puede eliminar (posiblemente tenga registros asociados)" });
    }
};

// LOGIN
usuarioController.login = async (req, res) => {
    try {
        const { cedula } = req.body;
        const [usuarios] = await usuarioQueries.buscarPorId(cedula);

        if (usuarios.length > 0) {
            res.json({ exito: true, mensaje: "Bienvenido", usuario: usuarios[0] });
        } else {
            res.status(401).json({ exito: false, mensaje: "Esta cédula no está registrada." });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Error en el servidor" });
    }
};

module.exports = usuarioController;