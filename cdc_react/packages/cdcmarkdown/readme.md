# @cdc/cdcmarkdown

`<CDCMarkdown />` is a React component produced by the CDC for importing markdown data from a separate source link.

## Installation and Usage

1. Install the package in your React project `npm install @cdc/cdcmarkdown`
2. Import the component and begin using in your code.

```JSX
import CDCMarkdown from '@cdc/cdcmarkdown'

function App() {

  return (
    <div className="App">
      <CDCMarkdown config={configObj} />
    </div>
  );
}

export default App;
```

Note, you must pass in a configuration object. Configuration objects can be created with the [Editor package](https://github.com/CDCgov/cdc-open-viz/tree/main/packages/editor).
