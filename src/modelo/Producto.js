class Producto {
    constructor(id_producto, nombre_producto, descripcion, unidad_medida, cantidad_unidad) {
        this.id_producto = id_producto;     // PK
        this.nombre_producto = nombre_producto;
        this.descripcion = descripcion;
        this.unidad_medida = unidad_medida;
        this.cantidad_unidad = cantidad_unidad;
    }
}
module.exports = Producto;