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

function initializeLanguageSystem() {
    const languages = {
        en: { label: 'English', dir: 'ltr' },
        'zh-CN': { label: '简体中文', dir: 'ltr' },
        'zh-TW': { label: '繁體中文', dir: 'ltr' },
        ja: { label: '日本語', dir: 'ltr' },
        ko: { label: '한국어', dir: 'ltr' },
        fr: { label: 'Français', dir: 'ltr' },
        es: { label: 'Español', dir: 'ltr' },
        tr: { label: 'Türkçe', dir: 'ltr' },
        fa: { label: 'فارسی', dir: 'rtl' }
    };
    const translations = {
        en: {
            allTools: 'All Tools', convert: 'Convert', organize: 'Merge/Split', compress: 'Compress', security: 'Security',
            kicker: 'Online PDF toolkit', title: 'All PDF tools, smart upload routing',
            subtitle: 'Drop PDFs, images, Word, Excel, PPT, HTML, or text files. PDFSwitch detects the file type and picks the right tool; PDF files can be merged, split, compressed, converted to images, encrypted, and more.',
            uploadAria: 'Upload files', uploadTitle: 'Drop files here', uploadHint: 'or click to choose files', chooseFiles: 'Choose files',
            uploadSupport: 'Supports PDF, PNG, JPG, WEBP, HEIF, SVG, TXT, HTML, MD, DOCX, RTF, Excel, PPT',
            currentTask: 'Current task', idleTool: 'Upload files or choose a tool', reset: 'Choose again',
            start: 'Start processing', uploadFirst: 'Upload files first', processFiles: 'Process {count} file(s)', processing: 'Processing...', results: 'Download results',
            pdfChoice: 'PDF detected. Choose an action', unsupported: 'Unsupported file type: {name}', sameType: 'Please upload the same file type in each batch.',
            commonTools: 'Common tools', searchPlaceholder: 'Search tools, e.g. Word to PDF', all: 'All',
            mergePdf: 'Merge PDF', mergePdfDesc: 'Combine multiple PDFs into one file', splitPdf: 'Split PDF', splitPdfDesc: 'Split by ranges or pages',
            compressPdf: 'Compress PDF', compressPdfDesc: 'Reduce PDF file size', pdfToPng: 'PDF to images', pdfToPngDesc: 'Export PNG images',
            wordToPdf: 'Word to PDF', wordToPdfDesc: 'Convert DOCX to PDF', pngToPdf: 'Images to PDF', pngToPdfDesc: 'Combine PNG images into PDF',
            addPassword: 'Encrypt PDF', addPasswordDesc: 'Add an opening password', removePassword: 'Decrypt PDF', removePasswordDesc: 'Remove known password protection',
            jpegToPdf: 'JPEG to PDF', webpToPdf: 'WEBP to PDF', htmlToPdf: 'HTML to PDF', markdownToPdf: 'Markdown to PDF', excelToPdf: 'Excel to PDF', pptToPdf: 'PPT to PDF', rotatePdf: 'Rotate PDF', extractPages: 'Extract pages',
            pdfToPngOp: 'PDF to PNG images', localFirst: 'Local first', localFirstDesc: 'Common processing runs in your browser',
            smartMatch: 'Smart matching', smartMatchDesc: 'Automatically picks the right tool after upload', freeUse: 'Free to use', freeUseDesc: 'Core tools work without registration',
            terms: 'Terms', changelog: 'Changelog', privacy: 'Privacy', contact: 'Feedback: contact@pdfonly.top', copyright: '© 2025 PDFSwitch. All rights reserved.'
        },
        'zh-CN': {
            allTools: '全部工具', convert: '转换', organize: '合并/拆分', compress: '压缩', security: '安全',
            kicker: '在线 PDF 工具箱', title: '所有 PDF 工具，一次上传智能选择',
            subtitle: '拖入 PDF、图片、Word、Excel、PPT、HTML 或文本文件。PDFSwitch 会按文件类型自动匹配工具；PDF 文件可选择合并、拆分、压缩、转图片、加密等操作。',
            uploadAria: '上传文件', uploadTitle: '拖放文件到这里', uploadHint: '或点击选择文件', chooseFiles: '选择文件',
            uploadSupport: '支持 PDF、PNG、JPG、WEBP、HEIF、SVG、TXT、HTML、MD、DOCX、RTF、Excel、PPT',
            currentTask: '当前任务', idleTool: '请先上传文件或选择工具', reset: '重新选择',
            start: '开始处理', uploadFirst: '请先上传文件', processFiles: '处理 {count} 个文件', processing: '处理中...', results: '下载结果',
            pdfChoice: '检测到 PDF 文件，请选择要执行的操作', unsupported: '暂不支持该文件类型：{name}', sameType: '请按同一类型文件分批上传',
            commonTools: '常用工具', searchPlaceholder: '搜索工具，例如 Word 转 PDF', all: '全部',
            mergePdf: '合并 PDF', mergePdfDesc: '多个 PDF 合成一个文件', splitPdf: '拆分 PDF', splitPdfDesc: '按范围或页面拆分',
            compressPdf: '压缩 PDF', compressPdfDesc: '减小 PDF 文件体积', pdfToPng: 'PDF 转图片', pdfToPngDesc: '导出 PNG 图片',
            wordToPdf: 'Word 转 PDF', wordToPdfDesc: 'DOCX 文档转 PDF', pngToPdf: '图片转 PDF', pngToPdfDesc: 'PNG 图片合成 PDF',
            addPassword: '加密 PDF', addPasswordDesc: '添加打开密码', removePassword: '解密 PDF', removePasswordDesc: '移除已知密码保护',
            jpegToPdf: 'JPEG 转 PDF', webpToPdf: 'WEBP 转 PDF', htmlToPdf: 'HTML 转 PDF', markdownToPdf: 'Markdown 转 PDF', excelToPdf: 'Excel 转 PDF', pptToPdf: 'PPT 转 PDF', rotatePdf: '旋转 PDF', extractPages: '提取页面',
            pdfToPngOp: 'PDF 转图片 PNG', localFirst: '本地优先', localFirstDesc: '常用处理在浏览器内完成',
            smartMatch: '智能匹配', smartMatchDesc: '上传后自动选择合适工具', freeUse: '免费使用', freeUseDesc: '核心工具无需注册',
            terms: '服务条款', changelog: '更新记录', privacy: '隐私政策', contact: '问题反馈：contact@pdfonly.top', copyright: '© 2025 PDFSwitch. All rights reserved.'
        },
        'zh-TW': {
            allTools: '全部工具', convert: '轉換', organize: '合併/拆分', compress: '壓縮', security: '安全',
            kicker: '線上 PDF 工具箱', title: '所有 PDF 工具，一次上傳智慧選擇',
            subtitle: '拖入 PDF、圖片、Word、Excel、PPT、HTML 或文字檔。PDFSwitch 會依檔案類型自動匹配工具；PDF 檔可選擇合併、拆分、壓縮、轉圖片、加密等操作。',
            uploadAria: '上傳檔案', uploadTitle: '拖放檔案到這裡', uploadHint: '或點擊選擇檔案', chooseFiles: '選擇檔案',
            uploadSupport: '支援 PDF、PNG、JPG、WEBP、HEIF、SVG、TXT、HTML、MD、DOCX、RTF、Excel、PPT',
            currentTask: '目前任務', idleTool: '請先上傳檔案或選擇工具', reset: '重新選擇',
            start: '開始處理', uploadFirst: '請先上傳檔案', processFiles: '處理 {count} 個檔案', processing: '處理中...', results: '下載結果',
            pdfChoice: '偵測到 PDF 檔，請選擇要執行的操作', unsupported: '暫不支援此檔案類型：{name}', sameType: '請按同一類型檔案分批上傳',
            commonTools: '常用工具', searchPlaceholder: '搜尋工具，例如 Word 轉 PDF', all: '全部',
            mergePdf: '合併 PDF', mergePdfDesc: '多個 PDF 合成一個檔案', splitPdf: '拆分 PDF', splitPdfDesc: '依範圍或頁面拆分',
            compressPdf: '壓縮 PDF', compressPdfDesc: '減小 PDF 檔案大小', pdfToPng: 'PDF 轉圖片', pdfToPngDesc: '匯出 PNG 圖片',
            wordToPdf: 'Word 轉 PDF', wordToPdfDesc: 'DOCX 文件轉 PDF', pngToPdf: '圖片轉 PDF', pngToPdfDesc: 'PNG 圖片合成 PDF',
            addPassword: '加密 PDF', addPasswordDesc: '新增開啟密碼', removePassword: '解密 PDF', removePasswordDesc: '移除已知密碼保護',
            jpegToPdf: 'JPEG 轉 PDF', webpToPdf: 'WEBP 轉 PDF', htmlToPdf: 'HTML 轉 PDF', markdownToPdf: 'Markdown 轉 PDF', excelToPdf: 'Excel 轉 PDF', pptToPdf: 'PPT 轉 PDF', rotatePdf: '旋轉 PDF', extractPages: '提取頁面',
            pdfToPngOp: 'PDF 轉圖片 PNG', localFirst: '本機優先', localFirstDesc: '常用處理在瀏覽器內完成',
            smartMatch: '智慧匹配', smartMatchDesc: '上傳後自動選擇合適工具', freeUse: '免費使用', freeUseDesc: '核心工具無需註冊',
            terms: '服務條款', changelog: '更新紀錄', privacy: '隱私政策', contact: '問題回饋：contact@pdfonly.top', copyright: '© 2025 PDFSwitch. All rights reserved.'
        },
        ja: {
            allTools: 'すべてのツール', convert: '変換', organize: '結合/分割', compress: '圧縮', security: 'セキュリティ',
            kicker: 'オンライン PDF ツールキット', title: 'すべての PDF ツールを、アップロードで自動選択',
            subtitle: 'PDF、画像、Word、Excel、PPT、HTML、テキストをドロップしてください。PDFSwitch がファイル形式を判定して最適なツールを選びます。PDF は結合、分割、圧縮、画像化、暗号化などに対応します。',
            uploadAria: 'ファイルをアップロード', uploadTitle: 'ここにファイルをドロップ', uploadHint: 'またはクリックして選択', chooseFiles: 'ファイルを選択',
            uploadSupport: 'PDF、PNG、JPG、WEBP、HEIF、SVG、TXT、HTML、MD、DOCX、RTF、Excel、PPT に対応',
            currentTask: '現在のタスク', idleTool: 'ファイルをアップロードするかツールを選択', reset: '選び直す',
            start: '処理を開始', uploadFirst: '先にファイルをアップロード', processFiles: '{count} 個のファイルを処理', processing: '処理中...', results: '結果をダウンロード',
            pdfChoice: 'PDF を検出しました。操作を選択してください', unsupported: '未対応のファイル形式です：{name}', sameType: '同じ種類のファイルごとに分けてアップロードしてください',
            commonTools: 'よく使うツール', searchPlaceholder: 'ツールを検索、例: Word to PDF', all: 'すべて',
            mergePdf: 'PDF を結合', mergePdfDesc: '複数の PDF を 1 つに結合', splitPdf: 'PDF を分割', splitPdfDesc: '範囲またはページで分割',
            compressPdf: 'PDF を圧縮', compressPdfDesc: 'PDF のファイルサイズを削減', pdfToPng: 'PDF を画像へ', pdfToPngDesc: 'PNG 画像として書き出し',
            wordToPdf: 'Word を PDF へ', wordToPdfDesc: 'DOCX を PDF に変換', pngToPdf: '画像を PDF へ', pngToPdfDesc: 'PNG 画像を PDF に結合',
            addPassword: 'PDF を暗号化', addPasswordDesc: '開封パスワードを追加', removePassword: 'PDF を復号', removePasswordDesc: '既知のパスワード保護を解除',
            jpegToPdf: 'JPEG を PDF へ', webpToPdf: 'WEBP を PDF へ', htmlToPdf: 'HTML を PDF へ', markdownToPdf: 'Markdown を PDF へ', excelToPdf: 'Excel を PDF へ', pptToPdf: 'PPT を PDF へ', rotatePdf: 'PDF を回転', extractPages: 'ページを抽出',
            pdfToPngOp: 'PDF を PNG 画像へ', localFirst: 'ローカル優先', localFirstDesc: '一般的な処理はブラウザ内で完了',
            smartMatch: 'スマート判定', smartMatchDesc: 'アップロード後に最適なツールを自動選択', freeUse: '無料で利用', freeUseDesc: '主要ツールは登録不要',
            terms: '利用規約', changelog: '更新履歴', privacy: 'プライバシー', contact: 'フィードバック：contact@pdfonly.top', copyright: '© 2025 PDFSwitch. All rights reserved.'
        },
        ko: {
            allTools: '전체 도구', convert: '변환', organize: '병합/분할', compress: '압축', security: '보안',
            kicker: '온라인 PDF 도구 상자', title: '모든 PDF 도구를 업로드 한 번으로 자동 선택',
            subtitle: 'PDF, 이미지, Word, Excel, PPT, HTML 또는 텍스트 파일을 올리세요. PDFSwitch가 파일 형식을 감지해 알맞은 도구를 선택합니다. PDF는 병합, 분할, 압축, 이미지 변환, 암호화 등을 지원합니다.',
            uploadAria: '파일 업로드', uploadTitle: '여기에 파일 놓기', uploadHint: '또는 클릭하여 선택', chooseFiles: '파일 선택',
            uploadSupport: 'PDF, PNG, JPG, WEBP, HEIF, SVG, TXT, HTML, MD, DOCX, RTF, Excel, PPT 지원',
            currentTask: '현재 작업', idleTool: '파일을 업로드하거나 도구를 선택하세요', reset: '다시 선택',
            start: '처리 시작', uploadFirst: '먼저 파일을 업로드하세요', processFiles: '파일 {count}개 처리', processing: '처리 중...', results: '결과 다운로드',
            pdfChoice: 'PDF가 감지되었습니다. 작업을 선택하세요', unsupported: '지원하지 않는 파일 형식: {name}', sameType: '같은 유형의 파일끼리 나누어 업로드하세요',
            commonTools: '자주 쓰는 도구', searchPlaceholder: '도구 검색, 예: Word to PDF', all: '전체',
            mergePdf: 'PDF 병합', mergePdfDesc: '여러 PDF를 하나로 결합', splitPdf: 'PDF 분할', splitPdfDesc: '범위 또는 페이지별 분할',
            compressPdf: 'PDF 압축', compressPdfDesc: 'PDF 파일 크기 줄이기', pdfToPng: 'PDF를 이미지로', pdfToPngDesc: 'PNG 이미지로 내보내기',
            wordToPdf: 'Word를 PDF로', wordToPdfDesc: 'DOCX를 PDF로 변환', pngToPdf: '이미지를 PDF로', pngToPdfDesc: 'PNG 이미지를 PDF로 결합',
            addPassword: 'PDF 암호화', addPasswordDesc: '열기 비밀번호 추가', removePassword: 'PDF 암호 해제', removePasswordDesc: '알고 있는 비밀번호 보호 제거',
            jpegToPdf: 'JPEG를 PDF로', webpToPdf: 'WEBP를 PDF로', htmlToPdf: 'HTML을 PDF로', markdownToPdf: 'Markdown을 PDF로', excelToPdf: 'Excel을 PDF로', pptToPdf: 'PPT를 PDF로', rotatePdf: 'PDF 회전', extractPages: '페이지 추출',
            pdfToPngOp: 'PDF를 PNG 이미지로', localFirst: '로컬 우선', localFirstDesc: '일반 처리는 브라우저에서 완료',
            smartMatch: '스마트 매칭', smartMatchDesc: '업로드 후 적합한 도구 자동 선택', freeUse: '무료 사용', freeUseDesc: '핵심 도구는 가입 없이 사용',
            terms: '이용약관', changelog: '변경 기록', privacy: '개인정보 처리방침', contact: '피드백: contact@pdfonly.top', copyright: '© 2025 PDFSwitch. All rights reserved.'
        },
        fr: {
            allTools: 'Tous les outils', convert: 'Convertir', organize: 'Fusion/Division', compress: 'Compresser', security: 'Sécurité',
            kicker: 'Boîte à outils PDF en ligne', title: 'Tous les outils PDF, sélection intelligente à l’envoi',
            subtitle: 'Déposez des PDF, images, fichiers Word, Excel, PPT, HTML ou texte. PDFSwitch détecte le type de fichier et choisit le bon outil ; les PDF peuvent être fusionnés, divisés, compressés, convertis en images ou protégés.',
            uploadAria: 'Téléverser des fichiers', uploadTitle: 'Déposez les fichiers ici', uploadHint: 'ou cliquez pour choisir', chooseFiles: 'Choisir des fichiers',
            uploadSupport: 'PDF, PNG, JPG, WEBP, HEIF, SVG, TXT, HTML, MD, DOCX, RTF, Excel, PPT pris en charge',
            currentTask: 'Tâche actuelle', idleTool: 'Téléversez des fichiers ou choisissez un outil', reset: 'Choisir à nouveau',
            start: 'Démarrer', uploadFirst: 'Téléversez d’abord des fichiers', processFiles: 'Traiter {count} fichier(s)', processing: 'Traitement...', results: 'Télécharger les résultats',
            pdfChoice: 'PDF détecté. Choisissez une action', unsupported: 'Type de fichier non pris en charge : {name}', sameType: 'Veuillez téléverser un seul type de fichier par lot.',
            commonTools: 'Outils courants', searchPlaceholder: 'Rechercher un outil, ex. Word vers PDF', all: 'Tout',
            mergePdf: 'Fusionner PDF', mergePdfDesc: 'Combiner plusieurs PDF en un fichier', splitPdf: 'Diviser PDF', splitPdfDesc: 'Diviser par plages ou pages',
            compressPdf: 'Compresser PDF', compressPdfDesc: 'Réduire la taille du PDF', pdfToPng: 'PDF en images', pdfToPngDesc: 'Exporter des images PNG',
            wordToPdf: 'Word en PDF', wordToPdfDesc: 'Convertir DOCX en PDF', pngToPdf: 'Images en PDF', pngToPdfDesc: 'Combiner des PNG en PDF',
            addPassword: 'Chiffrer PDF', addPasswordDesc: 'Ajouter un mot de passe', removePassword: 'Déchiffrer PDF', removePasswordDesc: 'Retirer une protection connue',
            jpegToPdf: 'JPEG en PDF', webpToPdf: 'WEBP en PDF', htmlToPdf: 'HTML en PDF', markdownToPdf: 'Markdown en PDF', excelToPdf: 'Excel en PDF', pptToPdf: 'PPT en PDF', rotatePdf: 'Faire pivoter PDF', extractPages: 'Extraire des pages',
            pdfToPngOp: 'PDF en PNG', localFirst: 'Local d’abord', localFirstDesc: 'Les traitements courants se font dans le navigateur',
            smartMatch: 'Correspondance intelligente', smartMatchDesc: 'L’outil adapté est choisi après l’envoi', freeUse: 'Gratuit', freeUseDesc: 'Outils principaux sans inscription',
            terms: 'Conditions', changelog: 'Journal des mises à jour', privacy: 'Confidentialité', contact: 'Retour : contact@pdfonly.top', copyright: '© 2025 PDFSwitch. All rights reserved.'
        },
        es: {
            allTools: 'Todas las herramientas', convert: 'Convertir', organize: 'Unir/Dividir', compress: 'Comprimir', security: 'Seguridad',
            kicker: 'Kit de herramientas PDF en línea', title: 'Todas las herramientas PDF con selección inteligente',
            subtitle: 'Suelta PDF, imágenes, Word, Excel, PPT, HTML o texto. PDFSwitch detecta el tipo de archivo y elige la herramienta correcta; los PDF pueden unirse, dividirse, comprimirse, convertirse en imágenes o protegerse.',
            uploadAria: 'Subir archivos', uploadTitle: 'Suelta archivos aquí', uploadHint: 'o haz clic para elegir', chooseFiles: 'Elegir archivos',
            uploadSupport: 'Admite PDF, PNG, JPG, WEBP, HEIF, SVG, TXT, HTML, MD, DOCX, RTF, Excel, PPT',
            currentTask: 'Tarea actual', idleTool: 'Sube archivos o elige una herramienta', reset: 'Elegir de nuevo',
            start: 'Iniciar procesamiento', uploadFirst: 'Sube archivos primero', processFiles: 'Procesar {count} archivo(s)', processing: 'Procesando...', results: 'Descargar resultados',
            pdfChoice: 'PDF detectado. Elige una acción', unsupported: 'Tipo de archivo no compatible: {name}', sameType: 'Sube el mismo tipo de archivo en cada lote.',
            commonTools: 'Herramientas comunes', searchPlaceholder: 'Buscar herramientas, ej. Word a PDF', all: 'Todo',
            mergePdf: 'Unir PDF', mergePdfDesc: 'Combina varios PDF en un archivo', splitPdf: 'Dividir PDF', splitPdfDesc: 'Divide por rangos o páginas',
            compressPdf: 'Comprimir PDF', compressPdfDesc: 'Reduce el tamaño del PDF', pdfToPng: 'PDF a imágenes', pdfToPngDesc: 'Exporta imágenes PNG',
            wordToPdf: 'Word a PDF', wordToPdfDesc: 'Convierte DOCX a PDF', pngToPdf: 'Imágenes a PDF', pngToPdfDesc: 'Combina PNG en PDF',
            addPassword: 'Cifrar PDF', addPasswordDesc: 'Añade contraseña de apertura', removePassword: 'Descifrar PDF', removePasswordDesc: 'Quita una protección conocida',
            jpegToPdf: 'JPEG a PDF', webpToPdf: 'WEBP a PDF', htmlToPdf: 'HTML a PDF', markdownToPdf: 'Markdown a PDF', excelToPdf: 'Excel a PDF', pptToPdf: 'PPT a PDF', rotatePdf: 'Rotar PDF', extractPages: 'Extraer páginas',
            pdfToPngOp: 'PDF a PNG', localFirst: 'Local primero', localFirstDesc: 'El procesamiento común se ejecuta en el navegador',
            smartMatch: 'Coincidencia inteligente', smartMatchDesc: 'Elige la herramienta adecuada tras subir', freeUse: 'Gratis', freeUseDesc: 'Herramientas clave sin registro',
            terms: 'Términos', changelog: 'Registro de cambios', privacy: 'Privacidad', contact: 'Comentarios: contact@pdfonly.top', copyright: '© 2025 PDFSwitch. All rights reserved.'
        },
        tr: {
            allTools: 'Tüm Araçlar', convert: 'Dönüştür', organize: 'Birleştir/Böl', compress: 'Sıkıştır', security: 'Güvenlik',
            kicker: 'Çevrimiçi PDF araç kutusu', title: 'Tüm PDF araçları, akıllı yükleme seçimi',
            subtitle: 'PDF, görsel, Word, Excel, PPT, HTML veya metin dosyalarını bırakın. PDFSwitch dosya türünü algılar ve doğru aracı seçer; PDF dosyaları birleştirilebilir, bölünebilir, sıkıştırılabilir, görsele dönüştürülebilir veya şifrelenebilir.',
            uploadAria: 'Dosya yükle', uploadTitle: 'Dosyaları buraya bırakın', uploadHint: 'veya seçmek için tıklayın', chooseFiles: 'Dosya seç',
            uploadSupport: 'PDF, PNG, JPG, WEBP, HEIF, SVG, TXT, HTML, MD, DOCX, RTF, Excel, PPT desteklenir',
            currentTask: 'Geçerli görev', idleTool: 'Dosya yükleyin veya araç seçin', reset: 'Yeniden seç',
            start: 'İşlemeyi başlat', uploadFirst: 'Önce dosya yükleyin', processFiles: '{count} dosyayı işle', processing: 'İşleniyor...', results: 'Sonuçları indir',
            pdfChoice: 'PDF algılandı. Bir işlem seçin', unsupported: 'Desteklenmeyen dosya türü: {name}', sameType: 'Lütfen her yüklemede aynı dosya türünü kullanın.',
            commonTools: 'Sık kullanılan araçlar', searchPlaceholder: 'Araç ara, ör. Word to PDF', all: 'Tümü',
            mergePdf: 'PDF Birleştir', mergePdfDesc: 'Birden çok PDF’yi tek dosyada birleştir', splitPdf: 'PDF Böl', splitPdfDesc: 'Aralığa veya sayfaya göre böl',
            compressPdf: 'PDF Sıkıştır', compressPdfDesc: 'PDF dosya boyutunu azalt', pdfToPng: 'PDF’den görsele', pdfToPngDesc: 'PNG görselleri dışa aktar',
            wordToPdf: 'Word’den PDF’ye', wordToPdfDesc: 'DOCX’i PDF’ye dönüştür', pngToPdf: 'Görsellerden PDF’ye', pngToPdfDesc: 'PNG görsellerini PDF’de birleştir',
            addPassword: 'PDF Şifrele', addPasswordDesc: 'Açma parolası ekle', removePassword: 'PDF Şifresini Kaldır', removePasswordDesc: 'Bilinen parola korumasını kaldır',
            jpegToPdf: 'JPEG’den PDF’ye', webpToPdf: 'WEBP’den PDF’ye', htmlToPdf: 'HTML’den PDF’ye', markdownToPdf: 'Markdown’dan PDF’ye', excelToPdf: 'Excel’den PDF’ye', pptToPdf: 'PPT’den PDF’ye', rotatePdf: 'PDF Döndür', extractPages: 'Sayfaları çıkar',
            pdfToPngOp: 'PDF’den PNG’ye', localFirst: 'Önce yerel', localFirstDesc: 'Yaygın işlemler tarayıcıda tamamlanır',
            smartMatch: 'Akıllı eşleşme', smartMatchDesc: 'Yüklemeden sonra uygun aracı otomatik seçer', freeUse: 'Ücretsiz kullanım', freeUseDesc: 'Temel araçlar kayıt gerektirmez',
            terms: 'Şartlar', changelog: 'Değişiklikler', privacy: 'Gizlilik', contact: 'Geri bildirim: contact@pdfonly.top', copyright: '© 2025 PDFSwitch. All rights reserved.'
        },
        fa: {
            allTools: 'همه ابزارها', convert: 'تبدیل', organize: 'ادغام/تقسیم', compress: 'فشرده‌سازی', security: 'امنیت',
            kicker: 'جعبه‌ابزار آنلاین PDF', title: 'همه ابزارهای PDF با انتخاب هوشمند پس از آپلود',
            subtitle: 'PDF، تصویر، Word، Excel، PPT، HTML یا فایل متنی را رها کنید. PDFSwitch نوع فایل را تشخیص می‌دهد و ابزار مناسب را انتخاب می‌کند؛ برای PDF می‌توانید ادغام، تقسیم، فشرده‌سازی، تبدیل به تصویر و رمزگذاری را انجام دهید.',
            uploadAria: 'آپلود فایل‌ها', uploadTitle: 'فایل‌ها را اینجا رها کنید', uploadHint: 'یا برای انتخاب کلیک کنید', chooseFiles: 'انتخاب فایل',
            uploadSupport: 'پشتیبانی از PDF، PNG، JPG، WEBP، HEIF، SVG، TXT، HTML، MD، DOCX، RTF، Excel، PPT',
            currentTask: 'کار فعلی', idleTool: 'فایل آپلود کنید یا ابزار را انتخاب کنید', reset: 'انتخاب دوباره',
            start: 'شروع پردازش', uploadFirst: 'ابتدا فایل آپلود کنید', processFiles: 'پردازش {count} فایل', processing: 'در حال پردازش...', results: 'دانلود نتیجه',
            pdfChoice: 'PDF شناسایی شد. یک عملیات انتخاب کنید', unsupported: 'این نوع فایل پشتیبانی نمی‌شود: {name}', sameType: 'لطفاً هر بار فقط یک نوع فایل را آپلود کنید.',
            commonTools: 'ابزارهای پرکاربرد', searchPlaceholder: 'جستجوی ابزار، مثل Word to PDF', all: 'همه',
            mergePdf: 'ادغام PDF', mergePdfDesc: 'چند PDF را در یک فایل ترکیب کنید', splitPdf: 'تقسیم PDF', splitPdfDesc: 'تقسیم بر اساس بازه یا صفحه',
            compressPdf: 'فشرده‌سازی PDF', compressPdfDesc: 'کاهش حجم فایل PDF', pdfToPng: 'PDF به تصویر', pdfToPngDesc: 'خروجی گرفتن تصویر PNG',
            wordToPdf: 'Word به PDF', wordToPdfDesc: 'تبدیل DOCX به PDF', pngToPdf: 'تصویر به PDF', pngToPdfDesc: 'ترکیب تصاویر PNG در PDF',
            addPassword: 'رمزگذاری PDF', addPasswordDesc: 'افزودن رمز عبور باز کردن', removePassword: 'برداشتن رمز PDF', removePasswordDesc: 'حذف محافظت با رمز شناخته‌شده',
            jpegToPdf: 'JPEG به PDF', webpToPdf: 'WEBP به PDF', htmlToPdf: 'HTML به PDF', markdownToPdf: 'Markdown به PDF', excelToPdf: 'Excel به PDF', pptToPdf: 'PPT به PDF', rotatePdf: 'چرخاندن PDF', extractPages: 'استخراج صفحات',
            pdfToPngOp: 'PDF به PNG', localFirst: 'اولویت با مرورگر', localFirstDesc: 'پردازش‌های رایج در مرورگر انجام می‌شوند',
            smartMatch: 'تطبیق هوشمند', smartMatchDesc: 'پس از آپلود ابزار مناسب را خودکار انتخاب می‌کند', freeUse: 'رایگان', freeUseDesc: 'ابزارهای اصلی بدون ثبت‌نام کار می‌کنند',
            terms: 'شرایط', changelog: 'گزارش تغییرات', privacy: 'حریم خصوصی', contact: 'بازخورد: contact@pdfonly.top', copyright: '© 2025 PDFSwitch. All rights reserved.'
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
                'merge-pdf': 'mergePdf', 'split-pdf': 'splitPdf', 'compress-pdf': 'compressPdf', 'pdf-to-png': 'pdfToPngOp',
                'add-password': 'addPassword', 'remove-password': 'removePassword', 'rotate-pdf': 'rotatePdf', 'extract-pages': 'extractPages'
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
            if (menu) menu.hidden = false;
        });
    };
    const applyLanguage = (lang, persist = true) => {
        const resolved = normalizeLanguage(lang);
        const config = languages[resolved];
        document.documentElement.lang = resolved;
        document.documentElement.dir = config.dir;
        document.querySelectorAll('.language-menu').forEach((menu) => {
            menu.hidden = false;
        });
        document.querySelectorAll('[data-current-language]').forEach((label) => {
            label.textContent = config.label;
        });
        document.querySelectorAll('.language-option').forEach((option) => {
            const isActive = option.dataset.lang === resolved;
            option.classList.toggle('active', isActive);
            option.setAttribute('aria-pressed', String(isActive));
        });
        window.pdfswitchI18n = { language: resolved, t, apply: applyTranslations };
        applyTranslations();
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
    if (savedLanguage.toLowerCase().startsWith('zh-tw') || savedLanguage.toLowerCase().startsWith('zh-hk')) {
        savedLanguage = 'zh-TW';
    } else if (savedLanguage.toLowerCase().startsWith('zh')) {
        savedLanguage = 'zh-CN';
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

    const supportedAccept = '.pdf,.png,.jpg,.jpeg,.webp,.heif,.heic,.svg,.txt,.html,.htm,.md,.markdown,.docx,.rtf,.xls,.xlsx,.ppt,.pptx';
    const getUploadArea = () => document.getElementById('upload-area');
    const getFileInput = () => document.getElementById('file-input');
    const toolByExtension = new Map([
        ['png', 'png-to-pdf'],
        ['jpg', 'jpeg-to-pdf'],
        ['jpeg', 'jpeg-to-pdf'],
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
        ['pptx', 'ppt-to-pdf']
    ]);
    const pdfOperations = [
        { labelKey: 'mergePdf', tool: 'merge-pdf', icon: 'fa-object-group' },
        { labelKey: 'splitPdf', tool: 'split-pdf', icon: 'fa-cut' },
        { labelKey: 'compressPdf', tool: 'compress-pdf', icon: 'fa-compress' },
        { labelKey: 'pdfToPngOp', tool: 'pdf-to-png', icon: 'fa-image' },
        { labelKey: 'addPassword', tool: 'add-password', icon: 'fa-lock' },
        { labelKey: 'removePassword', tool: 'remove-password', icon: 'fa-unlock' },
        { labelKey: 'rotatePdf', tool: 'rotate-pdf', icon: 'fa-redo' },
        { labelKey: 'extractPages', tool: 'extract-pages', icon: 'fa-copy' }
    ];
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

    const getExtension = (file) => {
        const name = (file && file.name) ? file.name : '';
        const dotIndex = name.lastIndexOf('.');
        return dotIndex >= 0 ? name.slice(dotIndex + 1).toLowerCase() : '';
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
        if (currentFileInput) currentFileInput.accept = supportedAccept;
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
        if (currentFileInput) currentFileInput.accept = pdfConverter.getToolConfig(toolName).accept || supportedAccept;
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
        pdfOperationGrid.innerHTML = pdfOperations.map(operation => `
            <button class="pdf-operation-btn" type="button" data-tool="${operation.tool}">
                <i class="fas ${operation.icon}" aria-hidden="true"></i>
                <span>${i18n(operation.labelKey)}</span>
            </button>
        `).join('');
        pdfOperationPanel.hidden = false;
        pdfOperationPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    const inferSmartTool = (files) => {
        const inferred = files.map(file => {
            const extension = getExtension(file);
            if (extension === 'pdf') return { kind: 'pdf', file };
            const tool = toolByExtension.get(extension);
            return tool ? { kind: 'tool', tool, file } : { kind: 'unsupported', extension, file };
        });

        const unsupported = inferred.find(item => item.kind === 'unsupported');
        if (unsupported) {
            return { error: i18n('unsupported', { name: unsupported.file.name }) };
        }

        const hasPdf = inferred.some(item => item.kind === 'pdf');
        const nonPdfTools = new Set(inferred.filter(item => item.kind === 'tool').map(item => item.tool));
        if (hasPdf && nonPdfTools.size > 0) {
            return { error: i18n('sameType') };
        }
        if (nonPdfTools.size > 1) {
            return { error: i18n('sameType') };
        }
        if (hasPdf) {
            return { needsPdfChoice: true };
        }
        return { tool: Array.from(nonPdfTools)[0] };
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

        const inference = inferSmartTool(selectedFiles);
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
    if (currentFileInput) currentFileInput.accept = supportedAccept;
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
