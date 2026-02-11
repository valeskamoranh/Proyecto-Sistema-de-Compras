class DetalleRequisicion {
    constructor(id_detalle_req, id_requisicion, id_producto, cantidad, unidad_medida) {
        this.id_detalle_req = id_detalle_req; // PK
        this.id_requisicion = id_requisicion; // FK
        this.id_producto = id_producto;       // FK
        this.cantidad = cantidad;
        this.unidad_medida = unidad_medida;
    }
}

class Requisicion {
    constructor(id_requisicion, id_usuario, fecha, estado, justificacion) {
        this.id_requisicion = id_requisicion; // PK
        this.id_usuario = id_usuario;         // FK
        this.fecha = fecha;
        this.estado = estado;
        this.justificacion = justificacion;
        this.detalles = [];
    }

    agregarDetalle(detalle) {
        if (detalle instanceof DetalleRequisicion) {
            this.detalles.push(detalle);
        } else {
            console.error("El objeto no es un Detalle de Requisición válido");
        }
    }
}

module.exports = { Requisicion, DetalleRequisicion };