import IMAGENS from '../../data/imagens.json';

/**
 * Foto responsiva em AVIF/WebP com srcset (gerada por `npm run imagens`).
 * Sempre com largura/altura declaradas (sem salto de layout) e cor de fundo enquanto carrega.
 */
export function Foto({ nome, alt, sizes = '100vw', prioridade = false, className = '', imgClassName = '' }) {
  const info = IMAGENS[nome];
  if (!info) return null;
  const srcset = (formato) => info.larguras.map((w) => `/img/${nome}-${w}.${formato} ${w}w`).join(', ');
  const maior = info.larguras.at(-1);
  return (
    <picture className={className}>
      <source type="image/avif" srcSet={srcset('avif')} sizes={sizes} />
      <source type="image/webp" srcSet={srcset('webp')} sizes={sizes} />
      <img
        src={`/img/${nome}-${maior}.webp`}
        alt={alt}
        width={info.largura}
        height={info.altura}
        loading={prioridade ? 'eager' : 'lazy'}
        decoding={prioridade ? 'sync' : 'async'}
        fetchPriority={prioridade ? 'high' : 'auto'}
        style={{ backgroundColor: info.cor }}
        className={imgClassName}
      />
    </picture>
  );
}
