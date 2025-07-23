import mostrarMenu from './utils/menu.js';
import {
  listarTareas,
  agregarTarea,
  editarTarea,
  eliminarTarea,
  completarTarea // ✅ nueva función importada
} from './controllers/tareasController.js';

/**
 * Función principal que ejecuta el ciclo de interacción CLI.
 * - Muestra el menú en un bucle.
 * - Ejecuta la opción elegida por el usuario.
 */
async function main() {
  let salir = false;

  while (!salir) {
    const opcion = await mostrarMenu();

    switch (opcion) {
      case '1':
        await agregarTarea();
        break;

      case '2':
        listarTareas();
        break;

      case '3':
        await editarTarea();
        break;

      case '4':
        await eliminarTarea();
        break;

      case '5':
        await completarTarea(); // ✅ ejecución de nueva opción
        break;

      case '6':
        salir = true;
        console.log('👋 ¡Hasta pronto!');
        break;
    }
  }
}

main();