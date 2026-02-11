class Area {
    constructor(id_area, nombre_area, responsable) {
        this.id_area = id_area;       // PK
        this.nombre_area = nombre_area;
        this.responsable = responsable;
    }
}
module.exports = Area;