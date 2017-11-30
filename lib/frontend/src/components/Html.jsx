import React from 'react'

export default function Html({ helmet, js, css, window, app, children }) {
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
        <link rel="stylesheet" href={css} />
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
        <script
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html:
              window &&
              Object.keys(window).reduce(
                (out, key) =>
                  (out += `window.${key}=${JSON.stringify(window[key])};`),
                ''
              ),
          }}
        />
        {js.map(src => <script key={src} src={src} />)}
      </body>
    </html>
  )
}
