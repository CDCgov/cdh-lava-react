# CDC Data Hub React Web Components

- Project Name: CDC Data Hub Analytics and Visualization Documentation
- GitHub Link: [cdh-dav](https://github.com/cdcgov/cdh-dav)
- Point of contact: [Nishant Nepal](mailto:mailto:zfi4@cdc.gov) [John Bowyer](mailto:zfi4@cdc.gov)
- Organizational unit: DDPHSS/IAD/ADB
- Related projects: OPHDST/IAD/ADB/CDH
- Related investments:  Pending Public Release
- Governance status: Pending Public Release
- Program official:  [Sachin Agnihotri](mailto:sax5@cdc.gov)

## Overview

The CDC Data Hub React Web Client Application performs the last mile (S component - Serving, Sharing and Storytelling) in the IDEAS Framework. The application is a React Single Page Application (SPA) that may be hosted in multiple envronment such as WCMS.  Development of PowerApp React components is also under evaluation.

### React Client Libraries - React / WCMS

| Component         | Tag                | Description                                                                                                                                                            |
| ----------------- | ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| @cdc/cdccore      | n/a                | This is an internal package that is consumed by external facing packages in CDC React Components. The cdccore component contains shared components, styles and assets. |
| @cdc/cdcheader    | `<CDCHeader />`    | `<CDCHeader />` is a React component produced by the CDC for displaying a standard page header.                                                                        |
| @cdc/cdcmarkdown  | `<CDCMarkdown />`  | `<CDCMarkdown />` is a React component produced by the CDC for importing markdown data from a separate source link.                                                    |
| @cdc/cdcsidebar   | `<CDCSidebar />`   | `<CDCSidebar />` is a React component produced by the CDC that displays a sidebar menu.                                                                                |
|                   |
| @cdc/cdcsitetitle | `<CDCSiteTitle />` | `<CDCSiteTitle />` is a React component produced by the CDC that displays a site title menu with breadcrumbs.                                                          |

### Live Demo hosted in WCMS

- [Dev](https://wcms-wp-stage-intradev.cdc.gov/demo/ocoo/index.html)
- [Staging](https://wcms-wp-stage-intralink.cdc.gov/demo/ocoo/index.html)

## Initial Setup to Use CDC React components

### Install package from GitHub

GitHub has the latest instructions for installing packages from GitHub here:

- [GitHub Installation](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry#installing-a-package)


1. Recipe in GitHub to Generate Personal Access Token

- [Team Version](https://publichealthsurveillance.atlassian.net/wiki/x/AQALnw)
- [Intranet Version](https://wcms-wp-intra.cdc.gov/datahub/dashboards/recipes/github_generate_personal_access_token.html)

3. There's two ways to authenticate - use "token" for username and the token path for password, or use an `.npmrc` file.

   - **npm login:*-From your root repo, commandline, run this command:

    ```bash
    npm login --scope=cdcgov --registry=https://npm.pkg.github.com
    ```

    It will ask for login info, and you'll use your token as the account password.

    - **.npmrc file:*-Create an `.npmrc` file in your root with these contents (replace TOKEN with your token):

    ```bash
    cd <your-repo-project dir>
    npm set //npm.pkg.github.com/:_authToken $GITHUB_TOKEN
    echo "@cdcgov:registry=https://npm.pkg.github.com/" > .npmrc
    echo "//npm.pkg.github.com/:_authToken=$GITHUB_TOKEN" >> .npmrc
    echo "always-auth=true" >> .npmrc
    ```

   ⚠️ **Important:*-Make sure `.npmrc` is in your `.gitignore`. It's your login credentials, shouldn't exist in your repo.

4. If you've done this successfully, you should be able to install this like any other npm library:

    ```bash
    npm install cdcgov/cdcreact
    ```

### Requirements

-[react](https://www.npmjs.com/package/react) v16+

There are 2 SVG assets included in `CDCHeader`. If you're using webpack, you'll need a rule in your `webpack.config.js` to treat them as assets.

``` js
  rules: [
    {
      test: /\.(png|jpe?g|gif|svg)$/i,
      type: 'asset/resource',
    }
    ...
```

### Usage

Once you've installed this package in your local JS project via `npm`, you can include these modules in your main js file:

``` js
import { CDCHeader, CDCSiteTitle, CDCBody, CDCFooter } from '@cdcgov/cdcreact';
// This includes the built CSS files
import '@cdcgov/cdcreact/assets/css/bootstrap.min.css';
import '@cdcgov/cdcreact/assets/css/app.min.css';
```

#### Themes

Template Package supports 11 themes. `theme-blue` is included in `app.min.css` by default. To use, add a class to your page body element:

``` html
<body class="theme-blue">
```

For the other themes, you'll need to include the associated theme css and use its associated `theme-<color>` class.

``` html
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

#### Favicon

The default CDC favicon is available in `assets/imgs/favicon.ico`. Either pull it in ask with the SVGs in webpack config, or copy to your public folder and reference appropriately.

```html
<link rel="icon" href="%PUBLIC_URL%/assets/imgs/favicon.ico" />
```

#### Icon font

Template Package includes a icon webfont file that adds a host of icons from FontAwesome 5 as well as created icons. The full list can be seen here.

[CDC Icons](https://static.prototype.cdc.gov/TemplatePackage/4.0/gallery/utilities/icons.html)

```html
<span class="cdc-icon-globe_03"></span>
```

#### Bootstrap styles

Template Package is built on top of Bootstrap 4, so it includes all core Bootstrap styles and additional styles for our modules. Some more information on available styles:

[Bootstrap Style](https://static.prototype.cdc.gov/TemplatePackage/4.0/gallery/utilities/styles.html)

### React Components

Currently the components are quite flat, just enough to render the same site header and footer used by the rest of CDC. If you have any questions about page structure or elements, or Template Package in general, send an email to wcms@cdc.gov.

#### CDCHeader

Accepts props:

-`search`: boolean [default true] enable / disable display of header search

```jsx
  <CDCHeader search={ true }></CDCHeader>
```

#### CDCSiteTitle

Accepts props:

-`title`: The site title
-`tagline`: A tagline under the site title

```jsx
  <CDCSiteTitle
    title="Demo Site"
    tagline="Demo tagline"
  >
  </CDCSiteTitle>
```

#### CDCBody

Displays children inside a body wrapper.

``` jsx
  <CDCBody>
    <h2>Test</h2>
    <p>
      Site content
    </p>
    ...
  </CDCBody>
```

#### CDCFooter

Accepts no props.

``` jsx
  <CDCFooter></CDCFooter>
```

### Set up Git

NOTE: Must Logout of ZScaler

1. Check version

    ```sh
    git --version
    ```

2. If version is not  >= v2.39.0, Install Git

    ```sh
    sudo apt-get install git
    ```

    or

    ```sh
    sudo apt-get upgrade git
    ```

## Modifying and Updating Components

### Prequisites

Follow set up instructions for NodeJS and NPM:

- Run from Ubuntu-20.04, use WSL if Windows
- [NodeJS and NPM Getting Started](../docs/pade_node/readme.md)

### Initial Setup to modify core components

This repository is a [monorepo](https://en.wikipedia.org/wiki/Monorepo) that is managed with [Lerna](https://github.com/lerna/lerna#readme) and uses [yarn](https://yarnpkg.com/) for package management. Make sure you have yarn installed before beginning. To work on individual packages you must setup the entire monorepo.

#### Clean up existing caches

```sh
sudo yarn cache clean
sudo npm cache clean --force
sudo lerna clean
nx cache clear --all
find . -name "node_modules" -type d -prune -exec sudo rm -rf '{}' +
```

#### Setup Yarn

NOTE: MUST LOGOUT: Sign out of ZScaler and run the following

```sh
cd $HOME
npm --version
sudo npm install -g yarn
yarn --version
cd cdc-react
sudo yarn install
```

Make the yarn cache available to all users

```sh
sudo chmod -R 777 /home/[your_alias]/.cache/yarn
```

example

```sh
sudo chmod -R 777 /home/zfi4/.cache/yarn
```

or

```sh
sudo chmod -R 777 /usr/local/share/.cache/yarn/v6
```

#### Setup Lerna

Install Lerna and initialize all the packages for you. NOTE: MUST LOGOUT: Sign out of ZScaler and run the following

```sh
cd cdc-react
sudo yarn global add lerna
sudo yarn install
sudo lerna init
sudo lerna bootstrap
```

#### Setup Vite

NOTE: MUST LOGOUT: Sign out of ZScaler and run the following

1. Install Vite globally using Yarn:

    ```sh
    cd cdc-react
    sudo yarn global add vite
    ```

2. Check if Vite is added to your PATH environment variable. You can check this by running the following command:

    ```sh
    echo $PATH
    ```

3. If you do not see the path to the directory where Vite is installed (e.g., /usr/local/bin), you need to add it to your PATH. You can do this by adding the following line to your shell profile file :

    ```sh
    cd $HOME
    nano .bashrc
    ````

4. Add the following line to the end of the file:

    ```sh
    export PATH="$PATH:/usr/local/bin"
    ```

5. Run the following command to reload the profile file:

    ```sh
    source .bashrc
    ```

### Setup Sass

Run the following command to install Sass globally.

```sh
sudo yarn global add sass
```

### Setup Vitest

Run the following command to install Sass globally.

```sh
sudo yarn global add vitest
sudo yarn global add @vitest/ui
sudo yarn global add jsdom
sudo yarn install
```

### Set up .env Environment Variables

1. Install dotenv.  NOTE: MUST LOGOUT: Sign out of ZScaler and run the following

    ```sh
    sudo yarn add dotenv  -W
    ```

2. Create a .env file in the root of your project using the following command:

    ```sh
    touch .env
    ```

3. Set the following environment variables to tell your `index.html` which server to point to for the Analytics collection:

    ```sh
    cd cdc-react
    nano .env
    ```

4. Add the following lines to the file:

    ```sh
    REACT_APP_CDC_PATH=https://www.cdc.gov
    ```

5. create an `.env.development.local` file

    ```sh
    touch .env.development.local
    ```

6. Set the following environment variables to tell your `index.html` which server to point to for the Analytics collection:

    ```sh
    cd cdc-react
    nano env.development.local
    ```

7. Add the variable

  ```sh
  REACT_APP_CDC_PATH=https://wwwdev.cdc.gov
  ```

### Setup Adobe Analytics

-copy the following into the bottom of the <body> of your index.html page:

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

**IMPORTANT**
`wwwdev.cdc.gov` reports to the "test" Adobe Analytics suite, and is accessible to everyone from the intranet. `.env` is used at build time so you may need to set up some external proxy server like NGINX. There are many ways to do this that are out of scope, however make sure this is figured out before dev deployment.

If you are using NGINX make a proxy route to `/JScript` which will point that path to `www.cdc.gov` and then set the `REACT_APP_CDC_PATH=` to nothing in the `.env` file. This will remove the path at build time and let nginx handle the rest.

#### Build All Components

Run the following command to build all of the packages in the correct order.

```sh
cd cdc-react
sudo lerna run build --stream --verbose
```

#### Build Individual Components

To begin working on an individual package, run the following, replacing `package_name` with the package's name (ex: `@cdc/map`).

```sh
cd cdc-react
sudo lerna run --scope @cdc/package_name start
```

#### Run Individual Components - cdccore

```sh
cd cdc-react
sudo lerna run  --scope @cdc/cdccore start  --verbose
```

#### Run Individual Component - cdcmarkdown

```sh
cd cdc-react
sudo lerna run  --scope @cdc/cdcmarkdown start  --verbose
```

#### Run Individual Component - cdcsitetitle

```sh
cd cdc-react
sudo npx lerna run  --scope @cdc/cdcsitetitle start  --verbose
```

#### Run Individual Component - cdcheader

```sh
cd cdc-react
sudo npm run  --scope @cdc/cdcheader start  --verbose
```

#### Run Individual Component - cdcsidebar

```sh
cd cdc-react
sudo npm run  --scope @cdc/cdcsidebar start  --verbose
```

### TemplatePackage-React

This package includes assets and components needed to recreate the CDC site header, site title, and footer.

### Set up GitHub Security: Option 1: Credential Manager: On Windows

GCM is included with [Git for Windows](https://gitforwindows.org/). During installation you will be asked to select a credential helper, with GCM listed as the default.

### Set up GitHub Security: Option 1: Credential Manager: On Ubuntu: Primary

Reference: [Microsoft Learn](https://learn.microsoft.com/en-us/windows/wsl/tutorials/wsl-git)
Reference: [GitHub](https://github.com/git-ecosystem/git-credential-manager/blob/release/docs/credstores.md)
Reference: [GitHub Env](https://github.com/git-ecosystem/git-credential-manager/blob/3ffa1900b4360e3041e3e2ce74a5fc8ca4b56e10/docs/environment.md)
NOTE: Must Logout of ZScaler

1. cd $HOME

    NOTE: LOG OUT OF ZSCALER

2. Download

    ```sh
    wget "https://github.com/GitCredentialManager/git-credential-manager/releases/download/v2.0.886/gcm-linux_amd64.2.0.886.deb" -O /tmp/gcmcore.deb
    ```

3. Once the script is downloaded, make it executable by running:

    ```sh
    sudo dpkg -i /tmp/gcmcore.deb
    ```

4. This will install Git Credential Manager Core on your Ubuntu system.

    ```sh
    git-credential-manager configure
    ```

5. Update .bashrc to set the credential type to cache

    ```sh
    cd $HOME
    nano ~/.bashrc
    export GCM_CREDENTIAL_STORE=cache
    export GCM_PROVIDER=github
    source ~/.bashrc
    ```

    or use git config

    ```sh
    git config --global credential.credentialStore cache
    ```

6. Set Helper

    ```sh
    git-credential-manager configure
    ```

7. Save User Name

    ``` sh
    git config --global user.name "John Bowyer"
    git config --global user.email  "jcbowyer@hotmail.com"
    git credential-manager store
    ```

If everything is installed correctly, this command will output the version number of Git Credential Manager Core.

### Set up GitHub Security: Option 2 SSH

#### Check for existing SSH keys

1. Open Terminal.

2. Enter ls -al ~/.ssh to see if existing SSH keys are present.

    ```sh
    $ ls -al ~/.ssh
    # Lists the files in your .ssh directory, if they exist
    ```

3. Check the directory listing to see if you already have a public SSH key. By default, the filenames of supported public keys for GitHub are one of the following.

    - id_dsa.pub
    - id_ecdsa.pub
    - id_ed25519.pub

4. Either generate a new SSH key or upload an existing key.

    - If you don't have a supported public and private key pair, or don't wish to use any that are available, generate a new SSH key.

    - If you see an existing public and private key pair listed (for example, id_rsa.pub and id_rsa) that you would like to use to connect to GitHub, you can add the key to the ssh-agent.

#### Generate SSH keys if missing

1. Open Terminal

2. Paste the text below, substituting in your GitHub email addres

    ```sh
    ssh-keygen -t ed25519 -C "your_email@example.com"
    ```

3. Log in to your GitHub account and navigate to your account settings.

4. Click on "SSH and GPG keys" in the left sidebar.

5. Find the incorrect key in the list of SSH keys and click "Delete".

6. Click on "New SSH key" and give the key a title.

7. Paste your new public key into the "Key" field and click "Add SSH key".

#### Add Your Key to GitHub

1. Open Terminal.

2. nano ~/.ssh/id_ed25519.pub

3. Copy the SSH public key to your clipboard.

4. In the upper-right corner of any page, click your profile photo, then click Settings.

5. In the upper-right corner of any page, click your profile photo, then click Settings.

6. Click New SSH key or Add SSH key.

7. In the "Title" field, add a descriptive label for the new key. For example, if you're using a personal laptop, you might call this key "Personal laptop".

8. Select the type of key, either authentication or signing. For more information about commit signing, see "About commit signature verification."

9. Paste your public key into the "Key" field.

10. Click Add SSH key.

11. Authorize the key

### How to Publish an NPM Package to GitHub Packages on Windows

This guide outlines the steps to publish an NPM package to GitHub Packages from a Windows environment.

## 1. Set `NODE_AUTH_TOKEN` Environment Variable

Set the `NODE_AUTH_TOKEN` environment variable with your GitHub token:

- **Using Command Prompt:**
  setx NODE_AUTH_TOKEN "Your_GitHub_Token"

- **Using PowerShell:**
  [System.Environment]::SetEnvironmentVariable('NODE_AUTH_TOKEN', 'Your_GitHub_Token', [System.EnvironmentVariableTarget]::User)
  Replace `Your_GitHub_Token` with your actual GitHub token.

## 2. Update `.gitignore` in Project Root

Exclude `.npmrc` in your `.gitignore` file:
*.npmrc

## 3. Create a `.npmrc` File in the Root of the Project

Navigate to your project directory and create `.npmrc`:

```sh
cd path\to\your\project
echo "@cdcgov:registry=https://npm.pkg.github.com/" > .npmrc
echo "//npm.pkg.github.com/:_authToken=%NODE_AUTH_TOKEN%" >> .npmrc
```

## 4. Login to NPM with GitHub Registry

```sh
npm login --registry=https://npm.pkg.github.com/ --scope=@cdcgov --always-auth
```

When prompted, enter your GitHub username, GitHub token as the password, and your email address.

## 5. Create and Publish Your NPM Package

- Initialize your package (if not already done):

```sh
npm init
```

- Set the version according to your format:

```sh
npm version 202304.0.0
```

If you're using Lerna:

```sh
lerna version --major 202304
```

- Publish your package:

```sh
npm publish --registry https://npm.pkg.github.com/@cdcgov
```

## 6. Check Package Access and Status

```sh
npm access list packages --scope=@cdcgov
npm access get status @cdcgov/cdc-react
```

Remember to replace placeholders like `path\to\your\project` and `Your_GitHub_Token` with your actual project path and GitHub personal access token.

### How to Publish Your REACT NPM Package To GitHub on Ubuntu

To publish an NPM package to GitHub, you will first need to create an NPM account if you haven't already. Once you have an account, you can follow these steps:

1. Add NODE_AUTH_TOKEN to .bashrc

    ```sh
    cd $HOME
    nano ~/.bashrc
    export NODE_AUTH_TOKEN=$GITHUB_TOKEN
    source ~/.bashrc
    ```

2. Update .gitignore in project root to exclude .npmrc

    ```sh
    *.npmrc
    ```

3. Create a .nprc file in the root of the project

    ```sh
    cd cdc-react
    echo "@cdcgov:registry=https://npm.pkg.github.com/" > .npmrc
    echo "//npm.pkg.github.com/:_authToken=$GITHUB_TOKEN" >> .npmrc
    ```

4. Login

    ```sh
    npm login --registry=https://npm.pkg.github.com/ --scope=@cdcgov --always-auth --_authToken=<YOUR_GITHUB_TOKEN>
    ```

5. Create your NPM package: Once your repository is created, you can start creating your NPM package. You can do this by running the npm init command in your terminal to create a new package.json file. Then, you can add your code and dependencies as you normally would.  For PADE, our NPM Package is stored in the cdc-react folder.

    Create a version with the YYYYMMM.RELEASE.PATCH:  Example: 202304.0.0

    ```sh
    npm version 202304.0.0
    lerna version --major 202304
    ```

6. Publish your package to NPM: To publish your NPM package to the NPM registry, run npm login to log in to your NPM account and authenticate yourself. Then, run npm publish to publish your package to the registry. Make sure to specify the correct version number in your package.json file before publishing.

    ```sh
    npm access list packages scope:@cdcgov
    npm access get status @cdcgov/cdc-react
    npm publish -registry https://npm.pkg.github.com/cdcgov --scope=cdcgov
    ```

### More Information

Template Package is maintained by the WCMS / TP team with OADC, in the repo: [CDC WCMS Template Repository](https://github.com/cdcgov/TemplatePackage)

Feel free to submit issues to this repo. More information is available here:

-[Metrics Guide](http://intranet.cdc.gov/cdcweb/web/metrics/adobe-analytics/metrics-application-guidance.html)
-[Template Package gallery](https://static.prototype.cdc.gov/TemplatePackage/4.0/gallery/)
-[Template Package gallery: Icons](https://static.prototype.cdc.gov/TemplatePackage/4.0/gallery/utilities/icons.html)
-[Template Package gallery: Styles](https://static.prototype.cdc.gov/TemplatePackage/4.0/gallery/utilities/styles.html)

### Troubleshooting

#### Problem - can't load svg image in react

-[Reference Article](https://blog.logrocket.com/how-to-use-svgs-react/)

#### Problem - .yarn-metadata.json: Unexpected end of JSON input

This error typically indicates that there was a problem with the installation or caching of a package using Yarn. To resolve this error, you can try the following steps:

Clear the Yarn cache by running the following command:

```bash
yarn cache clean
```

Delete the .yarn-metadata.json file in the rxjs package directory:

```bash
sudo rm /usr/local/share/.cache/yarn/v6/npm-rxjs-7.8.0-90a938862a82888ff4c7359811a595e14e1e09a4-integrity/node_modules/rxjs/.yarn-metadata.json
```

If these steps don't resolve the error, you may need to try updating or reinstalling Yarn itself.

#### Problem: Unable to connect to GitHub with ssh: @github.com: Permission denied (publickey).

Warning: Permanently added the ECDSA host key for IP address '140.82.114.3' to the list of known hosts.
jcbowyer@github.com: Permission denied (publickey).
git@github.com: Permission denied (publickey).

Solution:

Check your keys

```bash
cd $HOME/.ssh
ls -al
```

Check that your SSH key has the appropriate permissions. The SSH key should have read-only permissions, which you can set by running the following command:

``` bash
chmod 400 ~/.ssh/known_hosts
```

Verify that your SSH key is added to the ssh-agent. You can add your key to the ssh-agent by running the following command:

``` bash
ssh-add ~/.ssh/known_hosts
```

Ensure that you have the correct remote URL for your Git repository. You can check the remote URL by running the following command:

``` bash
git remote -v
```

If the URL is incorrect, you can update it using the following command:

``` bash
git remote set-url origin git@github.com:<username>/<repository>.git
```

Replace <username> with your GitHub username and <repository> with the name of your Git repository.

#### Problem: Division Fails in SASS

Article: [Stack Overflow](https://stackoverflow.com/questions/67688301/using-math-div-instead-of-in-scss)

Solution:

```sh
sudo yarn global  add sass-migrator
sudo yarn install --force
# Run the codemod on all .scss files recursively from the working directory
sudo sass-migrator division **/*.scss
```
