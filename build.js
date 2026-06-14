const esbuild = require('esbuild');
const fs = require('fs');
const watch = process.argv.includes('--watch');

// Ship the manual test harness alongside the bundle so it's reachable when dist/ is the web root
// (e.g. the nginx container at :8090/test-embed.html). The source lives at the repo root and points at
// ./dist/widget.js; inside dist/, widget.js is a sibling, so rewrite the path on copy.
function copyTestHarness() {
  try {
    const html = fs.readFileSync('test-embed.html', 'utf8')
      .replace(/\.\/dist\/widget\.js/g, './widget.js');
    fs.writeFileSync('dist/test-embed.html', html);
  } catch { /* harness is optional */ }
}

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
    copyTestHarness();
    console.log('Watching for changes...');
  });
} else {
  esbuild.build(config).then(() => {
    copyTestHarness();
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
