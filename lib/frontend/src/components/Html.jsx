import React from 'react'

export default function Html({
  helmet,
  scripts,
  links,
  window,
  app,
  children,
  extraScript,
}) {
  // Normalize
  scripts = scripts.map(s => (typeof s === 'object' ? s : { src: s }))
  links = links.map(
    l =>
      typeof l === 'object'
        ? { rel: 'stylesheet', ...l }
        : { rel: 'stylesheet', href: l }
  )

  return (
    <html
      lang="en"
      prefix="og: http://ogp.me/ns#"
      {...helmet.htmlAttributes.toComponent()}
    >
      <head>
        {helmet.title.toComponent()}
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta httpEquiv="Content-Language" content="fr" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {helmet.meta.toComponent()}
        {helmet.base.toString() ? helmet.base.toComponent() : <base href="/" />}
        {links.map(attrs => <link key={attrs.href} {...attrs} />)}
        {helmet.link.toComponent()}
        {helmet.style.toComponent()}
        {helmet.script.toComponent()}
        {helmet.noscript.toComponent()}
      </head>
      <body {...helmet.bodyAttributes.toComponent()}>
        <div
          id="root"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={app && { __html: app }}
        >
          {children}
        </div>
        {window && (
          <script
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{
              __html: Object.keys(window).reduce(
                (out, key) =>
                  (out += `window.${key}=${JSON.stringify(window[key])};`),
                ''
              ),
            }}
          />
        )}
        {scripts.map(attrs => <script key={attrs.src} {...attrs} />)}
        {extraScript && (
          <script
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: extraScript }}
          />
        )}
      </body>
    </html>
  )
}
