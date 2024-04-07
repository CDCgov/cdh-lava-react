# @cdc/cdcheader

[![npm](https://img.shields.io/npm/v/@cdc/cdcheader)](https://www.npmjs.com/package/@cdc/cdcheader)

`<CDCHeader />` is a React component produced by the CDC for displaying a standard page header.  

## Install and Test CDCHeader Component Indiviually

Run the following commands in the terminal to install and test the CDDSidebar component individually.

```sh
cd ../../../..
cd cdc-react/packages/cdccore
sudo yarn link
cd ../../../..
cd cdc-react/packages/cdcheader
sudo yarn link  @cdc/cdccore
sudo yarn install
sudo yarn run build
sudo yarn run start
```

## Installation and Usage

1. Install the package in your React project `npm install @cdc/cdcheader`
2. Import the component and begin using in your code.

```JSX
import CDCHeader from '@cdc/cdcheader'

function App() {

  return (
    <div className="App">
      <CDCHeader config={configObj} />
    </div>
  );
}

export default App;
```

Note, you must pass in a configuration object. Configuration objects can be created with the [Editor package](https://github.com/CDCgov/cdc-open-viz/tree/main/packages/editor).

## Properties

| Property | Type   | Description                                                                                                                      |
| -------- | ------ | -------------------------------------------------------------------------------------------------------------------------------- |
| config   | String | A JavaScript object with the configuration for the header. Pass either this or the configUrl property to setup your chart. |
