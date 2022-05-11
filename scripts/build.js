import { fileURLToPath } from 'node:url';
import process from 'node:process';
import { build, serve } from 'esbuild';
import htmlPlugin from '@chialab/esbuild-plugin-html';

if (process.argv.includes('--help') || process.argv.includes('-h')) {
	console.log(`\
Usage: node scripts/build.js [options]

Options:
  --production  Minify, disable sourcemap and devtools
  --watch       Watch for changes
  --serve       Create a server (implies --watch)

Environment variables:
  NODE_ENV=production  Equivalent to --production
  PORT                 Custom server port`);
}

const isProduction = process.env.NODE_ENV === 'production'
	|| process.argv.includes('--production');

const shouldServe = process.argv.includes('--serve');
const shouldWatch = shouldServe || process.argv.includes('--watch');

/** @type {import('esbuild').BuildOptions} */
const buildOptions = {
	absWorkingDir: resolvePath('..'),
	entryPoints: ['src/index.html'],
	outdir: 'public',
	assetNames: 'assets/[name]-[hash]',
	chunkNames: '[ext]/[name]-[hash]',
	format: 'esm',
	bundle: true,
	watch: shouldWatch,
	minify: isProduction,
	sourcemap: !isProduction,
	inject: isProduction ? undefined : [
		resolvePath('enable-devtools.js'),
	],
	plugins: [
		htmlPlugin(),
	],
};

if (isProduction) {
	console.log('Currently in a production environment.');
}

const result = await build(buildOptions);

if (shouldServe) {
	const port = Number(process.env.PORT) || undefined;

	const server = await serve({
		port,
		host: 'localhost',
		servedir: 'public',
	}, {});

	const host = server.host === '127.0.0.1' ? 'localhost' : server.host;
	console.log(`Serving at http://${host}:${server.port}.`);

	process.once('SIGINT', () => {
		console.log('\rStopping the server…');
		server.stop();
		result.stop?.();
		process.exit(0);
	});
} else if (shouldWatch) {
	console.log('Watching for changes…');

	process.once('SIGINT', () => {
		console.log('\rStopping…');
		result.stop?.();
		process.exit(0);
	});
}

/** @param {string} path */
function resolvePath (path) {
	return fileURLToPath(new URL(path, import.meta.url));
}
