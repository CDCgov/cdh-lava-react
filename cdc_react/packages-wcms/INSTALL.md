## To install @cdcent/templatepackage-react

Full information on installing packages from GitHub can be [found here](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry#authenticating-to-github-packages).

### 1. Generate a GitHub Personal Access Token (PAT)

Details on generating tokens can be [found here](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry#authenticating-to-github-packages).

Start by going to this page:
https://github.com/settings/tokens

Generate a new Token, setting an appropriate expiration (up to 1 year), and ensure it has `read:packages` permission at a minimum. Grant more permissions if you plan on using `npm` to publish packages or perform other actions in GitHub.

You'll receive a hash string token. **Copy it**, as you won't have access to it after it's first generated.

### 2. Add `.npmrc` to `.gitignore`

In step 3, you'll create an `.npmrc` file with your personal access token, so ensure up front you won't include it in your repo / share with others.

> If you have valid `.npmrc` files in your project, you can later refine the exact `.npmrc` file to ignore by path (ex: `/.npmrc`)

### 3. Create a .npmrc file in your project

This should live next to your `package.json` file. It's contents should include this line, if one exists:
```
//npm.pkg.github.com/:_authToken=TOKEN
```
Where `TOKEN` is your personal access token.

### 4. Authenticate npm with your registry

Run this command, supplying your GitHub username, personal access token, and GitHub email address.

```
$ npm login --scope=@cdcent --registry=https://npm.pkg.github.com

> Username: USERNAME
> Password: TOKEN
> Email: PUBLIC-EMAIL-ADDRESS
```

### 5. Install your dependencies

At this point you'll have access to `@cdcent` packages. You can add to `package.json` and `npm install`, or run:

```
npm install @cdcent/templatepackage-react
```
