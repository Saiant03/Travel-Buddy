import json
from playwright.sync_api import sync_playwright, expect

BASE = 'http://127.0.0.1:4180'
WORDS = {
    'ro': {'start': 'Pornește generarea', 'next': 'Execută următorul pas local', 'retry': 'Reîncearcă manual', 'new': 'Pornește o încercare nouă', 'home': 'Acasă', 'open': 'Deschide demonstrația generării', 'complete': 'Simulare încheiată', 'partial': 'incomplet', 'place': 'Loc fictiv 1'},
    'en': {'start': 'Start generation', 'next': 'Run next local step', 'retry': 'Retry manually', 'new': 'Start a new attempt', 'home': 'Home', 'open': 'Open generation demo', 'complete': 'Simulation finished', 'partial': 'incomplete', 'place': 'Fictional place 1'},
    'fr': {'start': 'Lancer la génération', 'next': 'Exécuter la prochaine étape locale', 'retry': 'Réessayer manuellement', 'new': 'Lancer une nouvelle tentative', 'home': 'Accueil', 'open': 'Ouvrir la démonstration de génération', 'complete': 'Simulation terminée', 'partial': 'incomplet', 'place': 'Lieu fictif 1'},
}
failures, external, pageerrors = [], [], []
checks = 0

with sync_playwright() as pw:
    browser = pw.chromium.launch(headless=True, executable_path='/usr/bin/chromium')
    context = browser.new_context(service_workers='block', reduced_motion='reduce')
    def intercept(route):
        if route.request.url.startswith(BASE + '/'):
            route.continue_()
        else:
            external.append(route.request.url)
            route.abort()
    context.route('**/*', intercept)
    page = context.new_page()
    page.on('pageerror', lambda error: pageerrors.append(str(error)))

    def open_demo(locale, width, zoom=1):
        page.set_viewport_size({'width': width, 'height': 1000})
        page.goto(BASE + '/generation')
        expect(page.locator('#generation-scenario')).to_be_visible()
        page.locator('#locale').select_option(locale)
        page.evaluate('(zoom) => document.documentElement.style.zoom = String(zoom)', zoom)
        page.evaluate('document.fonts.ready')

    def button(locale, action):
        return page.get_by_role('button', name=WORDS[locale][action], exact=True)

    def check_state(locale, width, zoom, state, completed):
        global checks
        expect(page.get_by_role('progressbar')).to_have_attribute('value', str(completed))
        data = page.evaluate('''() => ({
          overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
          lang: document.documentElement.lang,
          font: document.fonts.check('16px Bricolage'),
          animation: document.getAnimations().filter(a => a.playState === 'running').length,
          persistent: localStorage.length + sessionStorage.length,
          externalLinks: document.querySelectorAll('.generation-page a[href*=".invalid"]').length,
          width: window.innerWidth,
          scroll: document.documentElement.scrollWidth
        })''')
        assert not data['overflow'], data
        assert data['lang'] == locale and data['font'], data
        assert data['animation'] == 0 and data['persistent'] == 0 and data['externalLinks'] == 0, data
        checks += 1

    for width, zoom in [(1440, 1), (768, 1), (390, 1), (320, 1), (1280, 2), (640, 2)]:
        for locale in WORDS:
            for scenario in ['success', 'partial', 'invalid_result', 'unavailable', 'timeout', 'quota_exhausted']:
                try:
                    open_demo(locale, width, zoom)
                    if scenario == 'success':
                        check_state(locale, width, zoom, 'idle', 0)
                    page.locator('#generation-scenario').select_option(scenario)
                    button(locale, 'start').click()
                    if scenario == 'success':
                        check_state(locale, width, zoom, 'queued', 0)
                    steps = 3 if scenario in ['success', 'partial', 'invalid_result'] else 1
                    for index in range(steps):
                        button(locale, 'next').click()
                        expect(page.get_by_role('progressbar')).to_have_attribute('value', str(min(index + 1, 2) if scenario == 'invalid_result' else index + 1 if steps == 3 else 0))
                        if scenario == 'success' and index < 2:
                            check_state(locale, width, zoom, 'running', index + 1)
                    completed = 3 if scenario in ['success', 'partial'] else 2 if scenario == 'invalid_result' else 0
                    check_state(locale, width, zoom, scenario, completed)
                    if scenario in ['success', 'partial']:
                        expect(page.get_by_text(WORDS[locale]['place'], exact=True)).to_be_visible()
                        expect(page.get_by_role('status')).to_contain_text(WORDS[locale]['complete' if scenario == 'success' else 'partial'])
                    else:
                        expect(page.get_by_role('alert')).to_be_visible()
                    if locale == 'fr' and width == 1440 and zoom == 1 and scenario == 'partial':
                        page.screenshot(path='/workspace/Travel-Buddy/docs/evidence/2026-11-02/task-7a-fr-1440.png', full_page=True)
                    if scenario in ['unavailable', 'timeout', 'partial']:
                        button(locale, 'retry').click()
                        expect(page.get_by_role('progressbar')).to_have_attribute('value', '0')
                    if scenario in ['invalid_result', 'quota_exhausted']:
                        expect(button(locale, 'retry')).to_have_count(0)
                    if locale == 'ro' and width == 390 and zoom == 1 and scenario == 'success':
                        page.screenshot(path='/workspace/Travel-Buddy/docs/evidence/2026-11-02/task-7a-ro-390.png', full_page=True)
                except Exception as error:
                    failures.append({'locale': locale, 'width': width, 'zoom': zoom, 'scenario': scenario, 'error': str(error)[:800]})
            print(f'Checked {locale}: {width}px, CSS zoom {zoom}; states={checks}, failures={len(failures)}', flush=True)

    # Independent memory, language, keyboard and reload checks.
    try:
        open_demo('ro', 390)
        page.locator('#generation-scenario').select_option('partial')
        button('ro', 'start').focus()
        page.keyboard.press('Enter')
        button('ro', 'next').focus()
        page.keyboard.press('Enter')
        expect(page.get_by_role('progressbar')).to_have_attribute('value', '1')
        assert page.locator(':focus').evaluate('(el) => getComputedStyle(el).outlineStyle') != 'none'
        page.get_by_role('link', name='Acasă', exact=True).click()
        page.get_by_role('link', name=WORDS['ro']['open'], exact=True).click()
        expect(page.get_by_role('progressbar')).to_have_attribute('value', '1')
        expect(page.locator('#generation-scenario')).to_have_value('partial')
        for locale in ['en', 'fr', 'ro']:
            page.locator('#locale').select_option(locale)
            expect(page.get_by_role('progressbar')).to_have_attribute('value', '1')
        button('ro', 'next').click()
        button('ro', 'next').click()
        for locale in ['en', 'fr']:
            page.locator('#locale').select_option(locale)
            expect(page.get_by_text(WORDS[locale]['place'], exact=True)).to_be_visible()
        page.reload()
        expect(page.locator('#locale')).to_have_value('ro')
        expect(page.locator('#generation-scenario')).to_have_value('success')
        expect(page.get_by_role('progressbar')).to_have_attribute('value', '0')
        assert page.evaluate('indexedDB.databases()') == []
        checks += 1
    except Exception as error:
        failures.append({'memory_keyboard': str(error)[:1000]})
    for locale in WORDS:
        try:
            open_demo(locale, 390)
            page.locator('#generation-scenario').focus()
            page.keyboard.press('ArrowDown')
            page.keyboard.press('Tab')
            expect(button(locale, 'start')).to_be_focused()
            page.keyboard.press('Enter')
            page.keyboard.press('Tab')
            expect(button(locale, 'next')).to_be_focused()
            assert button(locale, 'next').evaluate('(el) => getComputedStyle(el).outlineStyle') != 'none'
            for count in [1, 2, 3]:
                page.keyboard.press('Enter')
                expect(page.get_by_role('progressbar')).to_have_attribute('value', str(count))
            button(locale, 'new').focus()
            page.keyboard.press('Space')
            expect(page.get_by_role('progressbar')).to_have_attribute('value', '0')
            checks += 1
        except Exception as error:
            failures.append({'keyboard_locale': locale, 'error': str(error)[:1000]})
    page.emulate_media(reduced_motion='no-preference')
    for width in [1440, 390, 320]:
        for locale in WORDS:
            try:
                open_demo(locale, width)
                button(locale, 'start').click()
                for _ in range(3):
                    button(locale, 'next').click()
                assert page.evaluate('document.documentElement.scrollWidth <= innerWidth + 1')
                checks += 1
            except Exception as error:
                failures.append({'default_motion': locale, 'width': width, 'error': str(error)[:800]})
    browser.close()

print(json.dumps({'checks': checks, 'failures': failures, 'external': external, 'pageerrors': pageerrors, 'zoom': 'CSS 200%, approximation, not native'}, ensure_ascii=False, indent=2))
assert not failures and not external and not pageerrors
