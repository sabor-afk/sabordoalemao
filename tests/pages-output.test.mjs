// Testa exatamente o conteudo estatico publicado no Cloudflare Pages.
import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const dir='dist';
const expected=['index.html','formulario-sabor-do-alemao.html','404.html','robots.txt','sitemap.xml','_headers','css','js','img','data'];
const forbidden=['GUIA-CLOUDFLARE-PAGES.md','PLANO-SITE-CORPORATIVO-CLOUDFLARE.md','REGRAS-SISTEMA-A-B-WTTI.md','FLUXOS-PEDIDOS-SITE-B2B.md','TESTAR-SITE.cmd','servidor-local.ps1','netlify.toml','tests','tools','.github','.gitignore'];

test('build generates only public files, never internal planning or tooling',()=>{
  execFileSync(process.execPath,['tools/build-pages.mjs'],{stdio:'pipe'});
  assert.deepEqual(readdirSync(dir).sort(),expected.sort());
  for(const name of expected) assert.ok(existsSync(join(dir,name)),name+' missing');
  for(const name of forbidden) assert.ok(!existsSync(join(dir,name)),name+' leaked');
});

test('output preserves interactive site assets and robots/sitemap',()=>{
  const html=readFileSync(join(dir,'index.html'),'utf8');
  assert.match(html,/<section class="hero hero-premium"/);
  assert.match(html,/id="storyGallery"/);
  assert.match(html,/id="produtosGrid"/);
  assert.match(html,/js\/showcase\.js/);
  const paths=[
    ...html.matchAll(/(?:src|href)="((?:img|css|js|data)\/[^"]+)"/g)
  ].map(m=>m[1]);
  for(const p of paths)assert.ok(existsSync(join(dir,p)),p+' absent from deployment');
  assert.ok(existsSync(join(dir,'data','produtos.json')));
  assert.match(readFileSync(join(dir,'robots.txt'),'utf8'),/sitemap\.xml/);
  assert.match(readFileSync(join(dir,'_headers'),'utf8'),/Content-Security-Policy/);
});
