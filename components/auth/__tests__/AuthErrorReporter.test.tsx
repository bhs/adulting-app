/**
 * @jest-environment node
 */
import { describe, it, expect } from '@jest/globals'
import { renderToStaticMarkup } from 'react-dom/server'
import { AuthErrorReporter } from '../AuthErrorReporter'

describe('AuthErrorReporter', () => {
  it('renders an accessible alert when an error is present', () => {
    const html = renderToStaticMarkup(
      <AuthErrorReporter error="AccessDenied" />
    )

    expect(html).toContain('role="alert"')
    expect(html).toContain('couldn')
  })

  it('renders nothing when there is no error', () => {
    const html = renderToStaticMarkup(<AuthErrorReporter />)

    expect(html).toBe('')
  })
})
