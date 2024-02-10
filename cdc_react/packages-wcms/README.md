# TemplatePackage-React

This package includes assets and components needed to recreate the CDC site header, site title, and footer.

## Install package from GitHub

GitHub has the latest instructions for installing packages from GitHub here:
- https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry#installing-a-package

Effectively:

1. **Create token:** Go to https://github.com/settings/tokens to create a Developer Access token. Your Token will only need `read:packages` scope permission. Better to use less than more.
2. Once your token is created, *copy the token string value*, then click **Configure SSO**, and **Authorize** for CDCEnt Github Org.
3. There's two ways to authenticate from here:
   - **npm login:** From your root repo, commandline, run <br/>
   ```
	 npm login --auth-type=legacy --registry=https://npm.pkg.github.com  --scope=@cdcent --always-auth
	```
	It will ask for login info, and you'll use your token as the account password.
   - **.npmrc file:** Create an `.npmrc` file in your root with these contents (replace TOKEN with your token):
   ```
   cd cdc-react
  echo " @cdcent:registry=https://npm.pkg.github.com/" > .npmrc
  echo "//npm.pkg.github.com/:_authToken=${{ secrets.GITHUB_TOKEN }}" > .npmrc
   ```
   ⚠️ **Important:** Make sure `.npmrc` is in your `.gitignore`. It's your login credentials, shouldn't exist in your repo.
4. If you've done this successfully, you should be able to install this like any other npm library:
   ```bash
	npm install @cdcent/templatepackage-react
	```

## Requirements

- [react](https://www.npmjs.com/package/react) v16+

There are 2 SVG assets included in `CDCHeader`. If you're using webpack, you'll need a rule in your `webpack.config.js` to treat them as assets.

```js
  rules: [
    {
      test: /\.(png|jpe?g|gif|svg)$/i,
      type: 'asset/resource',
    }
    ...
```
## Usage

Once you've installed this package in your local JS project via `npm`, you can include these modules in your main js file:

```js
import { CDCHeader, CDCSiteTitle, CDCBody, CDCFooter } from '@cdcent/templatepackage-react';
// This includes the built CSS files
import '@cdcent/templatepackage-react/assets/css/bootstrap.min.css';
import '@cdcent/templatepackage-react/assets/css/app.min.css';
```

### Themes

Template Package supports 11 themes. `theme-blue` is included in `app.min.css` by default. To use, add a class to your page body element:

```html
<body class="theme-blue">
```
For the other themes, you'll need to include the associated theme css and use its associated `theme-<color>` class.

```
theme-amber.min.css
theme-brown.min.css
theme-cyan.min.css
theme-green.min.css
theme-indigo.min.css
theme-orange.min.css
theme-pink.min.css
theme-purple.min.css
theme-slate.min.css
theme-teal.min.css
```

[More info on available colors here](https://static.prototype.cdc.gov/TemplatePackage/4.0/gallery/utilities/colors.html)

### Favicon

The default CDC favicon is available in `assets/imgs/favicon.ico`. Either pull it in ask with the SVGs in webpack config, or copy to your public folder and reference appropriately.

```html
<link rel="icon" href="%PUBLIC_URL%/assets/imgs/favicon.ico" />
```

### Icon font

Template Package includes a icon webfont file that adds a host of icons from FontAwesome 5 as well as created icons. The full list can be seen here.

https://static.prototype.cdc.gov/TemplatePackage/4.0/gallery/utilities/icons.html

```html
<span class="cdc-icon-globe_03"></span>
```

### Bootstrap styles

Template Package is built on top of Bootstrap 4, so it includes all core Bootstrap styles and additional styles for our modules. Some more information on available styles:

https://static.prototype.cdc.gov/TemplatePackage/4.0/gallery/utilities/styles.html

### Adobe Analytics

- copy the following into the bottom of the <body> of your index.html page:

```html
<!-- Begin Adobe Analytics code version: JS-2.0 -->
<script src="%REACT_APP_CDC_PATH%/JScript/metrics/topic_levels.js"></script>
<script src="%REACT_APP_CDC_PATH%/JScript/metrics/adobe/analytics_cdcgov.js"></script>
<noscript>
  <a href="https://cdc.112.2o7.net">
    <img
      src="https://cdc.112.2o7.net/b/ss/cdcgov/1/H.21--NS/01/H.21--NS/0"
      height="1"
      width="1"
      alt="Web Analytics"
    />
  </a>
</noscript>
<!--/DO NOT REMOVE/-->
<!-- End Adobe Analytics code version: JS-2.0 -->
```

Set the following environment variables to tell your `index.html` which server to point to for the Analytics collection:

- create a `.env` file, and add the variable
  `REACT_APP_CDC_PATH=https://www.cdc.gov`
- create a `.env.development.local` file, and add the variable
  `REACT_APP_CDC_PATH=https://wwwdev.cdc.gov`

**IMPORTANT**
`wwwdev.cdc.gov` reports to the "test" Adobe Analytics suite, and is accessible to everyone from the intranet. `.env` is used at build time so you may need to set up some external proxy server like NGINX. There are many ways to do this that are out of scope, however make sure this is figured out before dev deployment.

If you are using NGINX make a proxy route to `/JScript` which will point that path to `www.cdc.gov` and then set the `REACT_APP_CDC_PATH=` to nothing in the `.env` file. This will remove the path at build time and let nginx handle the rest.

## React Components

Currently the components are quite flat, just enough to render the same site header and footer used by the rest of CDC. If you have any questions about page structure or elements, or Template Package in general, send an email to wcms@cdc.gov.

### CDCHeader

Accepts props:

- `search`: boolean [default true] enable / disable display of header search

```jsx
  <CDCHeader search={ true }></CDCHeader>
```

### CDCSiteTitle

Accepts props:

- `title`: The site title
- `tagline`: A tagline under the site title

```jsx
  <CDCSiteTitle
    title="Demo Site"
    tagline="Demo tagline"
  >
  </CDCSiteTitle>
```

### CDCBody

Displays children inside a body wrapper.

```jsx
  <CDCBody>
    <h2>Test</h2>
    <p>
      Site content
    </p>
    ...
  </CDCBody>
```

### CDCFooter

Accepts no props.

```jsx
  <CDCFooter></CDCFooter>
```

## More Information

Template Package is maintained by the WCMS / TP team with OADC, in the repo:
https://github.com/cdcent/TemplatePackage

Feel free to submit issues to this repo. More information is available here:

- [Metrics Guide](http://intranet.cdc.gov/cdcweb/web/metrics/adobe-analytics/metrics-application-guidance.html)
- [Template Package gallery](https://static.prototype.cdc.gov/TemplatePackage/4.0/gallery/)
- [Template Package gallery: Icons](https://static.prototype.cdc.gov/TemplatePackage/4.0/gallery/utilities/icons.html)
- [Template Package gallery: Styles](https://static.prototype.cdc.gov/TemplatePackage/4.0/gallery/utilities/styles.html)
