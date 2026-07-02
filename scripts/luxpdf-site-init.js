function setFAQItemState(item, shouldExpand, instant = false) {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    if (!question || !answer) return;

    question.setAttribute('aria-expanded', String(shouldExpand));

    if (shouldExpand) {
        item.classList.add('active');
        const targetHeight = answer.scrollHeight;

        if (instant) {
            answer.style.height = 'auto';
            return;
        }

        const startHeight = answer.offsetHeight;
        answer.style.height = `${startHeight}px`;
        requestAnimationFrame(() => {
            answer.style.height = `${targetHeight}px`;
        });
        return;
    }

    const currentHeight = answer.offsetHeight || answer.scrollHeight;
    answer.style.height = `${currentHeight}px`;

    if (instant) {
        item.classList.remove('active');
        answer.style.height = '0px';
        return;
    }

    // Ensure the browser commits current height before collapsing.
    void answer.offsetHeight;
    item.classList.remove('active');
    answer.style.height = '0px';
}

function initializeFAQAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        if (!question || !answer) return;

        question.setAttribute('role', 'button');
        question.setAttribute('tabindex', '0');

        if (!answer.dataset.faqTransitionBound) {
            answer.dataset.faqTransitionBound = 'true';
            answer.addEventListener('transitionend', (event) => {
                if (event.propertyName !== 'height') return;
                if (item.classList.contains('active')) {
                    answer.style.height = 'auto';
                }
            });
        }

        setFAQItemState(item, item.classList.contains('active'), true);

        // Prevent multiple listeners by checking for a marker
        if (!question.dataset.faqInitialized) {
            question.dataset.faqInitialized = 'true';
            question.addEventListener('click', () => {
                setFAQItemState(item, !item.classList.contains('active'), prefersReducedMotion);
            });
            question.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    setFAQItemState(item, !item.classList.contains('active'), prefersReducedMotion);
                }
            });
        }
    });
}

function createHomeSmartRoutingConfig(i18n) {
    const supportedAccept = '.pdf,.png,.jpg,.jpeg,.webp,.heif,.heic,.svg,.txt,.html,.htm,.md,.markdown,.docx,.rtf,.xls,.xlsx,.ppt,.pptx,.epub';
    const toolByExtension = new Map([
        ['png', 'png-to-pdf'],
        ['jpg', 'png-to-pdf'],
        ['jpeg', 'png-to-pdf'],
        ['webp', 'webp-to-pdf'],
        ['heif', 'heif-to-pdf'],
        ['heic', 'heif-to-pdf'],
        ['svg', 'svg-to-pdf'],
        ['txt', 'txt-to-pdf'],
        ['html', 'html-to-pdf'],
        ['htm', 'html-to-pdf'],
        ['md', 'markdown-to-pdf'],
        ['markdown', 'markdown-to-pdf'],
        ['docx', 'word-to-pdf'],
        ['rtf', 'rtf-to-pdf'],
        ['xls', 'excel-to-pdf'],
        ['xlsx', 'excel-to-pdf'],
        ['ppt', 'ppt-to-pdf'],
        ['pptx', 'ppt-to-pdf'],
        ['epub', 'epub-to-pdf']
    ]);
    const pdfOperations = [
        { labelKey: 'pdfToPngOp', tool: 'pdf-to-png', icon: 'fa-image' },
        { labelKey: 'pdfToJpegOp', tool: 'pdf-to-jpeg', icon: 'fa-file-image' },
        { labelKey: 'pdfToTxtOp', tool: 'pdf-to-txt', icon: 'fa-file-alt' },
        { labelKey: 'mergePdf', tool: 'merge-pdf', icon: 'fa-object-group' },
        { labelKey: 'splitPdf', tool: 'split-pdf', icon: 'fa-cut' },
        { labelKey: 'compressPdf', tool: 'compress-pdf', icon: 'fa-compress' },
        { labelKey: 'rotatePdf', tool: 'rotate-pdf', icon: 'fa-redo' },
        { labelKey: 'extractPages', tool: 'extract-pages', icon: 'fa-copy' },
        { labelKey: 'removePages', tool: 'remove-pages', icon: 'fa-trash-alt' },
        { labelKey: 'sortPages', tool: 'sort-pages', icon: 'fa-sort' },
        { labelKey: 'addWatermark', tool: 'add-watermark', icon: 'fa-stamp' },
        { labelKey: 'addPassword', tool: 'add-password', icon: 'fa-lock' },
        { labelKey: 'removePassword', tool: 'remove-password', icon: 'fa-unlock' },
        { labelKey: 'editMetadata', tool: 'edit-metadata', icon: 'fa-tags' },
        { labelKey: 'removeMetadata', tool: 'remove-metadata', icon: 'fa-eraser' },
        { labelKey: 'flattenPdf', tool: 'flatten-pdf', icon: 'fa-layer-group' },
        { labelKey: 'comparePdfs', tool: 'compare-pdfs', icon: 'fa-code-compare' }
    ];

    return { supportedAccept, toolByExtension, pdfOperations, i18n };
}

function getHomeSmartFileExtension(file) {
    const name = (file && file.name) ? file.name : '';
    const dotIndex = name.lastIndexOf('.');
    return dotIndex >= 0 ? name.slice(dotIndex + 1).toLowerCase() : '';
}

function inferHomeSmartTool(files, config) {
    const inferred = files.map(file => {
        const extension = getHomeSmartFileExtension(file);
        if (extension === 'pdf') return { kind: 'pdf', file };
        const tool = config.toolByExtension.get(extension);
        return tool ? { kind: 'tool', tool, file } : { kind: 'unsupported', extension, file };
    });

    const unsupported = inferred.find(item => item.kind === 'unsupported');
    if (unsupported) {
        return { error: config.i18n('unsupported', { name: unsupported.file.name }) };
    }

    const hasPdf = inferred.some(item => item.kind === 'pdf');
    const nonPdfTools = new Set(inferred.filter(item => item.kind === 'tool').map(item => item.tool));
    if (hasPdf && nonPdfTools.size > 0) {
        return { error: config.i18n('sameType') };
    }
    if (nonPdfTools.size > 1) {
        return { error: config.i18n('sameType') };
    }
    if (hasPdf) {
        return { needsPdfChoice: true };
    }
    return { tool: Array.from(nonPdfTools)[0] };
}

(function exposeHomeSmartWorkspaceApi(root) {
    if (!root) return;
    root.PDFOnlyHomeSmartWorkspace = {
        createSmartRoutingConfig: createHomeSmartRoutingConfig,
        inferSmartTool: inferHomeSmartTool
    };
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : null));

function initializeLanguageSystem() {
    const languages = {
        en: { label: 'EN', dir: 'ltr' },
        zh: { label: '中文', dir: 'ltr' },
        de: { label: 'DE', dir: 'ltr' },
        it: { label: 'IT', dir: 'ltr' },
        ja: { label: '日本語', dir: 'ltr' },
        ko: { label: '한국어', dir: 'ltr' },
        es: { label: 'ES', dir: 'ltr' },
        fr: { label: 'FR', dir: 'ltr' },
        ru: { label: 'RU', dir: 'ltr' }
    };
    const translations = {
        en: {
            allTools: 'All Tools', convert: 'Convert', organize: 'Merge/Split', compress: 'Compress', security: 'Security',
            kicker: 'Online PDF toolkit', title: 'All PDF tools, smart upload routing',
            subtitle: 'Drop PDFs, images, Word, Excel, PPT, HTML, or text files. PDFOnly detects the file type and picks the right tool; PDF files can be merged, split, compressed, converted to images, encrypted, and more.',
            uploadAria: 'Upload files', uploadTitle: 'Drop files here', uploadHint: 'or click to choose files', chooseFiles: 'Choose files',
            uploadSupport: 'Supports PDF, PNG, JPG, WEBP, HEIF, SVG, TXT, HTML, MD, DOCX, RTF, Excel, PPT, EPUB',
            currentTask: 'Current task', idleTool: 'Upload files or choose a tool', reset: 'Choose again',
            start: 'Start processing', uploadFirst: 'Upload files first', processFiles: 'Process {count} file(s)', processing: 'Processing...', results: 'Download results',
            pdfChoice: 'PDF detected. Choose an action', unsupported: 'Unsupported file type: {name}', sameType: 'Please upload the same file type in each batch.',
            commonTools: 'Common tools', searchPlaceholder: 'Search tools, e.g. Word to PDF', all: 'All',
            mergePdf: 'Merge PDF', mergePdfDesc: 'Combine multiple PDFs into one file', splitPdf: 'Split PDF', splitPdfDesc: 'Split by ranges or pages',
            compressPdf: 'Compress PDF', compressPdfDesc: 'Reduce PDF file size', pdfToPng: 'PDF to images', pdfToPngDesc: 'Export PNG images',
            wordToPdf: 'Word to PDF', wordToPdfDesc: 'Convert DOCX to PDF', pngToPdf: 'Images to PDF', pngToPdfDesc: 'Combine PNG images into PDF',
            addPassword: 'Encrypt PDF', addPasswordDesc: 'Add an opening password', removePassword: 'Decrypt PDF', removePasswordDesc: 'Remove known password protection',
            jpegToPdf: 'JPEG to PDF', webpToPdf: 'WEBP to PDF', htmlToPdf: 'HTML to PDF', markdownToPdf: 'Markdown to PDF', excelToPdf: 'Excel to PDF', pptToPdf: 'PPT to PDF', rotatePdf: 'Rotate PDF', extractPages: 'Extract pages',
            pdfToPngOp: 'PDF to PNG images', pdfToJpegOp: 'PDF to JPEG images', pdfToTxtOp: 'PDF to text', removePages: 'Remove pages', sortPages: 'Sort pages', addWatermark: 'Add watermark', editMetadata: 'Edit metadata', removeMetadata: 'Remove metadata', flattenPdf: 'Flatten PDF', comparePdfs: 'Compare PDFs',
            localFirst: 'Local first', localFirstDesc: 'Common processing runs in your browser',
            smartMatch: 'Smart matching', smartMatchDesc: 'Automatically picks the right tool after upload', freeUse: 'Free to use', freeUseDesc: 'Core tools work without registration',
            terms: 'Terms', changelog: 'Changelog', privacy: 'Privacy', contact: 'Feedback: contact@pdfonly.top', copyright: '© 2025 PDFOnly. All rights reserved.'
        },
        zh: {
            allTools: '全部工具', convert: '转换', organize: '合并/拆分', compress: '压缩', security: '安全',
            kicker: '在线 PDF 工具箱', title: '所有 PDF 工具，一次上传智能选择',
            subtitle: '拖入 PDF、图片、Word、Excel、PPT、HTML 或文本文件。PDFOnly 会按文件类型自动匹配工具；PDF 文件可选择合并、拆分、压缩、转图片、加密等操作。',
            uploadAria: '上传文件', uploadTitle: '拖放文件到这里', uploadHint: '或点击选择文件', chooseFiles: '选择文件',
            uploadSupport: '支持 PDF、PNG、JPG、WEBP、HEIF、SVG、TXT、HTML、MD、DOCX、RTF、Excel、PPT、EPUB',
            currentTask: '当前任务', idleTool: '请先上传文件或选择工具', reset: '重新选择',
            start: '开始处理', uploadFirst: '请先上传文件', processFiles: '处理 {count} 个文件', processing: '处理中...', results: '下载结果',
            pdfChoice: '检测到 PDF 文件，请选择要执行的操作', unsupported: '暂不支持该文件类型：{name}', sameType: '请按同一类型文件分批上传',
            commonTools: '常用工具', searchPlaceholder: '搜索工具，例如 Word 转 PDF', all: '全部',
            mergePdf: '合并 PDF', mergePdfDesc: '多个 PDF 合成一个文件', splitPdf: '拆分 PDF', splitPdfDesc: '按范围或页面拆分',
            compressPdf: '压缩 PDF', compressPdfDesc: '减小 PDF 文件体积', pdfToPng: 'PDF 转图片', pdfToPngDesc: '导出 PNG 图片',
            wordToPdf: 'Word 转 PDF', wordToPdfDesc: 'DOCX 文档转 PDF', pngToPdf: '图片转 PDF', pngToPdfDesc: 'PNG 图片合成 PDF',
            addPassword: '加密 PDF', addPasswordDesc: '添加打开密码', removePassword: '解密 PDF', removePasswordDesc: '移除已知密码保护',
            jpegToPdf: 'JPEG 转 PDF', webpToPdf: 'WEBP 转 PDF', htmlToPdf: 'HTML 转 PDF', markdownToPdf: 'Markdown 转 PDF', excelToPdf: 'Excel 转 PDF', pptToPdf: 'PPT 转 PDF', rotatePdf: '旋转 PDF', extractPages: '提取页面',
            pdfToPngOp: 'PDF 转 PNG 图片', pdfToJpegOp: 'PDF 转 JPEG 图片', pdfToTxtOp: 'PDF 转文本', removePages: '删除页面', sortPages: '页面排序', addWatermark: '添加水印', editMetadata: '编辑元数据', removeMetadata: '删除元数据', flattenPdf: '扁平化 PDF', comparePdfs: '对比 PDF',
            localFirst: '本地优先', localFirstDesc: '常用处理在浏览器内完成',
            smartMatch: '智能匹配', smartMatchDesc: '上传后自动选择合适工具', freeUse: '免费使用', freeUseDesc: '核心工具无需注册',
            terms: '服务条款', changelog: '更新记录', privacy: '隐私政策', contact: '问题反馈：contact@pdfonly.top', copyright: '© 2025 PDFOnly. All rights reserved.'
        },
        de: {
            allTools: 'Alle Tools', convert: 'Konvertieren', organize: 'Zusammenfügen/Teilen', compress: 'Komprimieren', security: 'Sicherheit',
            kicker: 'Online-PDF-Werkzeugkasten', title: 'Alle PDF-Tools, smarte Auswahl beim Hochladen',
            subtitle: 'Ziehe PDFs, Bilder, Word-, Excel-, PPT-, HTML- oder Textdateien hierher. PDFOnly erkennt den Dateityp und wählt das passende Werkzeug; PDFs können zusammengeführt, geteilt, komprimiert, in Bilder umgewandelt oder verschlüsselt werden.',
            uploadAria: 'Dateien hochladen', uploadTitle: 'Dateien hier ablegen', uploadHint: 'oder klicken, um Dateien zu wählen', chooseFiles: 'Dateien wählen',
            uploadSupport: 'Unterstützt PDF, PNG, JPG, WEBP, HEIF, SVG, TXT, HTML, MD, DOCX, RTF, Excel, PPT, EPUB',
            currentTask: 'Aktuelle Aufgabe', idleTool: 'Lade Dateien hoch oder wähle ein Werkzeug', reset: 'Erneut wählen',
            start: 'Verarbeitung starten', uploadFirst: 'Bitte zuerst Dateien hochladen', processFiles: '{count} Datei(en) verarbeiten', processing: 'Wird verarbeitet...', results: 'Ergebnisse herunterladen',
            pdfChoice: 'PDF erkannt. Wähle eine Aktion', unsupported: 'Nicht unterstützter Dateityp: {name}', sameType: 'Bitte lade pro Vorgang nur denselben Dateityp hoch.',
            commonTools: 'Häufige Tools', searchPlaceholder: 'Tools durchsuchen, z. B. Word zu PDF', all: 'Alle',
            mergePdf: 'PDFs zusammenfügen', mergePdfDesc: 'Mehrere PDFs in einer Datei kombinieren', splitPdf: 'PDF teilen', splitPdfDesc: 'Nach Bereichen oder Seiten teilen',
            compressPdf: 'PDF komprimieren', compressPdfDesc: 'PDF-Dateigröße reduzieren', pdfToPng: 'PDF zu Bildern', pdfToPngDesc: 'PNG-Bilder exportieren',
            wordToPdf: 'Word zu PDF', wordToPdfDesc: 'DOCX in PDF umwandeln', pngToPdf: 'Bilder zu PDF', pngToPdfDesc: 'PNG-Bilder zu PDF kombinieren',
            addPassword: 'PDF verschlüsseln', addPasswordDesc: 'Öffnungspasswort hinzufügen', removePassword: 'PDF entschlüsseln', removePasswordDesc: 'Bekannten Passwortschutz entfernen',
            jpegToPdf: 'JPEG zu PDF', webpToPdf: 'WEBP zu PDF', htmlToPdf: 'HTML zu PDF', markdownToPdf: 'Markdown zu PDF', excelToPdf: 'Excel zu PDF', pptToPdf: 'PPT zu PDF', rotatePdf: 'PDF drehen', extractPages: 'Seiten extrahieren',
            pdfToPngOp: 'PDF zu PNG', pdfToJpegOp: 'PDF zu JPEG', pdfToTxtOp: 'PDF zu Text', removePages: 'Seiten entfernen', sortPages: 'Seiten sortieren', addWatermark: 'Wasserzeichen hinzufügen', editMetadata: 'Metadaten bearbeiten', removeMetadata: 'Metadaten entfernen', flattenPdf: 'PDF reduzieren', comparePdfs: 'PDFs vergleichen',
            localFirst: 'Lokal zuerst', localFirstDesc: 'Übliche Verarbeitung läuft im Browser',
            smartMatch: 'Smarte Zuordnung', smartMatchDesc: 'Wählt das passende Werkzeug nach dem Hochladen', freeUse: 'Kostenlos', freeUseDesc: 'Kernwerkzeuge ohne Registrierung',
            terms: 'Nutzungsbedingungen', changelog: 'Änderungen', privacy: 'Datenschutz', contact: 'Feedback: contact@pdfonly.top', copyright: '© 2025 PDFOnly. Alle Rechte vorbehalten.'
        },
        it: {
            allTools: 'Tutti gli strumenti', convert: 'Converti', organize: 'Unisci/Dividi', compress: 'Comprimi', security: 'Sicurezza',
            kicker: 'Cassetta degli attrezzi PDF online', title: 'Tutti gli strumenti PDF, scelta intelligente al caricamento',
            subtitle: 'Trascina PDF, immagini, file Word, Excel, PPT, HTML o di testo. PDFOnly rileva il tipo di file e sceglie lo strumento giusto; i PDF possono essere uniti, divisi, compressi, convertiti in immagini o protetti.',
            uploadAria: 'Carica file', uploadTitle: 'Trascina i file qui', uploadHint: 'oppure fai clic per scegliere', chooseFiles: 'Scegli file',
            uploadSupport: 'Supporta PDF, PNG, JPG, WEBP, HEIF, SVG, TXT, HTML, MD, DOCX, RTF, Excel, PPT, EPUB',
            currentTask: 'Attività corrente', idleTool: 'Carica file o scegli uno strumento', reset: 'Scegli di nuovo',
            start: 'Avvia elaborazione', uploadFirst: 'Carica prima i file', processFiles: 'Elabora {count} file', processing: 'Elaborazione...', results: 'Scarica i risultati',
            pdfChoice: 'PDF rilevato. Scegli un\'azione', unsupported: 'Tipo di file non supportato: {name}', sameType: 'Carica un solo tipo di file per sessione.',
            commonTools: 'Strumenti comuni', searchPlaceholder: 'Cerca strumenti, es. Word in PDF', all: 'Tutti',
            mergePdf: 'Unisci PDF', mergePdfDesc: 'Combina più PDF in un file', splitPdf: 'Dividi PDF', splitPdfDesc: 'Dividi per intervalli o pagine',
            compressPdf: 'Comprimi PDF', compressPdfDesc: 'Riduci la dimensione del PDF', pdfToPng: 'PDF in immagini', pdfToPngDesc: 'Esporta immagini PNG',
            wordToPdf: 'Word in PDF', wordToPdfDesc: 'Converti DOCX in PDF', pngToPdf: 'Immagini in PDF', pngToPdfDesc: 'Combina immagini PNG in PDF',
            addPassword: 'Cripta PDF', addPasswordDesc: 'Aggiungi password di apertura', removePassword: 'Decripta PDF', removePasswordDesc: 'Rimuovi protezione con password nota',
            jpegToPdf: 'JPEG in PDF', webpToPdf: 'WEBP in PDF', htmlToPdf: 'HTML in PDF', markdownToPdf: 'Markdown in PDF', excelToPdf: 'Excel in PDF', pptToPdf: 'PPT in PDF', rotatePdf: 'Ruota PDF', extractPages: 'Estrai pagine',
            pdfToPngOp: 'PDF in PNG', pdfToJpegOp: 'PDF in JPEG', pdfToTxtOp: 'PDF in testo', removePages: 'Rimuovi pagine', sortPages: 'Ordina pagine', addWatermark: 'Aggiungi filigrana', editMetadata: 'Modifica metadati', removeMetadata: 'Rimuovi metadati', flattenPdf: 'Appiattisci PDF', comparePdfs: 'Confronta PDF',
            localFirst: 'Prima in locale', localFirstDesc: 'Le elaborazioni comuni avvengono nel browser',
            smartMatch: 'Abbinamento intelligente', smartMatchDesc: 'Sceglie automaticamente lo strumento giusto dopo il caricamento', freeUse: 'Gratuito', freeUseDesc: 'Strumenti principali senza registrazione',
            terms: 'Termini', changelog: 'Cronologia modifiche', privacy: 'Privacy', contact: 'Feedback: contact@pdfonly.top', copyright: '© 2025 PDFOnly. Tutti i diritti riservati.'
        },
        ja: {
            allTools: 'すべてのツール', convert: '変換', organize: '結合/分割', compress: '圧縮', security: 'セキュリティ',
            kicker: 'オンライン PDF ツールキット', title: 'すべての PDF ツールを、アップロードで自動選択',
            subtitle: 'PDF、画像、Word、Excel、PPT、HTML、テキストをドロップしてください。PDFOnly がファイル形式を判定して最適なツールを選びます。PDF は結合、分割、圧縮、画像化、暗号化などに対応します。',
            uploadAria: 'ファイルをアップロード', uploadTitle: 'ここにファイルをドロップ', uploadHint: 'またはクリックして選択', chooseFiles: 'ファイルを選択',
            uploadSupport: 'PDF、PNG、JPG、WEBP、HEIF、SVG、TXT、HTML、MD、DOCX、RTF、Excel、PPT、EPUB に対応',
            currentTask: '現在のタスク', idleTool: 'ファイルをアップロードするかツールを選択', reset: '選び直す',
            start: '処理を開始', uploadFirst: '先にファイルをアップロード', processFiles: '{count} 個のファイルを処理', processing: '処理中...', results: '結果をダウンロード',
            pdfChoice: 'PDF を検出しました。操作を選択してください', unsupported: '未対応のファイル形式です：{name}', sameType: '同じ種類のファイルごとに分けてアップロードしてください',
            commonTools: 'よく使うツール', searchPlaceholder: 'ツールを検索、例: Word to PDF', all: 'すべて',
            mergePdf: 'PDF を結合', mergePdfDesc: '複数の PDF を 1 つに結合', splitPdf: 'PDF を分割', splitPdfDesc: '範囲またはページで分割',
            compressPdf: 'PDF を圧縮', compressPdfDesc: 'PDF のファイルサイズを削減', pdfToPng: 'PDF を画像へ', pdfToPngDesc: 'PNG 画像として書き出し',
            wordToPdf: 'Word を PDF へ', wordToPdfDesc: 'DOCX を PDF に変換', pngToPdf: '画像を PDF へ', pngToPdfDesc: 'PNG 画像を PDF に結合',
            addPassword: 'PDF を暗号化', addPasswordDesc: '開封パスワードを追加', removePassword: 'PDF を復号', removePasswordDesc: '既知のパスワード保護を解除',
            jpegToPdf: 'JPEG を PDF へ', webpToPdf: 'WEBP を PDF へ', htmlToPdf: 'HTML を PDF へ', markdownToPdf: 'Markdown を PDF へ', excelToPdf: 'Excel を PDF へ', pptToPdf: 'PPT を PDF へ', rotatePdf: 'PDF を回転', extractPages: 'ページを抽出',
            pdfToPngOp: 'PDF を PNG 画像へ', pdfToJpegOp: 'PDF を JPEG 画像へ', pdfToTxtOp: 'PDF をテキストへ', removePages: 'ページを削除', sortPages: 'ページを並べ替え', addWatermark: '透かしを追加', editMetadata: 'メタデータを編集', removeMetadata: 'メタデータを削除', flattenPdf: 'PDF をフラット化', comparePdfs: 'PDF を比較',
            localFirst: 'ローカル優先', localFirstDesc: '一般的な処理はブラウザ内で完了',
            smartMatch: 'スマート判定', smartMatchDesc: 'アップロード後に最適なツールを自動選択', freeUse: '無料で利用', freeUseDesc: '主要ツールは登録不要',
            terms: '利用規約', changelog: '更新履歴', privacy: 'プライバシー', contact: 'フィードバック：contact@pdfonly.top', copyright: '© 2025 PDFOnly. All rights reserved.'
        },
        ko: {
            allTools: '전체 도구', convert: '변환', organize: '병합/분할', compress: '압축', security: '보안',
            kicker: '온라인 PDF 도구 상자', title: '모든 PDF 도구를 업로드 한 번으로 자동 선택',
            subtitle: 'PDF, 이미지, Word, Excel, PPT, HTML 또는 텍스트 파일을 올리세요. PDFOnly가 파일 형식을 감지해 알맞은 도구를 선택합니다. PDF는 병합, 분할, 압축, 이미지 변환, 암호화 등을 지원합니다.',
            uploadAria: '파일 업로드', uploadTitle: '여기에 파일 놓기', uploadHint: '또는 클릭하여 선택', chooseFiles: '파일 선택',
            uploadSupport: 'PDF, PNG, JPG, WEBP, HEIF, SVG, TXT, HTML, MD, DOCX, RTF, Excel, PPT, EPUB 지원',
            currentTask: '현재 작업', idleTool: '파일을 업로드하거나 도구를 선택하세요', reset: '다시 선택',
            start: '처리 시작', uploadFirst: '먼저 파일을 업로드하세요', processFiles: '파일 {count}개 처리', processing: '처리 중...', results: '결과 다운로드',
            pdfChoice: 'PDF가 감지되었습니다. 작업을 선택하세요', unsupported: '지원하지 않는 파일 형식: {name}', sameType: '같은 유형의 파일끼리 나누어 업로드하세요',
            commonTools: '자주 쓰는 도구', searchPlaceholder: '도구 검색, 예: Word to PDF', all: '전체',
            mergePdf: 'PDF 병합', mergePdfDesc: '여러 PDF를 하나로 결합', splitPdf: 'PDF 분할', splitPdfDesc: '범위 또는 페이지별 분할',
            compressPdf: 'PDF 압축', compressPdfDesc: 'PDF 파일 크기 줄이기', pdfToPng: 'PDF를 이미지로', pdfToPngDesc: 'PNG 이미지로 내보내기',
            wordToPdf: 'Word를 PDF로', wordToPdfDesc: 'DOCX를 PDF로 변환', pngToPdf: '이미지를 PDF로', pngToPdfDesc: 'PNG 이미지를 PDF로 결합',
            addPassword: 'PDF 암호화', addPasswordDesc: '열기 비밀번호 추가', removePassword: 'PDF 암호 해제', removePasswordDesc: '알고 있는 비밀번호 보호 제거',
            jpegToPdf: 'JPEG를 PDF로', webpToPdf: 'WEBP를 PDF로', htmlToPdf: 'HTML을 PDF로', markdownToPdf: 'Markdown을 PDF로', excelToPdf: 'Excel을 PDF로', pptToPdf: 'PPT를 PDF로', rotatePdf: 'PDF 회전', extractPages: '페이지 추출',
            pdfToPngOp: 'PDF를 PNG 이미지로', pdfToJpegOp: 'PDF를 JPEG 이미지로', pdfToTxtOp: 'PDF를 텍스트로', removePages: '페이지 삭제', sortPages: '페이지 정렬', addWatermark: '워터마크 추가', editMetadata: '메타데이터 편집', removeMetadata: '메타데이터 삭제', flattenPdf: 'PDF 평면화', comparePdfs: 'PDF 비교',
            localFirst: '로컬 우선', localFirstDesc: '일반 처리는 브라우저에서 완료',
            smartMatch: '스마트 매칭', smartMatchDesc: '업로드 후 적합한 도구 자동 선택', freeUse: '무료 사용', freeUseDesc: '핵심 도구는 가입 없이 사용',
            terms: '이용약관', changelog: '변경 기록', privacy: '개인정보 처리방침', contact: '피드백: contact@pdfonly.top', copyright: '© 2025 PDFOnly. All rights reserved.'
        },
        fr: {
            allTools: 'Tous les outils', convert: 'Convertir', organize: 'Fusion/Division', compress: 'Compresser', security: 'Sécurité',
            kicker: 'Boîte à outils PDF en ligne', title: 'Tous les outils PDF, sélection intelligente à l’envoi',
            subtitle: 'Déposez des PDF, images, fichiers Word, Excel, PPT, HTML ou texte. PDFOnly détecte le type de fichier et choisit le bon outil ; les PDF peuvent être fusionnés, divisés, compressés, convertis en images ou protégés.',
            uploadAria: 'Téléverser des fichiers', uploadTitle: 'Déposez les fichiers ici', uploadHint: 'ou cliquez pour choisir', chooseFiles: 'Choisir des fichiers',
            uploadSupport: 'PDF, PNG, JPG, WEBP, HEIF, SVG, TXT, HTML, MD, DOCX, RTF, Excel, PPT, EPUB pris en charge',
            currentTask: 'Tâche actuelle', idleTool: 'Téléversez des fichiers ou choisissez un outil', reset: 'Choisir à nouveau',
            start: 'Démarrer', uploadFirst: 'Téléversez d’abord des fichiers', processFiles: 'Traiter {count} fichier(s)', processing: 'Traitement...', results: 'Télécharger les résultats',
            pdfChoice: 'PDF détecté. Choisissez une action', unsupported: 'Type de fichier non pris en charge : {name}', sameType: 'Veuillez téléverser un seul type de fichier par lot.',
            commonTools: 'Outils courants', searchPlaceholder: 'Rechercher un outil, ex. Word vers PDF', all: 'Tout',
            mergePdf: 'Fusionner PDF', mergePdfDesc: 'Combiner plusieurs PDF en un fichier', splitPdf: 'Diviser PDF', splitPdfDesc: 'Diviser par plages ou pages',
            compressPdf: 'Compresser PDF', compressPdfDesc: 'Réduire la taille du PDF', pdfToPng: 'PDF en images', pdfToPngDesc: 'Exporter des images PNG',
            wordToPdf: 'Word en PDF', wordToPdfDesc: 'Convertir DOCX en PDF', pngToPdf: 'Images en PDF', pngToPdfDesc: 'Combiner des PNG en PDF',
            addPassword: 'Chiffrer PDF', addPasswordDesc: 'Ajouter un mot de passe', removePassword: 'Déchiffrer PDF', removePasswordDesc: 'Retirer une protection connue',
            jpegToPdf: 'JPEG en PDF', webpToPdf: 'WEBP en PDF', htmlToPdf: 'HTML en PDF', markdownToPdf: 'Markdown en PDF', excelToPdf: 'Excel en PDF', pptToPdf: 'PPT en PDF', rotatePdf: 'Faire pivoter PDF', extractPages: 'Extraire des pages',
            pdfToPngOp: 'PDF en PNG', pdfToJpegOp: 'PDF en JPEG', pdfToTxtOp: 'PDF en texte', removePages: 'Supprimer des pages', sortPages: 'Trier les pages', addWatermark: 'Ajouter un filigrane', editMetadata: 'Modifier les métadonnées', removeMetadata: 'Supprimer les métadonnées', flattenPdf: 'Aplatir le PDF', comparePdfs: 'Comparer des PDF',
            localFirst: 'Local d’abord', localFirstDesc: 'Les traitements courants se font dans le navigateur',
            smartMatch: 'Correspondance intelligente', smartMatchDesc: 'L’outil adapté est choisi après l’envoi', freeUse: 'Gratuit', freeUseDesc: 'Outils principaux sans inscription',
            terms: 'Conditions', changelog: 'Journal des mises à jour', privacy: 'Confidentialité', contact: 'Retour : contact@pdfonly.top', copyright: '© 2025 PDFOnly. All rights reserved.'
        },
        es: {
            allTools: 'Todas las herramientas', convert: 'Convertir', organize: 'Unir/Dividir', compress: 'Comprimir', security: 'Seguridad',
            kicker: 'Kit de herramientas PDF en línea', title: 'Todas las herramientas PDF con selección inteligente',
            subtitle: 'Suelta PDF, imágenes, Word, Excel, PPT, HTML o texto. PDFOnly detecta el tipo de archivo y elige la herramienta correcta; los PDF pueden unirse, dividirse, comprimirse, convertirse en imágenes o protegerse.',
            uploadAria: 'Subir archivos', uploadTitle: 'Suelta archivos aquí', uploadHint: 'o haz clic para elegir', chooseFiles: 'Elegir archivos',
            uploadSupport: 'Admite PDF, PNG, JPG, WEBP, HEIF, SVG, TXT, HTML, MD, DOCX, RTF, Excel, PPT, EPUB',
            currentTask: 'Tarea actual', idleTool: 'Sube archivos o elige una herramienta', reset: 'Elegir de nuevo',
            start: 'Iniciar procesamiento', uploadFirst: 'Sube archivos primero', processFiles: 'Procesar {count} archivo(s)', processing: 'Procesando...', results: 'Descargar resultados',
            pdfChoice: 'PDF detectado. Elige una acción', unsupported: 'Tipo de archivo no compatible: {name}', sameType: 'Sube el mismo tipo de archivo en cada lote.',
            commonTools: 'Herramientas comunes', searchPlaceholder: 'Buscar herramientas, ej. Word a PDF', all: 'Todo',
            mergePdf: 'Unir PDF', mergePdfDesc: 'Combina varios PDF en un archivo', splitPdf: 'Dividir PDF', splitPdfDesc: 'Divide por rangos o páginas',
            compressPdf: 'Comprimir PDF', compressPdfDesc: 'Reduce el tamaño del PDF', pdfToPng: 'PDF a imágenes', pdfToPngDesc: 'Exporta imágenes PNG',
            wordToPdf: 'Word a PDF', wordToPdfDesc: 'Convierte DOCX a PDF', pngToPdf: 'Imágenes a PDF', pngToPdfDesc: 'Combina PNG en PDF',
            addPassword: 'Cifrar PDF', addPasswordDesc: 'Añade contraseña de apertura', removePassword: 'Descifrar PDF', removePasswordDesc: 'Quita una protección conocida',
            jpegToPdf: 'JPEG a PDF', webpToPdf: 'WEBP a PDF', htmlToPdf: 'HTML a PDF', markdownToPdf: 'Markdown a PDF', excelToPdf: 'Excel a PDF', pptToPdf: 'PPT a PDF', rotatePdf: 'Rotar PDF', extractPages: 'Extraer páginas',
            pdfToPngOp: 'PDF a PNG', pdfToJpegOp: 'PDF a JPEG', pdfToTxtOp: 'PDF a texto', removePages: 'Eliminar páginas', sortPages: 'Ordenar páginas', addWatermark: 'Añadir marca de agua', editMetadata: 'Editar metadatos', removeMetadata: 'Eliminar metadatos', flattenPdf: 'Aplanar PDF', comparePdfs: 'Comparar PDF',
            localFirst: 'Local primero', localFirstDesc: 'El procesamiento común se ejecuta en el navegador',
            smartMatch: 'Coincidencia inteligente', smartMatchDesc: 'Elige la herramienta adecuada tras subir', freeUse: 'Gratis', freeUseDesc: 'Herramientas clave sin registro',
            terms: 'Términos', changelog: 'Registro de cambios', privacy: 'Privacidad', contact: 'Comentarios: contact@pdfonly.top', copyright: '© 2025 PDFOnly. All rights reserved.'
        },
        ru: {
            allTools: 'Все инструменты', convert: 'Конвертировать', organize: 'Объединить/Разделить', compress: 'Сжать', security: 'Безопасность',
            kicker: 'Онлайн-набор PDF-инструментов', title: 'Все PDF-инструменты, умный выбор при загрузке',
            subtitle: 'Перетащите PDF, изображения, Word, Excel, PPT, HTML или текстовые файлы. PDFOnly определит тип файла и выберет нужный инструмент; PDF можно объединять, разделять, сжимать, конвертировать в изображения и защищать.',
            uploadAria: 'Загрузить файлы', uploadTitle: 'Перетащите файлы сюда', uploadHint: 'или нажмите, чтобы выбрать', chooseFiles: 'Выбрать файлы',
            uploadSupport: 'Поддержка PDF, PNG, JPG, WEBP, HEIF, SVG, TXT, HTML, MD, DOCX, RTF, Excel, PPT, EPUB',
            currentTask: 'Текущая задача', idleTool: 'Загрузите файлы или выберите инструмент', reset: 'Выбрать заново',
            start: 'Начать обработку', uploadFirst: 'Сначала загрузите файлы', processFiles: 'Обработать {count} файлов', processing: 'Обработка...', results: 'Скачать результаты',
            pdfChoice: 'Обнаружен PDF. Выберите действие', unsupported: 'Неподдерживаемый тип файла: {name}', sameType: 'Загружайте файлы одного типа за раз.',
            commonTools: 'Частые инструменты', searchPlaceholder: 'Поиск, напр. Word в PDF', all: 'Все',
            mergePdf: 'Объединить PDF', mergePdfDesc: 'Собрать несколько PDF в один файл', splitPdf: 'Разделить PDF', splitPdfDesc: 'Разделить по диапазонам или страницам',
            compressPdf: 'Сжать PDF', compressPdfDesc: 'Уменьшить размер PDF', pdfToPng: 'PDF в изображения', pdfToPngDesc: 'Экспорт изображений PNG',
            wordToPdf: 'Word в PDF', wordToPdfDesc: 'Конвертировать DOCX в PDF', pngToPdf: 'Изображения в PDF', pngToPdfDesc: 'Собрать PNG-изображения в PDF',
            addPassword: 'Зашифровать PDF', addPasswordDesc: 'Добавить пароль открытия', removePassword: 'Расшифровать PDF', removePasswordDesc: 'Снять известную парольную защиту',
            jpegToPdf: 'JPEG в PDF', webpToPdf: 'WEBP в PDF', htmlToPdf: 'HTML в PDF', markdownToPdf: 'Markdown в PDF', excelToPdf: 'Excel в PDF', pptToPdf: 'PPT в PDF', rotatePdf: 'Повернуть PDF', extractPages: 'Извлечь страницы',
            pdfToPngOp: 'PDF в PNG', pdfToJpegOp: 'PDF в JPEG', pdfToTxtOp: 'PDF в текст', removePages: 'Удалить страницы', sortPages: 'Сортировать страницы', addWatermark: 'Добавить водяной знак', editMetadata: 'Изменить метаданные', removeMetadata: 'Удалить метаданные', flattenPdf: 'Свести PDF', comparePdfs: 'Сравнить PDF',
            localFirst: 'Локально прежде всего', localFirstDesc: 'Основная обработка идёт в браузере',
            smartMatch: 'Умный подбор', smartMatchDesc: 'Автоматически выбирает подходящий инструмент после загрузки', freeUse: 'Бесплатно', freeUseDesc: 'Базовые инструменты без регистрации',
            terms: 'Условия', changelog: 'История изменений', privacy: 'Конфиденциальность', contact: 'Обратная связь: contact@pdfonly.top', copyright: '© 2025 PDFOnly. Все права защищены.'
        }
    };
    const storageKey = 'pdfswitch-language';

    const normalizeLanguage = (lang) => Object.prototype.hasOwnProperty.call(languages, lang) ? lang : 'en';
    const t = (key, replacements = {}) => {
        const lang = normalizeLanguage(document.documentElement.lang || 'en');
        const text = (translations[lang] && translations[lang][key]) || translations.en[key] || key;
        return Object.entries(replacements).reduce((value, [name, replacement]) => value.replace(`{${name}}`, replacement), text);
    };
    const setText = (selector, value) => {
        document.querySelectorAll(selector).forEach((element) => {
            element.textContent = value;
        });
    };
    const setAttr = (selector, attr, value) => {
        document.querySelectorAll(selector).forEach((element) => {
            element.setAttribute(attr, value);
        });
    };
    const setToolCard = (tool, titleKey, descKey) => {
        document.querySelectorAll(`.tool-card[data-tool="${tool}"]`).forEach((card) => {
            const title = card.querySelector('span');
            const desc = card.querySelector('small');
            if (title) title.textContent = t(titleKey);
            if (desc) desc.textContent = t(descKey);
        });
    };
    const setTrustItem = (index, titleKey, descKey) => {
        const item = document.querySelectorAll('.home-trust-strip > div')[index];
        if (!item) return;
        const title = item.querySelector('strong');
        const desc = item.querySelector('span');
        if (title) title.textContent = t(titleKey);
        if (desc) desc.textContent = t(descKey);
    };
    const applyTranslations = () => {
        setText('.nav a[href="#tools"], .nav a[href="/#tools"], .mobile-nav-links a[href="#tools"], .mobile-nav-links a[href="/#tools"]', t('allTools'));
        setText('.nav a[href="#convert"], .nav a[href="/#convert"], .mobile-nav-links a[href="#convert"], .mobile-nav-links a[href="/#convert"], .tool-category-pills [data-filter="convert"]', t('convert'));
        setText('.nav a[href="#organize"], .nav a[href="/#organize"], .mobile-nav-links a[href="#organize"], .mobile-nav-links a[href="/#organize"], .tool-category-pills [data-filter="organize"]', t('organize'));
        setText('.nav a[href="#compress"], .nav a[href="/#compress"], .mobile-nav-links a[href="#compress"], .mobile-nav-links a[href="/#compress"], .tool-category-pills [data-filter="compress"]', t('compress'));
        setText('.nav a[href="#security"], .nav a[href="/#security"], .mobile-nav-links a[href="#security"], .mobile-nav-links a[href="/#security"], .tool-category-pills [data-filter="security"]', t('security'));

        setText('.home-kicker', t('kicker'));
        setText('.home .hero-title', t('title'));
        setText('.home .hero-subtitle', t('subtitle'));
        setAttr('#upload-area', 'aria-label', t('uploadAria'));
        setText('.upload-area h4', t('uploadTitle'));
        setText('.upload-area p', t('uploadHint'));
        setText('.home-upload-button', t('chooseFiles'));
        setText('.upload-area .upload-content > span', t('uploadSupport'));
        setText('.home-workspace-eyebrow', t('currentTask'));
        setText('#home-reset-btn', t('reset'));
        setText('#pdf-operation-panel > p', t('pdfChoice'));
        setText('#progress-text', t('processing'));
        setText('#results-section h4', t('results'));
        setText('.section-title', t('commonTools'));
        setAttr('#tool-search-bar', 'placeholder', t('searchPlaceholder'));
        setText('.tool-category-pills [data-filter="all"]', t('all'));

        setToolCard('merge-pdf', 'mergePdf', 'mergePdfDesc');
        setToolCard('split-pdf', 'splitPdf', 'splitPdfDesc');
        setToolCard('compress-pdf', 'compressPdf', 'compressPdfDesc');
        setToolCard('pdf-to-png', 'pdfToPng', 'pdfToPngDesc');
        setToolCard('word-to-pdf', 'wordToPdf', 'wordToPdfDesc');
        setToolCard('png-to-pdf', 'pngToPdf', 'pngToPdfDesc');
        setToolCard('add-password', 'addPassword', 'addPasswordDesc');
        setToolCard('remove-password', 'removePassword', 'removePasswordDesc');

        const linkKeys = {
            'jpeg-to-pdf': 'jpegToPdf', 'webp-to-pdf': 'webpToPdf', 'html-to-pdf': 'htmlToPdf', 'markdown-to-pdf': 'markdownToPdf',
            'excel-to-pdf': 'excelToPdf', 'ppt-to-pdf': 'pptToPdf', 'rotate-pdf': 'rotatePdf', 'extract-pages': 'extractPages'
        };
        Object.entries(linkKeys).forEach(([tool, key]) => setText(`.home-tool-links [data-tool="${tool}"] span`, t(key)));
        setTrustItem(0, 'localFirst', 'localFirstDesc');
        setTrustItem(1, 'smartMatch', 'smartMatchDesc');
        setTrustItem(2, 'freeUse', 'freeUseDesc');

        setText('.footer-links a[href="terms.html"], .footer-links a[href="/terms.html"]', t('terms'));
        setText('.footer-links a[href="changelog.html"], .footer-links a[href="/changelog.html"]', t('changelog'));
        setText('.footer-links a[href="privacy.html"], .footer-links a[href="/privacy.html"]', t('privacy'));
        setText('.footer-contact', t('contact'));
        setText('.copyright', t('copyright'));

        document.querySelectorAll('.pdf-operation-btn').forEach((button) => {
            const key = {
                'pdf-to-png': 'pdfToPngOp', 'pdf-to-jpeg': 'pdfToJpegOp', 'pdf-to-txt': 'pdfToTxtOp',
                'merge-pdf': 'mergePdf', 'split-pdf': 'splitPdf', 'compress-pdf': 'compressPdf',
                'rotate-pdf': 'rotatePdf', 'extract-pages': 'extractPages', 'remove-pages': 'removePages',
                'sort-pages': 'sortPages', 'add-watermark': 'addWatermark', 'add-password': 'addPassword',
                'remove-password': 'removePassword', 'edit-metadata': 'editMetadata',
                'remove-metadata': 'removeMetadata', 'flatten-pdf': 'flattenPdf', 'compare-pdfs': 'comparePdfs'
            }[button.dataset.tool];
            const label = button.querySelector('span');
            if (key && label) label.textContent = t(key);
        });

        window.dispatchEvent(new CustomEvent('pdfswitch:languagechange', {
            detail: { language: normalizeLanguage(document.documentElement.lang || 'en') }
        }));
    };
    const closeMenus = () => {
        document.querySelectorAll('.language-switcher.open').forEach((switcher) => {
            switcher.classList.remove('open');
            const toggle = switcher.querySelector('.language-toggle');
            const menu = switcher.querySelector('.language-menu');
            if (toggle) toggle.setAttribute('aria-expanded', 'false');
            if (menu) menu.hidden = true;
        });
    };
    const applyLanguage = (lang, persist = true) => {
        const resolved = normalizeLanguage(lang);
        const config = languages[resolved];
        document.documentElement.lang = resolved;
        // Keep the document direction LTR so the header/nav layout stays stable.
        // Apply RTL only to the inline language label and the option buttons that
        // genuinely render in a RTL script.
        document.documentElement.removeAttribute('dir');
        document.querySelectorAll('[data-current-language]').forEach((label) => {
            label.textContent = config.label;
            label.setAttribute('dir', config.dir);
        });
        document.querySelectorAll('.language-option').forEach((option) => {
            const isActive = option.dataset.lang === resolved;
            option.classList.toggle('active', isActive);
            option.setAttribute('aria-pressed', String(isActive));
            if (option.dataset.dir) {
                option.setAttribute('dir', option.dataset.dir);
            }
        });
        window.pdfswitchI18n = { language: resolved, t, apply: applyTranslations };
        applyTranslations();
        closeMenus();
        if (persist) {
            try {
                localStorage.setItem(storageKey, resolved);
            } catch (_) { /* noop */ }
        }
    };

    let savedLanguage = 'en';
    try {
        savedLanguage = localStorage.getItem(storageKey) || 'en';
    } catch (_) { /* noop */ }
    if (savedLanguage.toLowerCase().startsWith('zh')) {
        savedLanguage = 'zh';
    } else {
        savedLanguage = savedLanguage.split('-')[0].toLowerCase();
    }
    applyLanguage(savedLanguage, false);

    if (window.__pdfswitchLanguageEventsBound) return;
    window.__pdfswitchLanguageEventsBound = true;

    document.addEventListener('click', (event) => {
        const option = event.target.closest('.language-option');
        if (option) {
            applyLanguage(option.dataset.lang || 'en', true);
            return;
        }

        const toggle = event.target.closest('.language-toggle');
        if (toggle) {
            const switcher = toggle.closest('.language-switcher');
            if (!switcher) return;
            const shouldOpen = !switcher.classList.contains('open');
            closeMenus();
            if (shouldOpen) {
                switcher.classList.add('open');
                toggle.setAttribute('aria-expanded', 'true');
                const menu = switcher.querySelector('.language-menu');
                if (menu) menu.hidden = false;
            }
            return;
        }

        if (!event.target.closest('.language-switcher')) {
            closeMenus();
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') closeMenus();
    });
}

// Initialize Mobile Navigation (universal)
function initializeMobileNav() {
    const headerContainer = document.querySelector('.header .container');
    if (!headerContainer) return; // Safety guard

    // Ensure hamburger markup exists (tool pages may not have it)
    let hamburgerMenu = document.querySelector('.hamburger-menu');
    if (!hamburgerMenu) {
        hamburgerMenu = document.createElement('div');
        hamburgerMenu.className = 'hamburger-menu';
        hamburgerMenu.innerHTML = `
            <div class="hamburger-icon">
                <span></span><span></span><span></span>
            </div>
        `;
        headerContainer.appendChild(hamburgerMenu);
    }

    const hamburgerIcon = hamburgerMenu.querySelector('.hamburger-icon');

    // Build/off-canvas mobile navigation
    const mobileNav = document.createElement('div');
    mobileNav.className = 'mobile-nav';

    // Clone desktop navigation but REMOVE the 'nav' class so it isn't hidden by media-query
    const desktopNav = document.querySelector('.nav');
    if (!desktopNav) return; // no nav, abort
    const navClone = desktopNav.cloneNode(true);
    navClone.classList.add('mobile-nav-links');
    navClone.classList.remove('nav');
    mobileNav.appendChild(navClone);

    // Dark overlay behind menu
    const overlay = document.createElement('div');
    overlay.className = 'mobile-overlay';

    document.body.appendChild(mobileNav);
    document.body.appendChild(overlay);

    // Helper to open / close
    const toggleMobileMenu = () => {
        mobileNav.classList.toggle('active');
        overlay.classList.toggle('active');
        hamburgerIcon.classList.toggle('active');
        document.body.style.overflow = mobileNav.classList.contains('active') ? 'hidden' : '';
    };
    const closeMobileMenu = () => {
        mobileNav.classList.remove('active');
        overlay.classList.remove('active');
        hamburgerIcon.classList.remove('active');
        document.body.style.overflow = '';
    };

    // Wire events
    hamburgerMenu.addEventListener('click', toggleMobileMenu);
    overlay.addEventListener('click', closeMobileMenu);
    // Close when any link (including in cloned menu) is tapped
    mobileNav.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });
}

function initializeHeroAudienceTyping() {
    const typingTarget = document.getElementById('hero-audience-text');
    if (!typingTarget) return;

    const audiences = [
        'Freelancers',
        'Students',
        'Small Businesses',
        'Privacy Enthusasists',
        'Journalists'
    ];

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        typingTarget.textContent = audiences[0];
        return;
    }

    const typeSpeedMs = 95;
    const deleteSpeedMs = 55;
    const fullWordPauseMs = 1200;
    const transitionPauseMs = 250;
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    const tick = () => {
        const currentWord = audiences[wordIndex];

        if (isDeleting) {
            charIndex = Math.max(charIndex - 1, 0);
            typingTarget.textContent = currentWord.slice(0, charIndex);

            if (charIndex === 0) {
                isDeleting = false;
                wordIndex = (wordIndex + 1) % audiences.length;
                setTimeout(tick, transitionPauseMs);
                return;
            }

            setTimeout(tick, deleteSpeedMs);
            return;
        }

        charIndex = Math.min(charIndex + 1, currentWord.length);
        typingTarget.textContent = currentWord.slice(0, charIndex);

        if (charIndex === currentWord.length) {
            isDeleting = true;
            setTimeout(tick, fullWordPauseMs);
            return;
        }

        setTimeout(tick, typeSpeedMs);
    };

    typingTarget.textContent = '';
    setTimeout(tick, 300);
}

function initializeHomeSmartWorkspace(pdfConverter) {
    const workspace = document.getElementById('home-workspace');
    const selectedToolTitle = document.getElementById('home-selected-tool');
    const pdfOperationPanel = document.getElementById('pdf-operation-panel');
    const pdfOperationGrid = document.getElementById('pdf-operation-grid');
    const resetButton = document.getElementById('home-reset-btn');
    const processButton = document.getElementById('process-btn');

    if (!document.getElementById('upload-area') || !document.getElementById('file-input') || !workspace || !selectedToolTitle || !pdfOperationPanel || !pdfOperationGrid) {
        return;
    }

    const getUploadArea = () => document.getElementById('upload-area');
    const getFileInput = () => document.getElementById('file-input');
    let pendingPdfFiles = [];
    let manualToolSelected = false;

    const originalHandleFileSelect = pdfConverter.handleFileSelect.bind(pdfConverter);
    const originalUpdateProcessButton = pdfConverter.updateProcessButton.bind(pdfConverter);
    const i18n = (key, replacements = {}) => {
        if (window.pdfswitchI18n && typeof window.pdfswitchI18n.t === 'function') {
            return window.pdfswitchI18n.t(key, replacements);
        }
        return Object.entries(replacements).reduce((value, [name, replacement]) => value.replace(`{${name}}`, replacement), key);
    };
    const routingConfig = createHomeSmartRoutingConfig(i18n);

    pdfConverter.updateProcessButton = function () {
        originalUpdateProcessButton();
        const button = document.getElementById('process-btn');
        if (!button) return;

        const fileCount = this.uploadedFiles.length;
        if (!this.currentTool) {
            button.disabled = true;
            button.innerHTML = `<i class="fas fa-cog"></i> ${i18n('start')}`;
            return;
        }

        if (fileCount === 0) {
            button.disabled = true;
            button.innerHTML = `<i class="fas fa-upload"></i> ${i18n('uploadFirst')}`;
            return;
        }

        button.innerHTML = `<i class="fas fa-cog"></i> ${i18n('processFiles', { count: fileCount })}`;
    };

    const setWorkspaceTitle = (toolName) => {
        if (!toolName) {
            selectedToolTitle.textContent = i18n('idleTool');
            return;
        }
        selectedToolTitle.textContent = pdfConverter.getToolConfig(toolName).title || toolName;
    };

    const showTip = (message, type = 'info') => {
        if (typeof pdfConverter.showNotification === 'function') {
            pdfConverter.showNotification(message, type);
        }
    };

    const clearPdfChooser = () => {
        pendingPdfFiles = [];
        pdfOperationPanel.hidden = true;
        pdfOperationGrid.innerHTML = '';
    };

    const resetWorkspace = () => {
        clearPdfChooser();
        manualToolSelected = false;
        pdfConverter.currentTool = null;
        pdfConverter.uploadedFiles = [];
        pdfConverter.watermarkImageAsset = null;
        const currentFileInput = getFileInput();
        if (currentFileInput) currentFileInput.accept = routingConfig.supportedAccept;
        pdfConverter.clearFileList();
        pdfConverter.clearResults();
        pdfConverter.hideProgress();
        const options = document.getElementById('tool-options');
        if (options) options.innerHTML = '';
        setWorkspaceTitle(null);
        pdfConverter.updateProcessButton();
    };

    const activateTool = async (toolName, files = []) => {
        clearPdfChooser();
        manualToolSelected = true;
        pdfConverter.currentTool = toolName;
        pdfConverter.uploadedFiles = [];
        pdfConverter.watermarkImageAsset = null;
        const currentFileInput = getFileInput();
        if (currentFileInput) currentFileInput.accept = pdfConverter.getToolConfig(toolName).accept || routingConfig.supportedAccept;
        pdfConverter.clearFileList();
        pdfConverter.clearResults();
        pdfConverter.hideProgress();
        pdfConverter.setupToolOptions(toolName);
        setWorkspaceTitle(toolName);
        pdfConverter.updateProcessButton();

        if (files.length) {
            await originalHandleFileSelect(files);
        } else {
            getUploadArea()?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    const showPdfOperations = (files) => {
        pendingPdfFiles = files;
        manualToolSelected = false;
        pdfConverter.currentTool = null;
        pdfConverter.uploadedFiles = [];
        pdfConverter.clearFileList();
        pdfConverter.clearResults();
        pdfConverter.hideProgress();
        const options = document.getElementById('tool-options');
        if (options) options.innerHTML = '';
        setWorkspaceTitle(null);
        pdfConverter.updateProcessButton();
        pdfOperationGrid.innerHTML = routingConfig.pdfOperations.map(operation => `
            <button class="pdf-operation-btn" type="button" data-tool="${operation.tool}">
                <i class="fas ${operation.icon}" aria-hidden="true"></i>
                <span>${i18n(operation.labelKey)}</span>
            </button>
        `).join('');
        pdfOperationPanel.hidden = false;
        pdfOperationPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    pdfConverter.handleFileSelect = async (files) => {
        const selectedFiles = Array.from(files || []);
        if (!selectedFiles.length) {
            pdfConverter.resetFileInput();
            return;
        }

        if (manualToolSelected && pdfConverter.currentTool) {
            await originalHandleFileSelect(selectedFiles);
            return;
        }

        const inference = inferHomeSmartTool(selectedFiles, routingConfig);
        if (inference.error) {
            resetWorkspace();
            showTip(inference.error, 'error');
            pdfConverter.resetFileInput();
            return;
        }

        if (inference.needsPdfChoice) {
            showPdfOperations(selectedFiles);
            pdfConverter.resetFileInput();
            return;
        }

        if (inference.tool) {
            await activateTool(inference.tool, selectedFiles);
            return;
        }
    };

    pdfOperationGrid.addEventListener('click', (event) => {
        const button = event.target.closest('[data-tool]');
        if (!button) return;
        activateTool(button.dataset.tool, pendingPdfFiles);
    });

    document.querySelectorAll('.tool-card[data-tool], .home-tool-links .tool-link[data-tool]').forEach(element => {
        element.addEventListener('click', (event) => {
            event.preventDefault();
            activateTool(element.dataset.tool);
        });
    });

    document.querySelectorAll('.tool-category-pills [data-filter]').forEach(button => {
        button.addEventListener('click', () => {
            const filter = button.dataset.filter;
            document.querySelectorAll('.tool-category-pills [data-filter]').forEach(item => {
                item.classList.toggle('active', item === button);
            });
            document.querySelectorAll('.tool-card[data-category], .home-tool-links .tool-link[data-category]').forEach(item => {
                const match = filter === 'all' || item.dataset.category === filter;
                item.style.display = match ? '' : 'none';
            });
        });
    });

    const searchBar = document.getElementById('tool-search-bar');
    if (searchBar) {
        searchBar.addEventListener('input', () => {
            const searchTerm = searchBar.value.toLowerCase().trim();
            document.querySelectorAll('.tool-card[data-tool], .home-tool-links .tool-link[data-tool]').forEach(item => {
                const text = item.textContent.toLowerCase();
                const tool = (item.dataset.tool || '').toLowerCase();
                item.style.display = (!searchTerm || text.includes(searchTerm) || tool.includes(searchTerm)) ? '' : 'none';
            });
        });
    }

    if (resetButton) {
        resetButton.addEventListener('click', resetWorkspace);
    }

    if (processButton) {
        processButton.addEventListener('click', () => {
            if (window.plausible) {
                setTimeout(() => {
                    window.plausible('ProcessButtonClick', { props: { tool: pdfConverter.currentTool } });
                    pdfConverter.processFiles();
                }, 0);
                return;
            }
            pdfConverter.processFiles();
        });
    }

    window.addEventListener('pdfswitch:languagechange', () => {
        setWorkspaceTitle(pdfConverter.currentTool);
        pdfConverter.updateProcessButton();
        if (!pdfOperationPanel.hidden) {
            showPdfOperations(pendingPdfFiles);
        }
    });

    const currentFileInput = getFileInput();
    if (currentFileInput) currentFileInput.accept = routingConfig.supportedAccept;
    pdfConverter.setupDragAndDrop();
    pdfConverter.bindFileInputEvents();
    resetWorkspace();
}

// Enable touch-friendly sorting for page thumbnails using SortableJS
if (typeof PDFConverterPro !== 'undefined' && typeof Sortable !== 'undefined') {
    PDFConverterPro.prototype.enableThumbnailSorting = function () {
        const container = document.getElementById('page-thumbnails');
        if (!container) return;

        // Destroy previous instance to avoid duplicates
        if (this.thumbnailSortable && typeof this.thumbnailSortable.destroy === 'function') {
            this.thumbnailSortable.destroy();
        }

        this.thumbnailSortable = Sortable.create(container, {
            animation: 220,
            easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
            draggable: '.page-thumbnail',
            // allow drag from any part of the thumbnail
            delay: 700,              // ~1 second long-press on touch devices
            delayOnTouchOnly: true,
            touchStartThreshold: 3,
            forceFallback: true,     // consistent drag preview
            fallbackOnBody: true,
            fallbackTolerance: 3,
            ghostClass: 'sortable-ghost',
            chosenClass: 'sortable-chosen',
            onEnd: () => {
                this.showNotification('Pages reordered! Click Process to generate the sorted PDF.', 'success');
            }
        });
    };
}

// Initialize the main application logic
document.addEventListener('DOMContentLoaded', function () {
    // Initialize FAQ on all pages
    initializeFAQAccordion();

    // Keep top nav ordering consistent across tool pages
    normalizeHeaderNavOrder();

    // Initialize global theming before cloning mobile nav
    initializeThemeSystem();

    // Initialize language controls before cloning mobile nav
    initializeLanguageSystem();

    // Initialize mobile navigation
    initializeMobileNav();
    if (window.pdfswitchI18n && typeof window.pdfswitchI18n.apply === 'function') {
        window.pdfswitchI18n.apply();
    }
    updateThemeOptionState();

    // Check if we are on the main page (index.html) by looking for the tools layout
    const isMainPage = document.querySelector('.home-tool-grid, .tools-grid, .tools-table');

    if (isMainPage) {
        window.pdfConverter = new PDFConverterPro();
        console.log('PDF Converter Pro initialized for main page');
        initializeHeroAudienceTyping();
        initializeHomeSmartWorkspace(window.pdfConverter);

        // Handle newsletter form submission
        const newsletterForm = document.getElementById('newsletter-form');
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', function (e) {
                e.preventDefault();
                const email = document.getElementById('newsletter-email').value;
                if (email) {
                    window.pdfConverter.showNotification('Thank you for subscribing!', 'success');
                    this.reset();
                } else {
                    window.pdfConverter.showNotification('Please enter a valid email address.', 'error');
                }
            });
        }

        // Smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }
    // Note: Tool-specific pages have their own initialization script in their respective HTML files,
    // which creates an instance of PDFConverterPro and calls setupToolSpecificPage().
});
