import inquirer from 'inquirer';

/**
 * Muestra el menú principal al usuario y retorna la opción seleccionada.
 * - Usa inquirer con tipo "list"
 * - Retorna el valor asociado (string)
 */
export default async function mostrarMenu() {
  const { opcion } = await inquirer.prompt([
    {
      type: 'list',
      name: 'opcion',
      message: 'Selecciona una opción:',
      choices: [
        { name: '1. Agregar tarea', value: '1' },
        { name: '2. Listar tareas', value: '2' },
        { name: '3. Editar tarea', value: '3' },
        { name: '4. Eliminar tarea', value: '4' },
        { name: '5. Marcar tareas como completadas', value: '5' },
        { name: '6. Salir', value: '6' }
      ]
    }
  ]);

  return opcion;
}