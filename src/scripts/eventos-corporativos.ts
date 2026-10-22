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
      ['.lista-eventos li', 'cima', 0, 3, 110],
      ['.lista-diferenciais li', 'cima', 0, 3, 160],
      ['.trilho-wrap', 'cima', 160],
      ['.logos-carrossel', 'esquerda', 100],
      ['.galeria-item', 'zoom', 0, 4, 90],
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

  // Logos de clientes: autoplay + setas + arrastar
  const carrosselLogos = document.querySelector<HTMLElement>('.logos-carrossel');
  const slider = document.getElementById('logos-slider') as HTMLElement | null;
  if (carrosselLogos && slider) {
    let arrastando = false, inicioX = 0, inicioScroll = 0, pausaLogos = false;
    let timerLogos: ReturnType<typeof setInterval> | undefined;
    const larguraSlide = () => slider.querySelector<HTMLElement>('li')!.getBoundingClientRect().width;
    const irLogos = (direcao: 1 | -1) => {
      const w = larguraSlide(), max = slider.scrollWidth - slider.clientWidth;
      let alvo: number;
      if (direcao > 0) alvo = slider.scrollLeft >= max - 2 ? 0 : Math.min(max, (Math.round(slider.scrollLeft / w) + 1) * w);
      else alvo = slider.scrollLeft <= 2 ? max : Math.max(0, (Math.round(slider.scrollLeft / w) - 1) * w);
      slider.scrollTo({ left: alvo, behavior: 'smooth' });
    };
    const iniciaAutoplay = () => {
      clearInterval(timerLogos);
      if (reduzMovimento) return;
      timerLogos = setInterval(() => { if (!pausaLogos && !arrastando && !document.hidden) irLogos(1); }, 3000);
    };
    document.querySelectorAll<HTMLElement>('[data-logos]').forEach((bt) => {
      bt.addEventListener('click', () => { irLogos(bt.dataset.logos === 'proximo' ? 1 : -1); iniciaAutoplay(); });
    });
    carrosselLogos.addEventListener('mouseenter', () => { pausaLogos = true; });
    carrosselLogos.addEventListener('mouseleave', () => { pausaLogos = false; });
    carrosselLogos.addEventListener('focusin', () => { pausaLogos = true; });
    carrosselLogos.addEventListener('focusout', () => { pausaLogos = false; });
    slider.addEventListener('touchstart', () => { pausaLogos = true; }, { passive: true });
    slider.addEventListener('touchend', () => { pausaLogos = false; iniciaAutoplay(); });
    slider.addEventListener('pointerdown', (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      arrastando = true; inicioX = e.clientX; inicioScroll = slider.scrollLeft;
      slider.classList.add('arrastando'); slider.setPointerCapture(e.pointerId);
    });
    slider.addEventListener('pointermove', (e: PointerEvent) => {
      if (!arrastando) return;
      slider.scrollLeft = inicioScroll - (e.clientX - inicioX);
    });
    const soltar = () => {
      if (!arrastando) return;
      arrastando = false;
      slider.scrollTo({ left: Math.round(slider.scrollLeft / larguraSlide()) * larguraSlide(), behavior: 'smooth' });
      setTimeout(() => slider.classList.remove('arrastando'), 450);
      iniciaAutoplay();
    };
    slider.addEventListener('pointerup', soltar);
    slider.addEventListener('pointercancel', soltar);
    iniciaAutoplay();
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
