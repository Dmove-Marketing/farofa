// Mostra o campo "Nome da empresa" (marcado com data-empresa-campo) quando o
// tipo de evento selecionado é corporativo; oculta, desobriga e limpa nos demais.

export const TIPOS_CORPORATIVOS = new Set([
  'Confraternizacao corporativa',
  'Corporativo',
  'Feiras e Exposicoes',
  'Masterclass e Palestras',
  'Mentorias e Treinamentos',
  'Offsite corporativo',
  'Reunioes de Networking',
  'Workshops, Conferencias e Seminarios',
]);

export function initEmpresaToggle() {
  document.querySelectorAll<HTMLFormElement>('form[data-form-id]').forEach((form) => {
    const campo  = form.querySelector<HTMLElement>('[data-empresa-campo]');
    const select = form.querySelector<HTMLSelectElement>('[name="tipo_evento"]');
    if (!campo || !select) return;
    const input = campo.querySelector<HTMLInputElement>('input');

    const atualizar = () => {
      const mostrar = TIPOS_CORPORATIVOS.has(select.value);
      campo.style.display = mostrar ? 'flex' : 'none';
      if (input) {
        input.required = mostrar;
        if (!mostrar) input.value = '';
      }
    };

    atualizar();
    select.addEventListener('change', atualizar);
  });
}
