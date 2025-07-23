import inquirer from 'inquirer';
import _ from 'lodash';
import { leerTareas, guardarTareas } from '../utils/archivo.js';

/**
 * Agrega una nueva tarea al sistema.
 * - Solicita al usuario una descripción.
 * - Valida que no esté vacía.
 * - Evita duplicados por descripción.
 * - Guarda la nueva lista en el archivo JSON.
 */
export async function agregarTarea() {
  const { descripcion } = await inquirer.prompt([
    {
      type: 'input',
      name: 'descripcion',
      message: 'Descripción de la tarea:'
    }
  ]);

  // Validar que la descripción no esté vacía o solo contenga espacios
  if (_.isEmpty(descripcion.trim())) {
    console.log('⚠️ La descripción no puede estar vacía.');
    return;
  }

  // Leer tareas actuales del archivo
  const tareas = leerTareas();

  // Crear nueva tarea con ID único (timestamp)
  const nueva = {
    id: Date.now(),
    descripcion: descripcion.trim(),
    completada: false
  };

  // Evitar duplicados por descripción (si ya existe una igual)
  const nuevasTareas = _.uniqBy([...tareas, nueva], 'descripcion');

  // Guardar en archivo
  guardarTareas(nuevasTareas);

  console.log('✅ Tarea agregada.');
}

/**
 * Lista todas las tareas ordenadas por estado (pendiente/completada) y descripción.
 * - Si no hay tareas, muestra un mensaje vacío.
 * - Ordena usando Lodash para mejor visualización.
 */
export function listarTareas() {
  const tareas = leerTareas();

  // Verificar si el archivo está vacío
  if (_.isEmpty(tareas)) {
    console.log('📭 No hay tareas registradas.');
    return;
  }

  // Ordenar: primero tareas no completadas, luego completadas, y por descripción
  const ordenadas = _.orderBy(tareas, ['completada', 'descripcion'], ['asc', 'asc']);

  console.log('\n📋 Lista de tareas:');

  // Mostrar cada tarea con su índice y estado
  ordenadas.forEach((tarea, i) => {
    const estado = tarea.completada ? '✅' : '❌';
    console.log(`${i + 1}. [${estado}] ${tarea.descripcion}`);
  });
}

/**
 * Permite al usuario editar la descripción de una tarea existente.
 * - Lista las tareas disponibles.
 * - Solicita nueva descripción.
 * - Actualiza y guarda la modificación.
 */
export async function editarTarea() {
  const tareas = leerTareas();

  // Si no hay tareas, no se puede editar
  if (_.isEmpty(tareas)) {
    console.log('⚠️ No hay tareas para editar.');
    return;
  }

  // Mostrar lista de tareas para que el usuario elija cuál editar
  const { indice } = await inquirer.prompt([
    {
      type: 'list',
      name: 'indice',
      message: 'Selecciona una tarea para editar:',
      choices: tareas.map((t, i) => ({
        name: t.descripcion,
        value: i
      }))
    }
  ]);

  // Solicitar nueva descripción
  const { nuevaDescripcion } = await inquirer.prompt([
    {
      type: 'input',
      name: 'nuevaDescripcion',
      message: 'Nueva descripción:'
    }
  ]);

  // Validar entrada
  if (_.isEmpty(nuevaDescripcion.trim())) {
    console.log('⚠️ La descripción no puede estar vacía.');
    return;
  }

  // Actualizar tarea seleccionada
  tareas[indice].descripcion = nuevaDescripcion.trim();

  // Guardar tareas con la modificación
  guardarTareas(tareas);

  console.log('✏️ Tarea actualizada.');
}

/**
 * Permite eliminar una tarea seleccionada por el usuario.
 * - Lista tareas disponibles.
 * - Solicita confirmación.
 * - Elimina y guarda los cambios.
 */
export async function eliminarTarea() {
  const tareas = leerTareas();

  // No hay tareas para eliminar
  if (_.isEmpty(tareas)) {
    console.log('⚠️ No hay tareas para eliminar.');
    return;
  }

  // Mostrar lista de tareas para elegir cuál eliminar
  const { indice } = await inquirer.prompt([
    {
      type: 'list',
      name: 'indice',
      message: 'Selecciona una tarea para eliminar:',
      choices: tareas.map((t, i) => ({
        name: t.descripcion,
        value: i
      }))
    }
  ]);

  // Confirmar antes de eliminar
  const { confirmar } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirmar',
      message: '¿Estás seguro de eliminar esta tarea?'
    }
  ]);

  // Si no confirma, cancelar operación
  if (!confirmar) {
    console.log('❌ Operación cancelada.');
    return;
  }

  // Eliminar la tarea seleccionada
  tareas.splice(indice, 1);

  // Guardar lista actualizada
  guardarTareas(tareas);

  console.log('🗑️ Tarea eliminada.');
}