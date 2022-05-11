import { h, render } from 'preact';
import { useState } from 'preact/hooks';

const App = () => {
	const [value, setValue] = useState(0);

	return <main>
		<h1>Hello, World!</h1>
		<p>Count: {value}</p>
		<button onClick={() => setValue(value + 1)}>Increment</button>
	</main>;
};

render(<App />, document.body);
