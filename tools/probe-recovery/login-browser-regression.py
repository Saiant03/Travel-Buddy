#!/usr/bin/env python3
"""Offline-only browser regression for the public probe bundle.

Every page and Firebase response is fulfilled by Playwright routes. The test
uses fake credentials/tokens and aborts every unexpected request.
"""

import json
import argparse
from pathlib import Path
from urllib.parse import urlsplit

from playwright.sync_api import sync_playwright

GENERIC_ERROR = 'Operația nu a putut fi încheiată.'
TEST_ORIGIN = 'https://console-probe.test'
HTML = '''<!doctype html>
<html lang="ro"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width">
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self' https://identitytoolkit.googleapis.com; form-action 'none'; base-uri 'none'">
<title>Local login regression</title></head><body><main id="app" aria-live="polite"></main><script src="/bundle.js"></script></body></html>'''


def run_case(bundle_path: Path, outcome: str, verified: bool | None = None):
    bundle = bundle_path.read_text()
    post_paths = []
    unexpected_requests = []
    page_errors = []
    console_errors = []

    def route_request(route):
        request = route.request
        parsed = urlsplit(request.url)
        if parsed.netloc == 'console-probe.test':
            if parsed.path == '/':
                return route.fulfill(status=200, content_type='text/html; charset=utf-8', body=HTML)
            if parsed.path == '/bundle.js':
                return route.fulfill(status=200, content_type='text/javascript; charset=utf-8', body=bundle)
            if parsed.path == '/probe/public-config' and request.method == 'GET':
                return route.fulfill(
                    status=200,
                    content_type='application/json',
                    headers={'cache-control': 'no-store'},
                    body=json.dumps({
                        'firebaseProjectId': 'travel-buddy-b3f48',
                        'firebaseWebApiKey': 'LOCAL_FAKE_KEY_NOT_SENT',
                    }),
                )
            unexpected_requests.append(f'local:{request.method}:{parsed.path}')
            return route.abort()

        if parsed.hostname == 'identitytoolkit.googleapis.com':
            cors = {
                'access-control-allow-origin': '*',
                'access-control-allow-methods': 'POST, OPTIONS',
                'access-control-allow-headers': 'content-type',
                'access-control-max-age': '0',
            }
            if request.method == 'OPTIONS':
                return route.fulfill(status=204, headers=cors)
            if request.method != 'POST':
                unexpected_requests.append(f'auth:{request.method}:{parsed.path}')
                return route.abort()

            endpoint = parsed.path.rsplit('/', 1)[-1]
            post_paths.append(endpoint)
            if endpoint == 'accounts:signInWithPassword':
                if outcome == 'invalid':
                    body = {'error': {'message': 'INVALID_LOGIN_CREDENTIALS'}}
                    return route.fulfill(status=400, headers=cors, content_type='application/json', body=json.dumps(body))
                body = {'localId': 'synthetic-local-uid', 'idToken': 'synthetic-id-token'}
                return route.fulfill(status=200, headers=cors, content_type='application/json', body=json.dumps(body))
            if endpoint == 'accounts:lookup' and outcome in ('verified', 'unverified'):
                body = {'users': [{'localId': 'synthetic-local-uid', 'emailVerified': verified}]}
                return route.fulfill(status=200, headers=cors, content_type='application/json', body=json.dumps(body))

            unexpected_requests.append(f'auth:unexpected:{endpoint}')
            return route.abort()

        # No request may leave the local test. This also blocks real Firebase.
        unexpected_requests.append(f'external:{parsed.hostname or "unknown"}')
        return route.abort()

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, executable_path='/usr/bin/chromium', args=['--no-sandbox'])
        context = browser.new_context(service_workers='block', ignore_https_errors=False)
        page = context.new_page()
        page.on('pageerror', lambda error: page_errors.append(str(error)))
        page.on('console', lambda message: console_errors.append(message.text) if message.type == 'error' else None)
        page.route('**/*', route_request)
        response = page.goto(TEST_ORIGIN, wait_until='networkidle', timeout=15000)
        assert response and response.status == 200, 'local fixture page did not load'
        page.locator('#config-status').filter(has_text='Configurarea Firebase este disponibilă').wait_for(timeout=8000)

        form = page.locator('.slot-form[data-slot="alpha"]')
        # These values are synthetic and are sent only to the route stub above.
        form.locator('input[name="email"]').fill('fixture@example.invalid')
        form.locator('input[name="password"]').fill('fixture-only-password')
        form.get_by_role('button', name='Autentifică Alpha').click()

        if outcome == 'invalid':
            page.locator('#results').filter(has_text=GENERIC_ERROR).wait_for(timeout=8000)
        elif outcome == 'verified':
            page.locator('.slot-form[data-slot="alpha"] .session').filter(has_text='Autentificat · email confirmat').wait_for(timeout=8000)
        elif outcome == 'unverified':
            page.locator('.slot-form[data-slot="alpha"] .session').filter(has_text='Autentificat · email neconfirmat').wait_for(timeout=8000)

        observed = {
            'post_paths': list(post_paths),
            'unexpected_request_count': len(unexpected_requests),
            'page_error_count': len(page_errors),
            'console_error_count': len(console_errors),
        }
        body_text = page.locator('body').inner_text()

        assert not unexpected_requests, f'unexpected request attempted: {unexpected_requests[0]}'
        assert not page_errors, f'page error count was {len(page_errors)}'
        if outcome == 'invalid':
            assert len(console_errors) <= 1 and (not console_errors or 'status of 400' in console_errors[0]), (
                f'unexpected invalid-credential console errors: {len(console_errors)}'
            )
        elif console_errors:
            safe_console = console_errors[0].replace('LOCAL_FAKE_KEY_NOT_SENT', '[redacted-key]')
            safe_console = safe_console.replace('fixture@example.invalid', '[redacted-email]')
            safe_console = safe_console.replace('fixture-only-password', '[redacted-password]')
            safe_console = safe_console.replace('synthetic-id-token', '[redacted-token]')
            assert False, f'console error count was {len(console_errors)}; first: {safe_console[:400]}'

        if outcome == 'invalid':
            assert GENERIC_ERROR in body_text, 'privacy-safe generic error was not rendered'
            assert 'INVALID_LOGIN_CREDENTIALS' not in body_text, 'provider detail leaked into the UI'
            assert post_paths == ['accounts:signInWithPassword'], f'expected sign-in request, observed {post_paths}'
        else:
            assert post_paths == ['accounts:signInWithPassword', 'accounts:lookup'], f'wrong auth flow: {post_paths}'
            if outcome == 'unverified':
                assert page.locator('#access').is_disabled(), 'unverified session must not enable protected checks'
            if outcome == 'verified':
                assert not page.locator('#cpu').is_disabled(), 'verified Alpha should enable the Alpha-only CPU check'
                assert page.locator('#access').is_disabled(), 'shared access check needs both verified sessions'

        browser.close()
        return observed


def main():
    parser = argparse.ArgumentParser(description='Run local-only login checks against an original or patched bundle.')
    parser.add_argument('--mode', choices=('original', 'patched'), required=True)
    parser.add_argument('--original-bundle', required=True, help='Path to the unmodified public client bundle.')
    parser.add_argument('--patched-bundle', required=True, help='Path to the locally patched client bundle.')
    args = parser.parse_args()
    bundle = Path(args.original_bundle if args.mode == 'original' else args.patched_bundle)
    if not bundle.is_file():
        parser.error('selected bundle path does not exist')

    if args.mode == 'original':
        result = run_case(bundle, 'invalid')
        print(json.dumps({'mode': args.mode, 'result': result}, indent=2))
        return

    invalid = run_case(bundle, 'invalid')
    unverified = run_case(bundle, 'unverified', verified=False)
    verified = run_case(bundle, 'verified', verified=True)
    print(json.dumps({
        'invalid_credentials': invalid,
        'unverified_sign_in': unverified,
        'verified_sign_in': verified,
        'firebase_network_requests': 'all intercepted by local stubs',
        'real_credentials_used': False,
    }, indent=2))


if __name__ == '__main__':
    main()
