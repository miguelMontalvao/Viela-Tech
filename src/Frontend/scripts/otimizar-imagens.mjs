/**
 * Gera as imagens do site em AVIF e WebP, em vários tamanhos, para o srcset.
 *
 *   npm run imagens
 *
 * Entrada:
 *  - fotos-originais/*.{jpg,jpeg,png,webp}  (fotos da equipe; ficam fora do git)
 *  - recortes definidos em RECORTES (ex.: o morro ao pôr do sol da arte da logo)
 * Saída: public/img/<nome>-<largura>.{avif,webp} + src/data/imagens.json (dimensões e cor média)
 */
import { readdir, mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ORIGEM = path.join(RAIZ, 'fotos-originais');
const DESTINO = path.join(RAIZ, 'public', 'img');
const LARGURAS = [400, 640, 960, 1280, 1600, 2400];

/** Recortes de imagens que já estão no repositório. */
const RECORTES = [
  // A arte da logo tem texto do lado esquerdo; os recortes pegam só a parte da foto.
  {
    nome: 'morro-casas',
    arquivo: path.join(RAIZ, 'src', 'assets', 'brand', 'original', 'logo-vielatech.png'),
    extrair: { left: 1000, top: 545, width: 672, height: 396 },
  },
  {
    nome: 'morro-cristo',
    arquivo: path.join(RAIZ, 'src', 'assets', 'brand', 'original', 'logo-vielatech.png'),
    extrair: { left: 1300, top: 0, width: 372, height: 600 },
  },
];

async function processar(nome, entrada) {
  // Materializa o recorte/rotação antes de medir: metadata() leria o arquivo original.
  const buffer = await entrada.png().toBuffer();
  const pipelineBase = sharp(buffer);
  const meta = await pipelineBase.clone().metadata();
  const { dominant } = await pipelineBase.clone().stats();
  const larguraOriginal = meta.width;
  const larguras = LARGURAS.filter((w) => w < larguraOriginal);
  if (larguraOriginal <= LARGURAS.at(-1)) larguras.push(larguraOriginal);

  for (const w of larguras) {
    const base = pipelineBase.clone().resize({ width: w });
    await base.clone().avif({ quality: 52, effort: 6 }).toFile(path.join(DESTINO, `${nome}-${w}.avif`));
    await base.clone().webp({ quality: 74, effort: 6 }).toFile(path.join(DESTINO, `${nome}-${w}.webp`));
  }
  const cor = `#${[dominant.r, dominant.g, dominant.b].map((c) => c.toString(16).padStart(2, '0')).join('')}`;
  console.log(`✓ ${nome}: ${larguras.join(', ')} px`);
  return { larguras, largura: larguraOriginal, altura: meta.height, cor };
}

async function main() {
  await mkdir(DESTINO, { recursive: true });
  const manifesto = {};

  for (const r of RECORTES) {
    if (!existsSync(r.arquivo)) continue;
    manifesto[r.nome] = await processar(r.nome, sharp(r.arquivo).extract(r.extrair).rotate());
  }

  if (existsSync(ORIGEM)) {
    for (const arquivo of await readdir(ORIGEM)) {
      if (!/\.(jpe?g|png|webp)$/i.test(arquivo)) continue;
      const nome = arquivo.replace(/\.[^.]+$/, '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-');
      manifesto[nome] = await processar(nome, sharp(path.join(ORIGEM, arquivo)).rotate());
    }
  }

  await writeFile(path.join(RAIZ, 'src', 'data', 'imagens.json'), `${JSON.stringify(manifesto, null, 2)}\n`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
