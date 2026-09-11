const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('#main-nav');

if (menuToggle && mainNav) {
  menuToggle.addEventListener('click', () => {
    const open = mainNav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Zavřít menu' : 'Otevřít menu');
  });

  mainNav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    mainNav.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Otevřít menu');
  }));
}

/* ---------- Cookie consent ---------- */
const COOKIE_KEY = 'novak_cookie_consent';
const cookieBanner = document.querySelector('#cookie-banner');
const cookieSettingsDialog = document.querySelector('#cookie-settings-dialog');
const analyticsToggle = document.querySelector('#analytics-toggle');
const marketingToggle = document.querySelector('#marketing-toggle');

const getConsent = () => {
  try {
    const stored = localStorage.getItem(COOKIE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

const saveConsent = ({ analytics = false, marketing = false } = {}) => {
  const consent = {
    necessary: true,
    analytics: Boolean(analytics),
    marketing: Boolean(marketing),
    savedAt: new Date().toISOString()
  };

  localStorage.setItem(COOKIE_KEY, JSON.stringify(consent));
  applyConsent(consent);
  cookieBanner?.classList.add('hidden');
  if (cookieSettingsDialog?.open) cookieSettingsDialog.close();
};

const applyConsent = consent => {
  // Zde se později mohou podmíněně načíst skutečné analytické/marketingové skripty.
  // Dokud uživatel nedá souhlas, žádné volitelné měření se nespouští.
  document.documentElement.dataset.analyticsConsent = consent?.analytics ? 'granted' : 'denied';
  document.documentElement.dataset.marketingConsent = consent?.marketing ? 'granted' : 'denied';
};

const openCookieSettings = () => {
  const consent = getConsent();
  analyticsToggle.checked = Boolean(consent?.analytics);
  marketingToggle.checked = Boolean(consent?.marketing);
  cookieSettingsDialog?.showModal();
};

const closeCookieSettings = () => {
  if (cookieSettingsDialog?.open) cookieSettingsDialog.close();
};

const initialConsent = getConsent();
if (initialConsent) {
  applyConsent(initialConsent);
  cookieBanner?.classList.add('hidden');
} else {
  cookieBanner?.classList.remove('hidden');
}

document.querySelector('#cookie-accept')?.addEventListener('click', () => {
  saveConsent({ analytics: true, marketing: true });
});

document.querySelector('#cookie-reject')?.addEventListener('click', () => {
  saveConsent({ analytics: false, marketing: false });
});

document.querySelector('#cookie-settings')?.addEventListener('click', openCookieSettings);
document.querySelector('#cookie-settings-footer')?.addEventListener('click', openCookieSettings);
document.querySelector('#cookie-settings-close')?.addEventListener('click', closeCookieSettings);

document.querySelector('#cookie-accept-settings')?.addEventListener('click', () => {
  // "Přijmout" v nastavení znamená přijmout všechny volitelné kategorie,
  // bez ohledu na aktuální stav přepínačů.
  saveConsent({ analytics: true, marketing: true });
});

document.querySelector('#cookie-reject-settings')?.addEventListener('click', () => {
  // "Odmítnout" znamená odmítnout všechny volitelné kategorie.
  analyticsToggle.checked = false;
  marketingToggle.checked = false;
  saveConsent({ analytics: false, marketing: false });
});

document.querySelector('#cookie-save')?.addEventListener('click', () => {
  saveConsent({
    analytics: analyticsToggle?.checked,
    marketing: marketingToggle?.checked
  });
});

cookieSettingsDialog?.addEventListener('click', event => {
  if (event.target === cookieSettingsDialog) closeCookieSettings();
});

// Rozbalování jednotlivých kategorií cookies.
document.querySelectorAll('.cookie-expand').forEach(button => {
  button.addEventListener('click', () => {
    const option = button.closest('.cookie-option');
    if (!option) return;

    const expanded = option.classList.toggle('is-expanded');
    button.setAttribute('aria-expanded', String(expanded));

    const title = option.querySelector('.cookie-option-title')?.textContent?.trim() || 'cookies';
    button.setAttribute('aria-label', `${expanded ? 'Sbalit' : 'Rozbalit'} ${title}`);
    button.textContent = expanded ? '⌃' : '⌄';
  });
});

/* ---------- Privacy dialog ---------- */
const privacyDialog = document.querySelector('#privacy-dialog');
document.querySelectorAll('#privacy-link, #privacy-link-form').forEach(button => {
  button.addEventListener('click', () => privacyDialog?.showModal());
});
privacyDialog?.querySelector('.dialog-close')?.addEventListener('click', () => privacyDialog.close());
privacyDialog?.addEventListener('click', event => {
  if (event.target === privacyDialog) privacyDialog.close();
});

/* ---------- Contact form ---------- */
const form = document.querySelector('#contact-form');
const status = document.querySelector('#form-status');
const attachment = document.querySelector('#attachment');
const fileError = document.querySelector('#file-error');
const fileSelection = document.querySelector('#file-selection');
const fileName = document.querySelector('#file-name');
const fileRemove = document.querySelector('#file-remove');
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const showFormButton = document.querySelector('#show-contact-form');

showFormButton?.addEventListener('click', () => {
  if (!form) return;
  form.hidden = false;
  showFormButton.setAttribute('aria-expanded', 'true');
  showFormButton.querySelector('.choice-card-action')?.replaceChildren(document.createTextNode('Formulář je otevřen'));
  form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  setTimeout(() => document.querySelector('#name')?.focus(), 350);
});



const clearAttachment = () => {
  if (attachment) attachment.value = '';
  if (fileSelection) fileSelection.hidden = true;
  if (fileName) fileName.textContent = '';
  if (fileError) fileError.textContent = '';
};

attachment?.addEventListener('change', () => {
  if (fileError) fileError.textContent = '';
  const file = attachment.files?.[0];
  if (!file) {
    clearAttachment();
    return;
  }

  if (file.size > MAX_FILE_SIZE) {
    if (fileError) fileError.textContent = 'Vybraná fotografie je příliš velká. Maximální velikost je 10 MB.';
    clearAttachment();
    return;
  }

  if (fileName) fileName.textContent = file.name;
  if (fileSelection) fileSelection.hidden = false;
});

fileRemove?.addEventListener('click', clearAttachment);

form?.addEventListener('submit', async e => {
  e.preventDefault();

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const file = attachment?.files?.[0];
  if (file && file.size > MAX_FILE_SIZE) {
    if (fileError) fileError.textContent = 'Vybraná fotografie je příliš velká. Maximální velikost je 10 MB.';
    attachment?.focus();
    return;
  }

  if (status) status.textContent = 'Odesílám…';

  try {
    const response = await fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { Accept: 'application/json' }
    });

    let result = null;
    try {
      result = await response.json();
    } catch {
      // Některé chybové odpovědi nemusí být JSON.
    }

    if (response.ok) {
      form.reset();
      clearAttachment();
      if (status) status.textContent = 'Děkuji. Poptávka byla úspěšně odeslána. Ozvu se vám během pracovního dne.';
    } else {
      const details = Array.isArray(result?.errors)
        ? result.errors.map(error => error.message || error.code).filter(Boolean).join(' ')
        : '';
      if (status) status.textContent = details
        ? `Poptávku se nepodařilo odeslat: ${details}`
        : 'Poptávku se nepodařilo odeslat. Zkontrolujte velikost a typ přílohy nebo to zkuste znovu.';
    }
  } catch (error) {
    if (status) status.textContent = 'Poptávku se nepodařilo odeslat. Zkontrolujte připojení k internetu a zkuste to znovu.';
  }
});
