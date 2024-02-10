# @cdc/cdcsidebar

`<CDCSidebar />` is a React component produced by the CDC that displays a sidebar menu.

## Installation and Usage

1. Install the package in your React project `npm install @cdc/cdcsidebar`
2. Import the component and begin using in your code.

```JSX
import CDCidebar from '@cdc/cdcsidebar'

function App() {

  return (
    <div className="App" style={{height: '100%'}}>
      <CDCSidebar config={configObj} style={{flexGrow: '1'}} />
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
```

## Install and Test CDCSideBar Component Indiviually

Run the following commands in the terminal to install and test the CDDSidebar component individually.

```sh
sudo vite --open
```

To test in ui

```sh
cd cdc-react/packages/cdcsidebar/src/test
sudo vitest --ui
```
