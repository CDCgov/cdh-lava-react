# @cdc/cdcsitetitle

`<CDCSiteTitle />` is a React component produced by the CDC that displays a site title menu with breadcrumbs.

## Installation and Usage

1. Install the package in your React project `npm install @cdc/cdcsitetitle`
2. Import the component and begin using in your code.

```JSX
import CDCSiteTitle from '@cdc/cdcsitetitle'

function App() {

  return (
    <div className="App">
      <CDCSiteTitle config={configObj} />
    </div>
  );
}

export default App;
```

Note, you must pass in a configuration object. Configuration objects can be created with the [Editor package](https://github.com/CDCgov/cdc-open-viz/tree/main/packages/editor).

## Set up Development Environment

Run the following:

```sh
sudo rm -rf node_modules
sudo yarn cache clean
sudo yarn install
sudo lerna run build
sudo lerna run start
vite --open
npx vite build
vite preview
```

## Run Individual Components - cdcsitetitle

Run the following:

```sh
cd cdc-react
sudo lerna run  --scope @cdc/cdcsitetitle start  --verbose
```

## To Debug Startup

Run the following:

```sh
sudo vite --open
```
