// Demo-request form: AJAX submit to our own /api/contact (which relays to Formspree), stays on the page.
export function initDemoForm() {
  const form = document.getElementById('demoForm') as HTMLFormElement | null;
  const statusEl = document.getElementById('formStatus');
  const noteEl = document.getElementById('formNote');
  form?.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const action = form.getAttribute('action') || '';
    const submitBtn = form.querySelector('button[type=submit]') as HTMLButtonElement;
    const show = (msg: string, ok: boolean) => {
      if (!statusEl) return;
      statusEl.textContent = msg;
      statusEl.className = 'form-status ' + (ok ? 'ok' : 'err');
      statusEl.hidden = false;
    };

    const email = (form.querySelector('#f-email') as HTMLInputElement)?.value.trim();
    const name = (form.querySelector('#f-name') as HTMLInputElement)?.value.trim();
    if (!name || !email) { show('Please add your name and work email.', false); return; }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';
    try {
      const res = await fetch(action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        form.reset();
        submitBtn.textContent = '✓ Received';
        noteEl?.setAttribute('hidden', '');
        show("Thanks — we'll be in touch from hello@qualiber.ai shortly.", true);
      } else {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Request a demo →';
        show('Something went wrong. Email hello@qualiber.ai and we’ll sort it.', false);
      }
    } catch {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Request a demo →';
      show('Network error. Email hello@qualiber.ai and we’ll sort it.', false);
    }
  });
}
