import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, ShieldCheck } from 'lucide-react';

/*
 * Política de privacidade e Termos de uso.
 * Textos escritos para o protótipo acadêmico, descrevendo só o que o sistema realmente faz.
 */

const ATUALIZACAO = '12 de novembro de 2026';
const CONTATO = 'vielatech@hotmail.com';

const PRIVACIDADE = {
  titulo: 'Política de privacidade',
  icone: ShieldCheck,
  resumo:
    'Como o Viela Tech coleta, usa e protege os seus dados pessoais, em conformidade com a Lei Geral de Proteção de Dados Pessoais (LGPD, Lei nº 13.709/2018).',
  secoes: [
    {
      id: 'quem-somos',
      titulo: 'Quem cuida dos seus dados',
      corpo: (
        <>
          <p>
            O Viela Tech é um protótipo acadêmico criado por estudantes da FIAP para a Global Solution 2026.2. Ele não é um serviço oficial da
            Prefeitura do Rio nem da Secretaria Municipal de Saúde.
          </p>
          <p>
            A equipe do projeto é a controladora dos dados tratados aqui. Para qualquer pedido sobre os seus dados, fale com a gente pelo e-mail{' '}
            <a href={`mailto:${CONTATO}`}>{CONTATO}</a>.
          </p>
        </>
      ),
    },
    {
      id: 'dados',
      titulo: 'Quais dados coletamos',
      corpo: (
        <>
          <p>Coletamos só o necessário para cada função:</p>
          <ul>
            <li>
              <strong>Triagem:</strong> nome ou apelido, setor ou viela onde mora, há quantos dias está com tosse e se teve febre ou suor noturno.
            </li>
            <li>
              <strong>Conta do morador (opcional):</strong> nome, e-mail e senha. A senha é guardada pelo serviço de autenticação de forma
              criptografada; a equipe não tem acesso a ela.
            </li>
            <li>
              <strong>Atendimento:</strong> o andamento da visita e da coleta registrado pelo agente de saúde.
            </li>
            <li>
              <strong>Sensor das vielas:</strong> umidade e luz do ambiente. Esses dados não identificam pessoas.
            </li>
          </ul>
          <p>
            As informações sobre sintomas são <strong>dados pessoais sensíveis</strong> (art. 5º, II, da LGPD), porque dizem respeito à saúde. Por
            isso recebem cuidado extra.
          </p>
        </>
      ),
    },
    {
      id: 'finalidade',
      titulo: 'Para que usamos e com qual base legal',
      corpo: (
        <>
          <ul>
            <li>Organizar a fila de visitas dos Agentes Comunitários de Saúde, priorizando quem tosse há 21 dias ou mais.</li>
            <li>Permitir que o morador acompanhe as próprias triagens.</li>
            <li>Mostrar à gestão números agregados e o microclima das vielas.</li>
          </ul>
          <p>
            Tratamos os dados de saúde com o seu <strong>consentimento</strong>, dado ao enviar a triagem (art. 11, I), e para a{' '}
            <strong>tutela da saúde</strong> em procedimento realizado por profissionais e serviços de saúde (art. 11, II, “f”). Os dados da conta
            são tratados para executar o serviço que você pediu (art. 7º, V).
          </p>
          <p>Não usamos seus dados para publicidade, não vendemos e não fazemos perfis de consumo.</p>
        </>
      ),
    },
    {
      id: 'compartilhamento',
      titulo: 'Quem pode ver',
      corpo: (
        <>
          <ul>
            <li>
              <strong>Você:</strong> vê só as suas próprias triagens.
            </li>
            <li>
              <strong>Equipe de saúde (ACS e gestão):</strong> vê a fila completa para organizar as visitas. O acesso é liberado pela coordenação.
            </li>
            <li>
              <strong>Provedores de tecnologia:</strong> o banco de dados e a autenticação ficam no Supabase, e o site é hospedado na Vercel. Eles
              guardam os dados em nosso nome e não podem usá-los para outros fins.
            </li>
          </ul>
          <p>Essas regras são aplicadas no próprio banco de dados, por políticas de acesso por perfil, e não só na tela.</p>
        </>
      ),
    },
    {
      id: 'aparelho',
      titulo: 'Dados guardados no seu aparelho',
      corpo: (
        <p>
          Sem internet, a triagem e as atualizações do agente ficam guardadas no próprio aparelho e são enviadas quando o sinal volta. Também
          guardamos a sua escolha de tema claro ou escuro e a sessão de login. Não usamos cookies de publicidade nem rastreadores de terceiros.
        </p>
      ),
    },
    {
      id: 'seguranca',
      titulo: 'Segurança e por quanto tempo guardamos',
      corpo: (
        <>
          <p>
            A conexão é criptografada (HTTPS), o acesso é controlado por perfil e a senha nunca fica visível. Mesmo assim, nenhum sistema é 100%
            invulnerável; se houver um incidente que traga risco a você, vamos avisar, como manda o art. 48 da LGPD.
          </p>
          <p>
            Guardamos os dados enquanto a sua conta existir ou enquanto durar o projeto acadêmico. Depois disso, eles são excluídos ou
            anonimizados.
          </p>
        </>
      ),
    },
    {
      id: 'direitos',
      titulo: 'Seus direitos',
      corpo: (
        <>
          <p>Pelo art. 18 da LGPD, você pode, a qualquer momento e de graça:</p>
          <ul>
            <li>confirmar se tratamos seus dados e ter acesso a eles;</li>
            <li>corrigir dados incompletos, errados ou desatualizados;</li>
            <li>pedir a anonimização, o bloqueio ou a exclusão de dados desnecessários;</li>
            <li>pedir a portabilidade dos seus dados;</li>
            <li>saber com quem compartilhamos;</li>
            <li>retirar o consentimento e pedir a exclusão dos dados tratados com base nele.</li>
          </ul>
          <p>
            Para exercer qualquer direito, escreva para <a href={`mailto:${CONTATO}`}>{CONTATO}</a>. Se achar que seus direitos não foram
            respeitados, você também pode reclamar à Autoridade Nacional de Proteção de Dados (ANPD).
          </p>
        </>
      ),
    },
    {
      id: 'menores',
      titulo: 'Crianças e adolescentes',
      corpo: <p>Menores de 18 anos devem fazer a triagem com um responsável, que dá o consentimento por eles (art. 14 da LGPD).</p>,
    },
  ],
};

const TERMOS = {
  titulo: 'Termos de uso',
  icone: FileText,
  resumo: 'As regras para usar o Viela Tech. Ao usar o site ou criar uma conta, você concorda com estes termos e com a Política de privacidade.',
  secoes: [
    {
      id: 'o-que-e',
      titulo: 'O que é o Viela Tech',
      corpo: (
        <p>
          Um protótipo acadêmico de saúde cívica para a Rocinha, criado para a FIAP Global Solution 2026.2. Ele ajuda moradores a reconhecer
          sinais de alerta da tuberculose e organiza as visitas dos agentes de saúde. Não é um serviço oficial da Prefeitura do Rio.
        </p>
      ),
    },
    {
      id: 'nao-diagnostico',
      titulo: 'A triagem não é diagnóstico médico',
      corpo: (
        <>
          <p>
            O resultado da triagem é uma orientação, não um diagnóstico. Só um profissional de saúde, com exame, pode dizer se é tuberculose. Procure
            a Clínica da Família Rinaldo De Lamare ou o CMS Albert Sabin.
          </p>
          <p>
            <strong>Em emergência</strong>, como falta de ar forte ou tosse com sangue, não espere a visita: procure atendimento imediato ou ligue
            192 (SAMU).
          </p>
        </>
      ),
    },
    {
      id: 'conta',
      titulo: 'Sua conta',
      corpo: (
        <ul>
          <li>A triagem funciona sem conta. A conta serve para acompanhar o atendimento.</li>
          <li>Use informações verdadeiras e mantenha sua senha só com você.</li>
          <li>Contas da equipe de saúde são liberadas apenas pela coordenação; ninguém altera o próprio perfil de acesso.</li>
        </ul>
      ),
    },
    {
      id: 'uso',
      titulo: 'Uso correto',
      corpo: (
        <>
          <p>Não é permitido:</p>
          <ul>
            <li>enviar triagens falsas ou em nome de outra pessoa sem a autorização dela;</li>
            <li>tentar acessar dados de outras pessoas ou burlar as regras de acesso;</li>
            <li>usar o sistema para qualquer fim diferente do cuidado em saúde.</li>
          </ul>
          <p>Contas usadas de forma indevida podem ser bloqueadas.</p>
        </>
      ),
    },
    {
      id: 'disponibilidade',
      titulo: 'Disponibilidade e responsabilidade',
      corpo: (
        <p>
          Por ser um protótipo, o serviço pode ficar fora do ar, mudar ou ser encerrado ao fim do projeto. Fazemos o possível para manter os dados
          corretos e seguros, mas o Viela Tech não substitui os canais oficiais de saúde.
        </p>
      ),
    },
    {
      id: 'dados-termos',
      titulo: 'Seus dados',
      corpo: (
        <p>
          O tratamento de dados pessoais segue a <Link to="/privacidade">Política de privacidade</Link> e a LGPD. Lá você encontra quais dados
          coletamos, quem pode vê-los e como exercer seus direitos.
        </p>
      ),
    },
    {
      id: 'mudancas',
      titulo: 'Mudanças e contato',
      corpo: (
        <p>
          Podemos atualizar estes termos; a data da última versão fica no topo da página. Dúvidas: <a href={`mailto:${CONTATO}`}>{CONTATO}</a>.
        </p>
      ),
    },
  ],
};

export default function LegalPage({ tipo }) {
  const doc = tipo === 'termos' ? TERMOS : PRIVACIDADE;
  const Icone = doc.icone;
  const [ativa, setAtiva] = useState(doc.secoes[0].id);

  // Destaca no índice a seção que está na tela.
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return undefined;
    const obs = new IntersectionObserver(
      (entradas) => {
        const visivel = entradas.find((e) => e.isIntersecting);
        if (visivel) setAtiva(visivel.target.id);
      },
      { rootMargin: '-20% 0px -70% 0px' },
    );
    doc.secoes.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) obs.observe(el);
    });
    // Abre direto na seção pedida (ex.: /privacidade#direitos).
    if (window.location.hash) document.getElementById(window.location.hash.slice(1))?.scrollIntoView();
    return () => obs.disconnect();
  }, [doc]);

  return (
    <div className="container-app py-12 sm:py-16">
      <header className="max-w-3xl">
        <p className="sobrelinha flex items-center gap-2">
          <Icone className="h-4 w-4" aria-hidden="true" /> Transparência · LGPD
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">{doc.titulo}</h1>
        <p className="mt-4 text-lg leading-relaxed texto-suave">{doc.resumo}</p>
        <p className="mt-3 text-sm texto-suave">Última atualização: {ATUALIZACAO}</p>
      </header>

      <div className="mt-12 grid gap-12 lg:grid-cols-12">
        <nav aria-label="Nesta página" className="lg:col-span-3">
          <div className="lg:sticky lg:top-24">
            <p className="text-sm font-semibold">Nesta página</p>
            <ol className="mt-3 border-l border-slate-200 dark:border-slate-800">
              {doc.secoes.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    aria-current={ativa === s.id ? 'location' : undefined}
                    className={`-ml-px flex min-h-toque items-center border-l-2 pl-4 text-sm transition-colors ${
                      ativa === s.id
                        ? 'border-sky-600 font-semibold text-slate-900 dark:border-sky-400 dark:text-white'
                        : 'border-transparent texto-suave hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {s.titulo}
                  </a>
                </li>
              ))}
            </ol>
            <Link
              to={tipo === 'termos' ? '/privacidade' : '/termos'}
              className="mt-6 inline-flex min-h-toque items-center text-sm font-semibold text-sky-700 hover:underline dark:text-sky-400"
            >
              Ler também: {tipo === 'termos' ? 'Política de privacidade' : 'Termos de uso'} →
            </Link>
          </div>
        </nav>

        <article className="texto-legal space-y-12 lg:col-span-8 lg:col-start-5">
          {doc.secoes.map((s, i) => (
            <section key={s.id} id={s.id} className="scroll-mt-24">
              <h2 className="flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
                <span className="text-sm font-medium tabular-nums text-sky-700 dark:text-sky-400">{String(i + 1).padStart(2, '0')}</span>
                {s.titulo}
              </h2>
              <div className="mt-4 space-y-4 leading-relaxed text-slate-700 dark:text-slate-300">{s.corpo}</div>
            </section>
          ))}
        </article>
      </div>
    </div>
  );
}
