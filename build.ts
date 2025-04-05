
import { build } from "bun";
import dts from "bun-plugin-dts";

const fnRemoveComments = async function() {
    const filesToProcess = [ 'index.cjs', 'index.mjs', 'index.d.ts' ];
    for ( const fileName of filesToProcess ) {
        const filePath = `./dist/${ fileName }`;
        try {
            const content = await Bun.file( filePath ).text();
            const lines = content.split('\n');
            if ( lines[0]?.trim().startsWith('//') ) {
                lines.shift();
                while ( lines.length > 0 && lines[0].trim() === '' ) {
                    lines.shift();
                }
                const newContent = lines.join('\n');
                await Bun.write( filePath, newContent );
            }
        } catch (error) {
            console.error(`Error processing ${filePath}:`, error);
        }
    }
}

await build({
    entrypoints: ['./src/index.ts'],
    plugins: [ dts() ],
    minify: {
        identifiers: false,
        whitespace: true,
        syntax: true
    },
    naming: 'index.mjs',
    sourcemap: 'none',
    splitting: false,
    outdir: 'dist',
    format: 'esm',
    target: 'bun'
})

await build({
    entrypoints: ['./src/index.ts'],
    minify: {
        identifiers: false,
        whitespace: true,
        syntax: true
    },
    naming: 'index.cjs',
    sourcemap: 'none',
    splitting: false,
    outdir: 'dist',
    format: 'cjs',
    target: 'bun'
})

await fnRemoveComments()