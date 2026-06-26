const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const sourcePath = path.join(__dirname, '..', 'scripts', 'luxpdf-site-init.js');
const source = fs.readFileSync(sourcePath, 'utf8');

function loadSandbox() {
    const sandbox = {
        console,
        setTimeout,
        clearTimeout,
        CustomEvent: function CustomEvent(type, init = {}) {
            this.type = type;
            this.detail = init.detail;
        },
        document: {
            readyState: 'loading',
            documentElement: { lang: 'en', removeAttribute() {} },
            addEventListener() {},
            querySelectorAll() { return []; },
            querySelector() { return null; },
            getElementById() { return null; }
        },
        window: {
            addEventListener() {},
            dispatchEvent() {},
            matchMedia() { return { matches: false }; }
        }
    };
    sandbox.window.window = sandbox.window;
    sandbox.window.document = sandbox.document;
    sandbox.globalThis = sandbox.window;

    vm.createContext(sandbox);
    vm.runInContext(source, sandbox, { filename: sourcePath });
    return sandbox.window.PDFSwitchHomeSmartWorkspace;
}

function fakeFile(name, type = '') {
    return { name, type, size: 1024, lastModified: 1 };
}

const smartWorkspace = loadSandbox();
assert.ok(smartWorkspace, 'smart workspace API should be exported for regression tests');

const { createSmartRoutingConfig, inferSmartTool } = smartWorkspace;
assert.equal(typeof createSmartRoutingConfig, 'function');
assert.equal(typeof inferSmartTool, 'function');

const config = createSmartRoutingConfig((key, replacements = {}) => {
    if (key === 'unsupported') return `unsupported:${replacements.name}`;
    if (key === 'sameType') return 'same-type';
    return key;
});

assert.equal(config.toolByExtension.get('png'), 'png-to-pdf');
assert.equal(config.toolByExtension.get('jpg'), 'png-to-pdf');
assert.equal(config.toolByExtension.get('jpeg'), 'png-to-pdf');
assert.equal(config.toolByExtension.get('webp'), 'webp-to-pdf');
assert.equal(config.toolByExtension.get('heif'), 'heif-to-pdf');
assert.equal(config.toolByExtension.get('svg'), 'svg-to-pdf');
assert.equal(config.toolByExtension.get('txt'), 'txt-to-pdf');
assert.equal(config.toolByExtension.get('html'), 'html-to-pdf');
assert.equal(config.toolByExtension.get('md'), 'markdown-to-pdf');
assert.equal(config.toolByExtension.get('docx'), 'word-to-pdf');
assert.equal(config.toolByExtension.get('rtf'), 'rtf-to-pdf');
assert.equal(config.toolByExtension.get('xls'), 'excel-to-pdf');
assert.equal(config.toolByExtension.get('pptx'), 'ppt-to-pdf');
assert.equal(config.toolByExtension.get('epub'), 'epub-to-pdf');

assert.equal(inferSmartTool([fakeFile('a.png'), fakeFile('b.jpg'), fakeFile('c.jpeg')], config).tool, 'png-to-pdf');
assert.equal(inferSmartTool([fakeFile('book.epub')], config).tool, 'epub-to-pdf');
assert.deepEqual(inferSmartTool([fakeFile('file.pdf')], config), { needsPdfChoice: true });
assert.deepEqual(inferSmartTool([fakeFile('file.pdf'), fakeFile('image.png')], config), { error: 'same-type' });
assert.deepEqual(inferSmartTool([fakeFile('image.webp'), fakeFile('image.svg')], config), { error: 'same-type' });
assert.deepEqual(inferSmartTool([fakeFile('archive.zip')], config), { error: 'unsupported:archive.zip' });

const pdfTools = config.pdfOperations.map(operation => operation.tool);
[
    'pdf-to-png',
    'pdf-to-jpeg',
    'pdf-to-txt',
    'merge-pdf',
    'split-pdf',
    'compress-pdf',
    'rotate-pdf',
    'extract-pages',
    'remove-pages',
    'sort-pages',
    'add-watermark',
    'add-password',
    'remove-password',
    'edit-metadata',
    'remove-metadata',
    'flatten-pdf',
    'compare-pdfs'
].forEach(tool => assert.ok(pdfTools.includes(tool), `PDF chooser should include ${tool}`));

assert.ok(config.supportedAccept.includes('.epub'), 'home accept list should include EPUB');
