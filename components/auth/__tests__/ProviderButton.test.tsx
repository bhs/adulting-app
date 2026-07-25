/**
 * @jest-environment node
 */
import { describe, it, expect } from '@jest/globals'
import { renderToStaticMarkup } from 'react-dom/server'
import { ProviderButton } from '../ProviderButton'

/**
 * These render the component to static markup (no testing-library dependency,
 * matching the repo's lightweight testing setup) and assert on the output.
 */
describe('ProviderButton', () => {
  it('renders a submit button with the provider label', () => {
    const html = renderToStaticMarkup(
      <ProviderButton provider="google" label="Sign in with Google" />
    )

    expect(html).toContain('type="submit"')
    expect(html).toContain('Sign in with Google')
  })

  it('renders the correct brand mark per provider', () => {
    const google = renderToStaticMarkup(
      <ProviderButton provider="google" label="Sign in with Google" />
    )
    const microsoft = renderToStaticMarkup(
      <ProviderButton provider="microsoft" label="Sign in with Microsoft" />
    )

    // Google's mark uses its four brand colors; Microsoft's uses its own.
    expect(google).toContain('#4285F4')
    expect(microsoft).toContain('#F25022')
    expect(microsoft).not.toContain('#4285F4')
    // The decorative icon is hidden from assistive tech.
    expect(google).toContain('aria-hidden="true"')
  })

  it('forwards extra props such as disabled and className', () => {
    const html = renderToStaticMarkup(
      <ProviderButton
        provider="microsoft"
        label="Sign in with Microsoft"
        disabled
        className="mt-4"
      />
    )

    expect(html).toContain('disabled')
    expect(html).toContain('mt-4')
  })
})
