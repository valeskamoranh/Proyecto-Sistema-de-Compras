class DetalleOrdenCompra {
    constructor(id_detalle_oc, id_oc, id_producto, cantidad, precio_unitario) {
        this.id_detalle_oc = id_detalle_oc; // PK
        this.id_oc = id_oc;                 // FK
        this.id_producto = id_producto;     // FK
        this.cantidad = cantidad;
        this.precio_unitario = precio_unitario;
    }
}

class OrdenCompra {
    constructor(id_oc, id_cotizacion, fecha_emision, estado_OC, monto_total_OC, cantidad_items, total_unidades) {
        this.id_oc = id_oc;                 // PK
        this.id_cotizacion = id_cotizacion; // FK
        this.fecha_emision = fecha_emision;
        this.estado_OC = estado_OC;
        this.monto_total_OC = monto_total_OC;
        this.cantidad_items = cantidad_items;
        this.total_unidades = total_unidades;
        this.detalles = [];
    }

    agregarDetalle(detalle) {
        if (detalle instanceof DetalleOrdenCompra) {
            this.detalles.push(detalle);
        } else {
            console.error("Error: Intentaste agregar un objeto que no es un DetalleOrdenCompra.");
        }
    }
}

module.exports = { OrdenCompra, DetalleOrdenCompra };