import { useId } from 'react';

/** Campo de texto com rótulo, dica e erro ligados por aria-describedby. */
export function Field({ label, dica, erro, id, className = '', inputClassName = '', ...props }) {
  const gerado = useId();
  const campoId = id ?? gerado;
  const dicaId = dica ? `${campoId}-dica` : undefined;
  const erroId = erro ? `${campoId}-erro` : undefined;

  return (
    <div className={className}>
      <label htmlFor={campoId} className="mb-1.5 block text-base font-semibold text-slate-900 dark:text-slate-100">
        {label}
      </label>
      {dica && (
        <p id={dicaId} className="mb-2 text-sm texto-suave">
          {dica}
        </p>
      )}
      <input
        id={campoId}
        aria-invalid={erro ? true : undefined}
        aria-describedby={[dicaId, erroId].filter(Boolean).join(' ') || undefined}
        className={`campo ${erro ? 'campo-invalido' : ''} ${inputClassName}`}
        {...props}
      />
      {erro && (
        <p id={erroId} className="mt-2 text-sm font-medium text-red-700 dark:text-red-300">
          {erro}
        </p>
      )}
    </div>
  );
}

/** Pergunta de sim/não grande e fácil de tocar (checkbox estilizado). */
export function ToggleQuestion({ label, descricao, checked, onChange, id }) {
  const gerado = useId();
  const campoId = id ?? gerado;
  return (
    <label
      htmlFor={campoId}
      className={`flex min-h-toque cursor-pointer items-start gap-4 rounded-xl border-2 p-4 transition-colors
        ${checked
          ? 'border-sky-600 bg-sky-50 dark:border-sky-400 dark:bg-sky-950/50'
          : 'border-slate-300 bg-white hover:border-slate-400 dark:border-slate-600 dark:bg-slate-900 dark:hover:border-slate-500'}`}
    >
      <input
        id={campoId}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-6 w-6 shrink-0 cursor-pointer rounded-md border-2 border-slate-400 accent-sky-700"
      />
      <span>
        <span className="block font-semibold text-slate-900 dark:text-slate-100">{label}</span>
        {descricao && <span className="mt-0.5 block text-sm texto-suave">{descricao}</span>}
      </span>
    </label>
  );
}
