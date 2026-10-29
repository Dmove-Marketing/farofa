import flatpickr from 'flatpickr';
import { Portuguese } from 'flatpickr/dist/l10n/pt.js';
import { initForms } from './forms';

export function initPage() {
  initForms();

  // Flatpickr nos campos de data
  document.querySelectorAll<HTMLInputElement>('[data-datepicker]').forEach((el) => {
    flatpickr(el, {
      locale: Portuguese,
      dateFormat: 'd/m/Y',
      minDate: 'today',
      allowInput: true,
    });
  });

  // Cabeçalho sólido ao rolar
  const cabecalho = document.getElementById('cabecalho');
  if (cabecalho) {
    const atualiza = () => cabecalho.classList.toggle('solido', window.scrollY > 40);
    atualiza();
    window.addEventListener('scroll', atualiza, { passive: true });
  }

  // Botão CTA do cabeçalho: aparece após o usuário rolar além da segunda seção
  const cabecalhoAcoes = document.querySelector<HTMLElement>('.cabecalho-acoes');
  const segundaSecao   = document.getElementById('experiencia');
  if (cabecalhoAcoes && segundaSecao && 'IntersectionObserver' in window) {
    const obsAcoes = new IntersectionObserver(([entrada]) => {
      cabecalhoAcoes.classList.toggle('visivel', !entrada.isIntersecting);
    }, { threshold: 0 });
    obsAcoes.observe(segundaSecao);
  } else if (cabecalhoAcoes) {
    cabecalhoAcoes.classList.add('visivel');
  }

  // Barra mobile: aparece fora do hero e some com o formulário de contato visível
  const barra = document.getElementById('barra-mobile');
  const formTopo = document.getElementById('orcamento');
  const contato = document.getElementById('contato');
  if (barra && formTopo && contato && 'IntersectionObserver' in window) {
    const visiveis = new Set<Element>();
    const obs = new IntersectionObserver((entradas) => {
      entradas.forEach((e) => { e.isIntersecting ? visiveis.add(e.target) : visiveis.delete(e.target); });
      barra.classList.toggle('visivel', visiveis.size === 0);
    }, { threshold: 0.15 });
    obs.observe(formTopo);
    obs.observe(contato);
  } else if (barra) {
    barra.classList.add('visivel');
  }

  // Carrossel infinito da gastronomia
  const trilho = document.getElementById('trilho-gastronomia');
  if (trilho) {
    const faixa = trilho.querySelector<HTMLElement>('.trilho-faixa');
    if (faixa) {
      Array.from(faixa.children).forEach((fig) => {
        const copia = fig.cloneNode(true) as HTMLElement;
        copia.setAttribute('aria-hidden', 'true');
        const img = copia.querySelector('img');
        if (img) img.alt = '';
        faixa.appendChild(copia);
      });
      trilho.classList.add('infinito');
    }
    trilho.addEventListener('touchstart', () => trilho.classList.add('pausado'), { passive: true });
    trilho.addEventListener('touchend', () => trilho.classList.remove('pausado'));
  }

  // Animações de rolagem (fade + reveal)
  if (document.documentElement.classList.contains('js-animar')) {
    type Grupo = [string, string, number, number?, number?];
    const grupos: Grupo[] = [
      ['.hero .local', 'cima', 0],
      ['.hero h1', 'cima', 120],
      ['.hero-sub', 'cima', 240],
      ['.form-topo .form-cartao', 'direita', 360],
      ['main .titulo-secao', 'cima', 0],
      ['main .texto-secao', 'cima', 140],
      ['.experiencia-foto', 'zoom', 120],
      ['.lista-diferenciais li', 'cima', 0, 4, 120],
      ['.trilho-wrap', 'cima', 160],
      ['.galeria-slider', 'cima', 100],
      ['.faq-lista', 'cima', 100],
      ['.endereco', 'cima', 100],
      ['.mapa', 'cima', 160],
      ['.localizacao-botoes', 'cima', 200],
      ['.contato .form-cartao', 'direita', 160],
    ];
    const revelar: HTMLElement[] = [];
    grupos.forEach((g) => {
      document.querySelectorAll<HTMLElement>(g[0]).forEach((el, i) => {
        if (el.hasAttribute('data-revelar')) return;
        el.setAttribute('data-revelar', g[1]);
        const atraso = g[2] + (g[3] ? (i % g[3]) * (g[4] ?? 0) : 0);
        if (atraso) el.style.setProperty('--atraso', atraso + 'ms');
        revelar.push(el);
      });
    });
    const obsRevelar = new IntersectionObserver((entradas) => {
      entradas.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('visivel');
        obsRevelar.unobserve(e.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revelar.forEach((el) => obsRevelar.observe(el));

    // Parallax suave no hero
    const fotoHero = document.querySelector<HTMLElement>('.hero-fundo img');
    if (fotoHero) {
      let agendado = false;
      const parallax = () => {
        agendado = false;
        const y = window.scrollY;
        const parent = fotoHero.parentElement;
        if (!parent || y > parent.offsetHeight) return;
        fotoHero.style.transform = `translate3d(0,${(y * 0.3).toFixed(1)}px,0) scale(1.12)`;
      };
      parallax();
      window.addEventListener('scroll', () => {
        if (!agendado) { agendado = true; requestAnimationFrame(parallax); }
      }, { passive: true });
    }
  }

  // Faixa de números: entrada em sequência + contagem
  const autoridade = document.getElementById('autoridade');
  const reduzMovimento = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  if (autoridade) {
    const contarNumeros = () => {
      autoridade.querySelectorAll<HTMLElement>('.contador').forEach((el) => {
        const alvo = parseInt(el.dataset.alvo ?? '0', 10);
        const duracao = 1600;
        let inicio: number | null = null;
        el.style.minWidth = el.getBoundingClientRect().width + 'px';
        el.textContent = '0';
        const passo = (t: number) => {
          if (inicio === null) inicio = t;
          const p = Math.min(1, (t - inicio) / duracao);
          const suave = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(alvo * suave).toLocaleString('pt-BR');
          if (p < 1) requestAnimationFrame(passo);
        };
        requestAnimationFrame(passo);
      });
    };
    if (!reduzMovimento && 'IntersectionObserver' in window) {
      autoridade.classList.add('animar');
      const obsAut = new IntersectionObserver((entradas) => {
        if (!entradas[0].isIntersecting) return;
        obsAut.disconnect();
        requestAnimationFrame(() => {
          autoridade.classList.add('animado');
          contarNumeros();
        });
      }, { threshold: 0.4 });
      obsAut.observe(autoridade);
    }
  }

  // Galeria: carrossel (setas + arrastar)
  const galSlider = document.getElementById('galeria-slider') as HTMLElement | null;
  if (galSlider) {
    let arrastando = false, moveu = false, inicioX = 0, inicioScroll = 0;
    const passo = () => {
      const li = galSlider.querySelector<HTMLElement>('li');
      return li ? li.getBoundingClientRect().width + 14 : galSlider.clientWidth;
    };
    const ir = (dir: 1 | -1) => {
      const max = galSlider.scrollWidth - galSlider.clientWidth;
      let alvo = galSlider.scrollLeft + dir * passo();
      if (dir > 0 && galSlider.scrollLeft >= max - 2) alvo = 0;
      else if (dir < 0 && galSlider.scrollLeft <= 2) alvo = max;
      galSlider.scrollTo({ left: alvo, behavior: 'smooth' });
    };
    document.querySelectorAll<HTMLElement>('[data-galeria]').forEach((bt) => {
      bt.addEventListener('click', () => ir(bt.dataset.galeria === 'proximo' ? 1 : -1));
    });
    galSlider.addEventListener('pointerdown', (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      arrastando = true; moveu = false; inicioX = e.clientX; inicioScroll = galSlider.scrollLeft;
      galSlider.classList.add('arrastando');
    });
    galSlider.addEventListener('pointermove', (e: PointerEvent) => {
      if (!arrastando) return;
      if (Math.abs(e.clientX - inicioX) > 5) moveu = true;
      galSlider.scrollLeft = inicioScroll - (e.clientX - inicioX);
    });
    const soltar = () => {
      if (!arrastando) return;
      arrastando = false;
      const p = passo();
      galSlider.scrollTo({ left: Math.round(galSlider.scrollLeft / p) * p, behavior: 'smooth' });
      setTimeout(() => galSlider.classList.remove('arrastando'), 450);
    };
    galSlider.addEventListener('pointerup', soltar);
    galSlider.addEventListener('pointerleave', soltar);
    galSlider.addEventListener('pointercancel', soltar);
    // evita abrir o lightbox ao terminar um arrasto
    galSlider.addEventListener('click', (e) => { if (moveu) { e.stopPropagation(); e.preventDefault(); moveu = false; } }, true);
  }

  // Galeria: lightbox
  const grade = document.getElementById('galeria-grade');
  const lightbox = document.getElementById('lightbox') as HTMLDialogElement | null;
  const lbImg = document.getElementById('lightbox-img') as HTMLImageElement | null;
  const lbContador = document.getElementById('lightbox-contador');
  if (grade && lightbox && lbImg && lbContador) {
    const itens = Array.from(grade.querySelectorAll<HTMLElement>('.galeria-item'));
    let atual = 0;
    const mostra = (i: number) => {
      atual = ((i % itens.length) + itens.length) % itens.length;
      const img = itens[atual].querySelector<HTMLImageElement>('img')!;
      // lightbox usa a maior versão do srcset (a miniatura da grade é pequena demais)
      const maior = img.srcset ? img.srcset.split(',').pop()!.trim().split(' ')[0] : '';
      lbImg.src = maior || img.currentSrc || img.src;
      lbImg.alt = img.alt;
      lbContador.textContent = `${atual + 1} de ${itens.length}`;
    };
    itens.forEach((item, i) => {
      item.addEventListener('click', () => {
        mostra(i);
        if (typeof lightbox.showModal === 'function') lightbox.showModal();
        else lightbox.setAttribute('open', '');
      });
    });
    lightbox.addEventListener('click', (e) => {
      const alvo = (e.target as HTMLElement).closest<HTMLElement>('[data-acao]');
      if (alvo) {
        const acao = alvo.dataset.acao;
        if (acao === 'fechar') lightbox.close();
        if (acao === 'anterior') mostra(atual - 1);
        if (acao === 'proximo') mostra(atual + 1);
      } else if (e.target === lightbox) {
        lightbox.close();
      }
    });
    lightbox.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') mostra(atual - 1);
      if (e.key === 'ArrowRight') mostra(atual + 1);
    });
  }
}
