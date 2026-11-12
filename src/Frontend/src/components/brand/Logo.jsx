import { useId } from 'react';

/*
 * Símbolo "VT" do Viela Tech, vetorizado a partir da arte original
 * (src/assets/brand/original/logo-vielatech.png) e recolorido com a paleta oficial:
 * haste do V em Azul Saúde Cívica, faixa do T em Verde Esmeralda.
 * As versões completas em arquivo estão em src/assets/brand/*.svg.
 */
const MARCA = {
  v: 'M55 125H178Q205 125 218 148L378 430Q384 450 362 450H215Q188 450 176 428L40 147Q30 125 55 125Z',
  t: 'M520 28H705Q724 28 714 45L615 200Q606 212 590 212H445Q405 212 382 242L333 300L282 214Q276 204 286 196L488 42Q502 28 520 28Z',
  l: 'M432 250L566 246Q584 246 574 262L410 528Q398 546 397 524L400 290Q401 252 432 250Z',
};

export function LogoSimbolo({ className = 'h-9 w-auto' }) {
  const id = useId().replace(/:/g, '');
  return (
    <svg viewBox="20 10 720 550" className={className} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`vt-${id}`} x1="300" y1="300" x2="720" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#059669" />
          <stop offset="1" stopColor="#10B981" />
        </linearGradient>
      </defs>
      <path d={MARCA.v} className="fill-sky-600 dark:fill-sky-400" />
      <path d={MARCA.t} fill={`url(#vt-${id})`} />
      <path d={MARCA.l} className="fill-sky-700 dark:fill-sky-300" />
    </svg>
  );
}

/** Logo horizontal: símbolo + "Viela Tech" (+ assinatura opcional). */
export function Logo({ assinatura = false, className = '', tamanho = 'md', invertido = false }) {
  const t = {
    sm: { simbolo: 'h-7', texto: 'text-lg', tag: 'text-[0.55rem]' },
    md: { simbolo: 'h-9', texto: 'text-xl', tag: 'text-[0.6rem]' },
    lg: { simbolo: 'h-14', texto: 'text-4xl', tag: 'text-xs' },
  }[tamanho];
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoSimbolo className={`${t.simbolo} w-auto shrink-0`} />
      <span className="flex flex-col leading-none">
        <span className={`font-display ${t.texto} tracking-tight`}>
          <span className={`font-extrabold ${invertido ? 'text-white' : 'text-slate-900 dark:text-white'}`}>Viela</span>
          <span className={`font-light ${invertido ? 'text-sky-400' : 'text-sky-700 dark:text-sky-400'}`}>Tech</span>
        </span>
        {assinatura && (
          <span className={`mt-1 font-medium uppercase tracking-[0.32em] ${invertido ? 'text-slate-400' : 'text-slate-500 dark:text-slate-400'} ${t.tag}`}>
            Inteligência urbana
          </span>
        )}
      </span>
    </span>
  );
}
