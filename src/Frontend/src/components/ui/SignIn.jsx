import { useEffect, useId, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check, Eye, EyeOff, Lock } from 'lucide-react';
import { Foto } from './Foto';
import { Logo } from '../brand/Logo';
import { ThemeToggle } from '../layout/Header';

/*
 * Tela de login em tela cheia (sem cabeçalho nem rodapé do site), em duas metades:
 * à esquerda, o painel da marca com foto e conteúdo vivo; à direita, o formulário.
 * Adaptada do componente "sign-in" (21st.dev) para JavaScript + Tailwind 3.
 * Sem login com Google nem depoimentos inventados: os cartões trazem informação real.
 */

const menosMovimento = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/** Campo do login: rótulo, erro ligado por aria, olho da senha e check quando está certo. */
export function CampoVidro({ label, erro, dica, valido = false, type = 'text', className = '', children, ...props }) {
  const id = useId();
  const [mostrar, setMostrar] = useState(false);
  const senha = type === 'password';
  const descricao = [dica && `${id}-dica`, erro && `${id}-erro`].filter(Boolean).join(' ') || undefined;
  return (
    <div className={className}>
      <label htmlFor={id} className="text-sm font-semibold text-slate-700 dark:text-slate-200">
        {label}
      </label>
      {dica && (
        <p id={`${id}-dica`} className="mt-0.5 text-xs texto-suave">
          {dica}
        </p>
      )}
      <div
        className={`relative mt-1.5 rounded-xl border bg-white transition-all duration-300 focus-within:ring-4 dark:bg-slate-900
          ${erro
            ? 'border-red-600 focus-within:ring-red-600/10 dark:border-red-400'
            : valido
              ? 'border-emerald-500 focus-within:border-emerald-600 focus-within:ring-emerald-600/10 dark:border-emerald-500'
              : 'border-slate-300 focus-within:border-sky-600 focus-within:ring-sky-600/10 dark:border-slate-600 dark:focus-within:border-sky-400'}`}
      >
        <input
          id={id}
          type={senha && mostrar ? 'text' : type}
          aria-invalid={erro ? true : undefined}
          aria-describedby={descricao}
          className={`min-h-12 w-full rounded-xl bg-transparent px-4 text-base text-slate-900 placeholder:text-slate-500 focus:outline-none dark:text-slate-50 dark:placeholder:text-slate-400 ${senha ? 'pr-24' : 'pr-12'}`}
          {...props}
        />
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-emerald-500 text-white transition-all duration-300 ${
            senha ? 'right-14' : 'right-3'
          } ${valido && !erro ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}
        >
          <Check className="h-4 w-4" strokeWidth={3} />
        </span>
        {senha && (
          <button
            type="button"
            onClick={() => setMostrar((v) => !v)}
            aria-label={mostrar ? 'Esconder senha' : 'Mostrar senha'}
            aria-pressed={mostrar}
            className="absolute inset-y-0 right-1 flex min-w-toque items-center justify-center rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          >
            {mostrar ? <EyeOff className="h-5 w-5" aria-hidden="true" /> : <Eye className="h-5 w-5" aria-hidden="true" />}
          </button>
        )}
      </div>
      {children}
      {erro && (
        <p id={`${id}-erro`} className="mt-1.5 text-sm font-medium text-red-700 dark:text-red-300">
          {erro}
        </p>
      )}
    </div>
  );
}

/** Cartões de informação que se revezam sozinhos no painel da marca. */
export function CarrosselCartoes({ cartoes, intervalo = 5500 }) {
  const [i, setI] = useState(0);
  const [pausado, setPausado] = useState(false);
  useEffect(() => {
    if (pausado || cartoes.length < 2 || menosMovimento()) return undefined;
    const id = setTimeout(() => setI((n) => (n + 1) % cartoes.length), intervalo);
    return () => clearTimeout(id);
  }, [i, pausado, cartoes.length, intervalo]);

  const { icone: Icone, titulo, texto } = cartoes[i];
  return (
    <div onMouseEnter={() => setPausado(true)} onMouseLeave={() => setPausado(false)} onFocus={() => setPausado(true)} onBlur={() => setPausado(false)}>
      <div className="min-h-[9.5rem] rounded-3xl bg-white/10 p-6 ring-1 ring-white/20 backdrop-blur-md" aria-live="polite">
        <div key={i} className="animate-surgir flex items-start gap-4">
          {Icone && (
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/15">
              <Icone className="h-5 w-5" aria-hidden="true" />
            </span>
          )}
          <div>
            <p className="text-lg font-semibold">{titulo}</p>
            <p className="mt-1 leading-relaxed text-white/80">{texto}</p>
          </div>
        </div>
      </div>
      {cartoes.length > 1 && (
        <div className="mt-2 flex items-center" role="group" aria-label="Escolher informação">
          {cartoes.map((c, n) => (
            <button
              key={c.titulo}
              type="button"
              onClick={() => setI(n)}
              aria-label={`${n + 1} de ${cartoes.length}: ${c.titulo}`}
              aria-current={n === i ? 'true' : undefined}
              className="flex min-h-toque min-w-toque items-center justify-center"
            >
              <span className={`block h-1.5 rounded-full transition-all duration-500 ${n === i ? 'w-8 bg-white' : 'w-3 bg-white/40 hover:bg-white/70'}`} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Moldura da tela de login em tela cheia.
 * @param {{ titulo: React.ReactNode, descricao?: React.ReactNode, foto?: string, legendaFoto?: React.ReactNode,
 *   chamada?: React.ReactNode, cartoes?: Array, painel?: React.ReactNode, children: React.ReactNode }} props
 */
export function SignInPage({ titulo, descricao, foto = 'rocinha-por-do-sol', legendaFoto, chamada, cartoes = [], painel, children }) {
  return (
    <div className="flex min-h-[100dvh] flex-col lg:flex-row">
      {/* Painel da marca */}
      <aside className="relative isolate flex h-56 flex-col overflow-hidden bg-slate-950 text-white sm:h-64 lg:sticky lg:top-0 lg:h-[100dvh] lg:w-1/2">
        <Foto nome={foto} alt="" sizes="(min-width: 1024px) 50vw, 100vw" prioridade className="absolute inset-0 -z-20" imgClassName="animate-zoom-lento h-full w-full object-cover" />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-b from-slate-950/70 via-slate-950/35 to-slate-950/90 lg:bg-gradient-to-tr lg:from-slate-950/95 lg:via-slate-950/60 lg:to-sky-950/30" />
        <div aria-hidden="true" className="grade-hero absolute inset-0 -z-10 opacity-30" />

        <div className="flex h-full flex-col justify-between p-5 sm:p-8 xl:p-14">
          <Link to="/" className="inline-flex min-h-toque w-fit items-center">
            <Logo invertido />
            <span className="sr-only">, página inicial</span>
          </Link>

          <div className="hidden max-w-lg lg:block">
            {chamada && <p className="animate-element animate-delay-200 mb-8 text-4xl font-semibold leading-tight tracking-tight xl:text-5xl">{chamada}</p>}
            <div className="animate-testimonial animate-delay-400">{painel ?? (cartoes.length > 0 && <CarrosselCartoes cartoes={cartoes} />)}</div>
          </div>

          {legendaFoto && <p className="text-sm text-white/75">{legendaFoto}</p>}
        </div>
      </aside>

      {/* Formulário */}
      <section className="flex flex-1 flex-col lg:w-1/2">
        <div className="flex items-center justify-between px-4 pt-3 sm:px-8 lg:px-12">
          <Link to="/" className="inline-flex min-h-toque items-center gap-1.5 text-sm font-semibold texto-suave hover:text-slate-900 dark:hover:text-white">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Início
          </Link>
          <ThemeToggle />
        </div>

        <div className="flex flex-1 items-center justify-center px-4 py-8 sm:px-8 lg:py-12">
          <div className="w-full max-w-md">
            <div className="flex flex-col gap-6">
              <h1 className="animate-element animate-delay-100 text-3xl font-semibold tracking-tight md:text-4xl">{titulo}</h1>
              {descricao && <p className="animate-element animate-delay-200 -mt-2 text-lg texto-suave">{descricao}</p>}
              {children}
            </div>
          </div>
        </div>

        <footer className="flex flex-col gap-2 border-t border-slate-200 px-4 py-5 text-xs texto-suave dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
          <p className="flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5" aria-hidden="true" /> Dados protegidos conforme a LGPD.
          </p>
          <nav aria-label="Documentos legais" className="flex gap-1">
            <Link to="/privacidade" className="inline-flex min-h-toque items-center px-2 font-semibold hover:text-slate-900 hover:underline dark:hover:text-white">
              Privacidade
            </Link>
            <Link to="/termos" className="inline-flex min-h-toque items-center px-2 font-semibold hover:text-slate-900 hover:underline dark:hover:text-white">
              Termos de uso
            </Link>
          </nav>
        </footer>
      </section>
    </div>
  );
}

/** Botão principal do login (contraste AA). */
export function BotaoLogin({ children, carregando, className = '', ...props }) {
  return (
    <button
      type="submit"
      disabled={carregando}
      aria-busy={carregando || undefined}
      className={`group inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-sky-700 font-semibold text-white shadow-lg shadow-sky-700/20 transition hover:-translate-y-0.5 hover:bg-sky-800 hover:shadow-xl active:translate-y-0 disabled:cursor-wait disabled:opacity-70 dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
