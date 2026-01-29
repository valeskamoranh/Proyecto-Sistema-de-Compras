class DetalleCotizacion {
    constructor(id_detalle_cot, id_cotizacion, id_producto, cantidad, precio_unitario) {
        this.id_detalle_cot = id_detalle_cot; // PK
        this.id_cotizacion = id_cotizacion;   // FK
        this.id_producto = id_producto;       // FK
        this.cantidad = cantidad;
        this.precio_unitario = precio_unitario;
    }
}

class Cotizacion {
    constructor(id_cotizacion, id_requisicion, id_proveedor, fecha_cotizacion, validez, monto_total) {
        this.id_cotizacion = id_cotizacion;     // PK
        this.id_requisicion = id_requisicion;   // FK
        this.id_proveedor = id_proveedor;       // FK
        this.fecha_cotizacion = fecha_cotizacion;
        this.validez = validez;
        this.monto_total = monto_total;
        this.detalles = [];
    }

    agregarDetalle(detalle) {
        if (detalle instanceof DetalleCotizacion) {
            this.detalles.push(detalle);
        } else {
            console.error("Error: Intentaste agregar un objeto que no es un DetalleCotizacion.");
        }
    }
}

module.exports = { Cotizacion, DetalleCotizacion };