import fs from 'fs';
import path from 'path';

const rutaArchivo = path.resolve('db', 'tareas.json');

export function leerTareas() {
  try {
    if (!fs.existsSync(rutaArchivo)) {
      return [];
    }
    const data = fs.readFileSync(rutaArchivo, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('❌ Error al leer tareas:', error.message);
    return [];
  }
}

export function guardarTareas(tareas) {
  try {
    fs.writeFileSync(rutaArchivo, JSON.stringify(tareas, null, 2), 'utf8');
  } catch (error) {
    console.error('❌ Error al guardar tareas:', error.message);
  }
}