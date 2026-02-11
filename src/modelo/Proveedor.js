class Proveedor {
    constructor(id_proveedor, nombre, ruc, telefono, email) {
        this.id_proveedor = id_proveedor; // PK
        this.nombre = nombre;
        this.ruc = ruc;
        this.telefono = telefono;         
        this.email = email;               
    }
}
module.exports = Proveedor;