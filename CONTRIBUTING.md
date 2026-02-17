# Contribuir

Gracias por tu interes en contribuir al Simulador de Votacion 2026.

## Proceso

1. **Fork** el repositorio
2. Crea una rama desde `main`: `git checkout -b mi-feature`
3. Haz tus cambios y verifica que funcionen:
   ```bash
   npm run dev    # Prueba local
   npm run build  # Verifica que compile
   npm run lint   # Sin errores de lint
   ```
4. Commit con un mensaje descriptivo
5. Abre un **Pull Request** hacia `main`

## Reglas

- No se puede hacer merge directo a `main`. Todos los cambios van por PR.
- Los PRs necesitan al menos una revision antes de mergearse.
- El build de CI debe pasar antes del merge.

## Estilo de codigo

- React funcional con hooks (no clases)
- Tailwind CSS para estilos (no CSS custom salvo excepciones)
- Constantes y utilidades compartidas van en `src/data/constants.js`
- Los datos de candidatos se procesan en la capa de datos (`src/data/`), no en los componentes

## Estructura de datos

Los candidatos se fusionan desde dos fuentes:
- **Datos originales** (archivos `.json` base): posicion en lista, partido, nombre
- **Datos enriquecidos** (`*-enriched.json`): fotos, antecedentes, estado actualizado

La funcion `fusionarDatos()` en `constants.js` se encarga del merge. Si necesitas agregar campos, hazlo ahi.

## Reportar bugs

Abre un issue describiendo:
- Que esperabas que pasara
- Que paso en realidad
- Pasos para reproducirlo
