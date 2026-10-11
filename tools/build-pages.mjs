// Cloudflare Pages: copia somente arquivos publicos para dist/.
// Executar: node tools/build-pages.mjs
// Sem bibliotecas externas e sem alterar a origem do site.
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, lstatSync } from 'node:fs';
import { join, resolve, sep } from 'node:path';

const root = resolve(process.cwd());
const destination = join(root, 'dist');

const pages = [
  'index.html',
  'formulario-sabor-do-alemao.html',
  '404.html',
  'robots.txt',
  'sitemap.xml',
  '_headers'
];
const assetDirectories = ['css', 'js', 'img', 'data'];

// Protege contra caminhos fora do repositorio e links simbolicos inesperados.
function checkedPath(relative) {
  const absolute = resolve(root, relative);
  if (!absolute.startsWith(root + sep)) throw new Error('Caminho invalido: ' + relative);
  if (!existsSync(absolute)) throw new Error('Arquivo necessario nao encontrado: ' + relative);
  return absolute;
}

function copyAssets(source, target) {
  const stats = lstatSync(source, { throwIfNoEntry: true });
  if (stats.isSymbolicLink()) throw new Error('Link simbolico nao permitido: ' + source);
  if (stats.isDirectory()) {
    mkdirSync(target, { recursive: true });
    for (const entry of readdirSync(source, { withFileTypes: true })) {
      if (entry.isSymbolicLink()) throw new Error('Link simbolico nao permitido: ' + entry.name);
      copyAssets(join(source, entry.name), join(target, entry.name));
    }
  } else if (stats.isFile()) {
    cpSync(source, target);
  } else {
    throw new Error('Tipo nao permitido: ' + source);
  }
}

// Valida fontes antes de apagar/recriar a pasta de publicacao.
for (const name of [...pages, ...assetDirectories]) checkedPath(name);
rmSync(destination, { recursive: true, force: true });
mkdirSync(destination, { recursive: true });
for (const name of pages) copyAssets(checkedPath(name), join(destination, name));
for (const name of assetDirectories) copyAssets(checkedPath(name), join(destination, name));

console.log('Cloudflare Pages: dist/ criada apenas com o conteudo publico autorizado.');
console.log('Build output directory: dist');
