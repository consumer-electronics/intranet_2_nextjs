/**
 * src/lib/htmlEntities.js
 *
 * Utilidad de servidor para decodificar entidades HTML en cadenas de texto
 * provenientes del backend PHP / Dynamics.
 *
 * El backend legacy almacena y devuelve nombres con entidades HTML:
 *   Mario Alejandro Pe&ntilde;a Giraldo
 *   Jos&eacute; &Aacute;lvarez
 *
 * Esta función las convierte al carácter Unicode correspondiente de forma
 * eficiente y sin dependencias externas, usando únicamente APIs nativas de
 * Node.js (no requiere DOM ni jsdom).
 *
 * Uso:
 *   import { decodeHtmlEntities } from '@/lib/htmlEntities';
 *   const nombre = decodeHtmlEntities('Mario Pe&ntilde;a'); // → 'Mario Peña'
 *
 * IMPORTANTE: este módulo solo debe usarse en Route Handlers y código de
 * servidor (Node.js runtime). No importar desde componentes cliente.
 */

/**
 * Mapa de entidades HTML nombradas frecuentes en español y textos del backend.
 * Se incluyen las más comunes para nombres y apellidos colombianos.
 */
const NAMED_ENTITIES = {
  // Vocales con tilde
  aacute: 'á', eacute: 'é', iacute: 'í', oacute: 'ó', uacute: 'ú',
  Aacute: 'Á', Eacute: 'É', Iacute: 'Í', Oacute: 'Ó', Uacute: 'Ú',
  // Vocales con diéresis
  auml: 'ä', euml: 'ë', iuml: 'ï', ouml: 'ö', uuml: 'ü',
  Auml: 'Ä', Euml: 'Ë', Iuml: 'Ï', Ouml: 'Ö', Uuml: 'Ü',
  // Vocales con acento grave
  agrave: 'à', egrave: 'è', igrave: 'ì', ograve: 'ò', ugrave: 'ù',
  Agrave: 'À', Egrave: 'È', Igrave: 'Ì', Ograve: 'Ò', Ugrave: 'Ù',
  // Ñ
  ntilde: 'ñ', Ntilde: 'Ñ',
  // Caracteres especiales de puntuación y símbolos
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'",
  nbsp: '\u00A0',
  // Letras adicionales usadas en español
  ccedil: 'ç', Ccedil: 'Ç',
  // Vocales con circumflejo
  acirc: 'â', ecirc: 'ê', icirc: 'î', ocirc: 'ô', ucirc: 'û',
  Acirc: 'Â', Ecirc: 'Ê', Icirc: 'Î', Ocirc: 'Ô', Ucirc: 'Û',
};

/**
 * Decodifica entidades HTML en una cadena de texto.
 *
 * Soporta:
 *  - Entidades nombradas:  &ntilde; &aacute; &amp; &quot; etc.
 *  - Entidades decimales:  &#241;  &#039; etc.
 *  - Entidades hex:        &#xF1;  &#xf1; etc.
 *
 * @param {string} str - Cadena posiblemente con entidades HTML.
 * @returns {string} Cadena con entidades decodificadas.
 */
export function decodeHtmlEntities(str) {
  if (!str || typeof str !== 'string') return str ?? '';

  return str.replace(/&([^;]+);/g, (match, entity) => {
    // Entidad decimal: &#NNN;
    if (entity.startsWith('#x') || entity.startsWith('#X')) {
      const code = parseInt(entity.slice(2), 16);
      return isNaN(code) ? match : String.fromCodePoint(code);
    }
    if (entity.startsWith('#')) {
      const code = parseInt(entity.slice(1), 10);
      return isNaN(code) ? match : String.fromCodePoint(code);
    }
    // Entidad nombrada
    return NAMED_ENTITIES[entity] ?? match;
  });
}

/**
 * Aplica `decodeHtmlEntities` a campos de texto de un objeto.
 *
 * Solo toca las claves indicadas en `fields`; el resto del objeto
 * se devuelve sin modificar.
 *
 * @param {object} obj   - Objeto a normalizar.
 * @param {string[]} fields - Lista de claves a decodificar.
 * @returns {object} Nuevo objeto con los campos indicados decodificados.
 */
export function decodeFields(obj, fields) {
  if (!obj || typeof obj !== 'object') return obj;
  const result = { ...obj };
  for (const field of fields) {
    if (typeof result[field] === 'string') {
      result[field] = decodeHtmlEntities(result[field]);
    }
  }
  return result;
}
