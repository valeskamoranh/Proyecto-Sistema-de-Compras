class DetalleRecepcion {
    constructor(id_detalle_rep, id_recepcion, id_producto, cantidad_recibida) {
        this.id_detalle_rep = id_detalle_rep; // PK
        this.id_recepcion = id_recepcion;     // FK
        this.id_producto = id_producto;       // FK
        this.cantidad_recibida = cantidad_recibida;
    }
}

class Recepcion {
    constructor(id_recepcion, id_oc, fecha_recepcion, observaciones, estado_recepcion) {
        this.id_recepcion = id_recepcion; // PK
        this.id_oc = id_oc;               // FK
        this.fecha_recepcion = fecha_recepcion;
        this.observaciones = observaciones;
        this.estado_recepcion = estado_recepcion; 
        this.detalles = [];
    }

    agregarDetalle(detalle) {
        if (detalle instanceof DetalleRecepcion) {
            this.detalles.push(detalle);
        } else {
            console.error("Error: Intentaste agregar un objeto que no es un DetalleRecepcion.");
        }
    }
}

module.exports = { Recepcion, DetalleRecepcion };