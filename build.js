const esbuild = require('esbuild');
const watch = process.argv.includes('--watch');

const config = {
  entryPoints: ['src/widget.js'],
  bundle: true,
  minify: true,
  format: 'iife',
  globalName: 'AIML',
  outfile: 'dist/widget.js',
  platform: 'browser',
  target: ['es2020'],
  loader: { '.css': 'text' },
  define: { 'process.env.NODE_ENV': '"production"' },
};

if (watch) {
  esbuild.context(config).then(ctx => {
    ctx.watch();
    console.log('Watching for changes...');
  });
} else {
  esbuild.build(config).then(() => {
    const fs = require('fs');
    const zlib = require('zlib');
    const buf = fs.readFileSync('dist/widget.js');
    zlib.gzip(buf, (err, result) => {
      const kb = (result.length / 1024).toFixed(1);
      const status = result.length > 30 * 1024 ? '❌ OVER LIMIT' : '✅ OK';
      console.log(`Build complete: ${buf.length} bytes raw, ${result.length} bytes gzipped (${kb}KB) ${status}`);
      if (result.length > 30 * 1024) process.exit(1);
    });
  }).catch(() => process.exit(1));
}
