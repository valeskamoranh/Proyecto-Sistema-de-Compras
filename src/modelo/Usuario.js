class Usuario {
    constructor(id_usuario, nombre, cargo, email, id_area) {
        this.id_usuario = id_usuario; // PK
        this.nombre = nombre;
        this.cargo = cargo;
        this.email = email;
        this.id_area = id_area;       // FK hacia Area
    }
}
module.exports = Usuario;