import inquirer from 'inquirer';
import _ from 'lodash';
import chalk from 'chalk';
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
    console.log(chalk.yellow('⚠️ La descripción no puede estar vacía.'));
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

  console.log(chalk.green('✅ Tarea agregada.'));
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
    console.log(chalk.red('📭 No hay tareas registradas.'));
    return;
  }

  // Ordenar: primero tareas no completadas, luego completadas, y por descripción
  const ordenadas = _.orderBy(tareas, ['completada', 'descripcion'], ['asc', 'asc']);

  console.log(chalk.gray('\n📋 Lista de tareas:'));

  // Mostrar cada tarea con su índice y estado
  ordenadas.forEach((tarea, i) => {
    const estado = tarea.completada ? '✅' : '❌';
    console.log(chalk.blue(`${i + 1}. [${estado}] ${tarea.descripcion}`));
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
    console.log(chalk.yellow('⚠️ No hay tareas para editar.'));
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
    console.log(chalk.yellow('⚠️ La descripción no puede estar vacía.'));
    return;
  }

  // Actualizar tarea seleccionada
  tareas[indice].descripcion = nuevaDescripcion.trim();

  // Guardar tareas con la modificación
  guardarTareas(tareas);

  console.log(chalk.green('✏️ Tarea actualizada.'));
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
    console.log(chalk.yellow('⚠️ No hay tareas para eliminar.'));
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
    console.log(chalk.red('❌ Operación cancelada.'));
    return;
  }

  // Eliminar la tarea seleccionada
  tareas.splice(indice, 1);

  // Guardar lista actualizada
  guardarTareas(tareas);

 console.log(chalk.brown('🗑️ Tarea eliminada.'));
}

/**
 * Marca una o varias tareas como completadas.
 * - Muestra solo tareas pendientes.
 * - Permite selección múltiple.
 * - Actualiza estado y guarda en archivo.
 */
export async function completarTarea() {
  const tareas = leerTareas();

  // Filtrar solo tareas pendientes (no completadas)
  const pendientes = tareas.filter(t => !t.completada);

  // Si no hay tareas pendientes, salir
  if (_.isEmpty(pendientes)) {
    console.log(chalk.green('🎉 No hay tareas pendientes. ¡Buen trabajo!'));
    return;
  }

  // Mostrar lista de pendientes para seleccionar múltiples
  const { indicesSeleccionados } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'indicesSeleccionados',
      message: 'Selecciona las tareas que ya completaste:',
      choices: pendientes.map((tarea, index) => ({
        name: tarea.descripcion,
        value: tarea.id // usamos ID para asegurar unicidad
      }))
    }
  ]);

  // Si no se selecciona ninguna, salir
  if (_.isEmpty(indicesSeleccionados)) {
    console.log(chalk.orange('🔄 No seleccionaste ninguna tarea.'));
    return;
  }

  // Actualizar estado a 'completada: true' en las seleccionadas
  const tareasActualizadas = tareas.map(t => {
    if (indicesSeleccionados.includes(t.id)) {
      return { ...t, completada: true };
    }
    return t;
  });

  // Guardar tareas actualizadas
  guardarTareas(tareasActualizadas);

  console.log(chalk.green('✅ Tareas marcadas como completadas.'));
}

