# Simulador de Votacion 2026

Simulador educativo de votacion para las Elecciones Generales de Peru 2026. Permite practicar el voto en las 5 categorias del nuevo sistema bicameral: Presidente, Senadores Nacionales, Senadores Regionales, Diputados y Parlamento Andino.

Incluye alertas sobre antecedentes judiciales y votos a favor de leyes pro-crimen de cada candidato, con datos oficiales del JNE.

**Demo:** Desplegado en GitHub Pages

## Stack

- **React 19** + **Vite 7** - Framework y bundler
- **Tailwind CSS 3** - Estilos
- **GitHub Actions** - CI/CD a GitHub Pages

## Inicio rapido

```bash
# Clonar el repositorio
git clone https://github.com/TU_USUARIO/simulador-votacion.git
cd simulador-votacion

# Instalar dependencias
npm install

# Iniciar en modo desarrollo
npm run dev

# Build de produccion
npm run build

# Lint
npm run lint
```

## Estructura del proyecto

```
src/
  components/          # Componentes React
    App.jsx            # Componente principal
    CedulaSufragio.jsx # Interfaz de la cedula de votacion
    ResumenVoto.jsx    # Panel de resumen del voto
    Candidatos.jsx     # Vista de candidatos por partido
    GuiaBicameralidad.jsx # Guia de uso y selector de region
    JudicialAlert.jsx  # Alertas de antecedentes judiciales
    ProCrimeAlert.jsx  # Alertas de votos pro-crimen
  data/
    constants.js       # Constantes y utilidades compartidas
    candidatos.js      # Candidatos presidenciales y partidos
    diputados/         # Datos de diputados por region (27 regiones)
    senadoresRegional/ # Datos de senadores regionales (27 regiones)
    *-enriched/        # Datos enriquecidos con antecedentes del JNE
scripts/               # Scripts de extraccion de datos del JNE
.github/workflows/     # CI/CD para GitHub Pages
```

## Fuentes de datos

Todos los datos de candidatos provienen del [JNE - Voto Informado](https://votoinformado.jne.gob.pe). Los scripts en `scripts/` se usaron para extraer y enriquecer los datos.

## Contribuir

Lee [CONTRIBUTING.md](CONTRIBUTING.md) para conocer el proceso de contribucion.
