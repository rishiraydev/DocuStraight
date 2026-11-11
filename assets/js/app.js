window.app = (function() {
    // State
    let state = {
        docType: 'one-sided', // 'one-sided' | 'two-sided'
        currentSide: 'front', // 'front' | 'back'
        frontImage: null,
        backImage: null,
        frontProcessedData: null, 
        backProcessedData: null,  
        processedMat: null,   // OpenCV Mat of cropped image
        filteredMat: null,    // OpenCV Mat of filtered image
        points: [],
        scaleBase: 1,
        uploadTarget: 'front', // explicit separate uploads
        cropApplied: false,
        zoomLevel: 1.0
    };

    // DOM Elements
    const elements = {
        fileInputFront: document.getElementById('fileInputFront'),
        fileInputBack: document.getElementById('fileInputBack'),
        stepUpload: document.getElementById('step-upload'),
        stepProcess: document.getElementById('step-process'),
        zoneSingle: document.getElementById('uploadZoneSingle'),
        zoneDual: document.getElementById('uploadZoneDual'),
        
        statusFront: document.getElementById('statusFront'),
        statusBack: document.getElementById('statusBack'),
        indicatorFront: document.getElementById('indicatorFront'),
        indicatorBack: document.getElementById('indicatorBack'),
        btnProceedCrop: document.getElementById('btnProceedCrop'),
        
        sourceCanvas: document.getElementById('sourceCanvas'),
        a4PreviewCanvas: document.getElementById('a4PreviewCanvas'), 
        previewPlaceholder: document.getElementById('previewPlaceholder'),
        canvasWrapper: document.getElementById('canvasWrapper'),
        workspaceContainer: document.getElementById('workspaceContainer'),
        cornerLines: document.getElementById('cornerLines'),
        cropPolygon: document.getElementById('cropPolygon'),
        processingLoader: document.getElementById('processingLoader'),
        magnifier: document.getElementById('magnifier'),
        valZoomLevel: document.getElementById('valZoomLevel'),
        
        btnApplyCrop: document.getElementById('btnApplyCrop'),
        btnResetCrop: document.getElementById('btnResetCrop'),
        filterBtns: document.querySelectorAll('.filter-btn'),
        btnResetAdjustments: document.getElementById('btnResetAdjustments'),
        valBrightness: document.getElementById('valBrightness'),
        adjBrightness: document.getElementById('adjBrightness'),
        valContrast: document.getElementById('valContrast'),
        adjContrast: document.getElementById('adjContrast'),
        valSaturation: document.getElementById('valSaturation'),
        adjSaturation: document.getElementById('adjSaturation'),
        valExposure: document.getElementById('valExposure'),
        adjExposure: document.getElementById('adjExposure'),
        rotateControls: document.getElementById('rotateControls'),
        
        btnDownloadJpg: document.getElementById('btnDownloadJpg'),
        btnDownloadPdf: document.getElementById('btnDownloadPdf'),
        twoSidedControls: document.getElementById('twoSidedControls'),
        btnNextSide: document.getElementById('btnNextSide'),
        workspaceTitle: document.getElementById('workspaceTitle')
    };

    const corners = [
        document.getElementById('pt-tl'),
        document.getElementById('pt-tr'),
        document.getElementById('pt-br'),
        document.getElementById('pt-bl')
    ];

    let draggingPoint = null;
    let isInitialized = false;

    // Constants for A4 & ID Card
    const A4_WIDTH_MM = 210;
    const A4_HEIGHT_MM = 297;
    const ID_WIDTH_MM = 85.60;
    const ID_HEIGHT_MM = 53.98;
    const PIXELS_PER_MM = 10; // For crisp Preview Canvas Generation
    const BORDER_RADIUS_MM = 3.18; // standard ID card corner radius roughly 1/8 inch

    function init() {
        if (isInitialized) return;
        isInitialized = true;
        bindEvents();
        updateUploadUI();
    }

    function bindEvents() {
        const preventDefault = (e) => e.preventDefault();
        [elements.zoneSingle, document.getElementById('zoneFront'), document.getElementById('zoneBack')].forEach(el => {
            if(!el) return;
            el.addEventListener('dragover', preventDefault);
            el.addEventListener('drop', (e) => {
                e.preventDefault();
                if (e.dataTransfer.files.length) {
                    processFiles(e.dataTransfer.files, el.id === 'uploadZoneSingle' ? 'front' : (el.id === 'zoneFront' ? 'front' : 'back'));
                }
            });
        });

        // Exact Input targeting
        elements.fileInputFront.addEventListener('change', (e) => {
            if (e.target.files.length) processFiles(e.target.files, 'front');
            elements.fileInputFront.value = ''; 
        });
        
        elements.fileInputBack.addEventListener('change', (e) => {
            if (e.target.files.length) processFiles(e.target.files, 'back');
            elements.fileInputBack.value = ''; 
        });

        document.querySelectorAll('input[name="docType"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                state.docType = e.target.value;
                updateUploadUI();
            });
        });

        corners.forEach((corner, index) => {
            corner.addEventListener('mousedown', (e) => startDrag(e, index));
            corner.addEventListener('touchstart', (e) => startDrag(e.touches[0], index), {passive: false});
        });

        document.addEventListener('mousemove', drag);
        document.addEventListener('touchmove', (e) => drag(e.touches[0]), {passive: false});
        document.addEventListener('mouseup', endDrag);
        document.addEventListener('touchend', endDrag);

        elements.btnApplyCrop.addEventListener('click', applyPerspectiveCorrection);
        elements.btnResetCrop.addEventListener('click', resetCropSelection);
        elements.btnResetAdjustments.addEventListener('click', resetManualAdjustments);
        
        elements.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                elements.filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                applyFilterAndSettings();
            });
        });
        
        // Manual Adjustments
        elements.adjBrightness.addEventListener('input', (e) => elements.valBrightness.textContent = e.target.value);
        elements.adjContrast.addEventListener('input', (e) => elements.valContrast.textContent = e.target.value);
        elements.adjSaturation.addEventListener('input', (e) => elements.valSaturation.textContent = e.target.value);
        elements.adjExposure.addEventListener('input', (e) => elements.valExposure.textContent = e.target.value);
        
        elements.adjBrightness.addEventListener('change', applyFilterAndSettings);
        elements.adjContrast.addEventListener('change', applyFilterAndSettings);
        elements.adjSaturation.addEventListener('change', applyFilterAndSettings);
        elements.adjExposure.addEventListener('change', applyFilterAndSettings);

        elements.btnDownloadJpg.addEventListener('click', () => downloadFile('jpg'));
        elements.btnDownloadPdf.addEventListener('click', () => downloadFile('pdf'));
        elements.btnNextSide.addEventListener('click', proceedToNextSideCrop);
    }

    function triggerUpload(target) {
        state.uploadTarget = target;
        if(target === 'front') elements.fileInputFront.click();
        else elements.fileInputBack.click();
    }

    function updateUploadUI() {
        if (state.docType === 'one-sided') {
            elements.zoneSingle.classList.remove('d-none');
            elements.zoneDual.classList.add('d-none');
        } else {
            elements.zoneSingle.classList.add('d-none');
            elements.zoneDual.classList.remove('d-none');
        }
    }

    function processFiles(files, target) {
        if (state.docType === 'one-sided') {
            loadImage(files[0], 'front').then(() => startProcessing());
        } else {
            loadImage(files[0], target);
        }
    }

    function loadImage(file, side) {
        return new Promise((resolve) => {
            if (!file || !file.type.match('image.*')) {
                alert("Please upload a valid image file (JPG/JPEG/PNG).");
                resolve();
                return;
            }
            
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    if (side === 'front') {
                        state.frontImage = img;
                        elements.statusFront.textContent = 'Ready';
                        elements.statusFront.classList.replace('text-dark', 'text-success');
                        elements.indicatorFront.style.display = 'block';
                        elements.indicatorFront.classList.replace('bg-danger', 'bg-success');
                    } else if (side === 'back') {
                        state.backImage = img;
                        elements.statusBack.textContent = 'Ready';
                        elements.statusBack.classList.replace('text-dark', 'text-success');
                        elements.indicatorBack.style.display = 'block';
                        elements.indicatorBack.classList.replace('bg-danger', 'bg-success');
                    }
                    checkTwoSidedReady();
                    resolve();
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    function checkTwoSidedReady() {
        if (state.docType === 'two-sided') {
            if (state.frontImage && state.backImage) {
                 elements.btnProceedCrop.classList.remove('d-none');
            } else if (state.frontImage && !state.backImage) {
                 elements.btnProceedCrop.classList.add('d-none');
            }
        }
    }

    function startProcessing() {
        state.currentSide = 'front';
        state.frontProcessedData = null;
        state.backProcessedData = null;
        setupWorkspaceForCurrentSide();
    }

    function setupWorkspaceForCurrentSide() {
        elements.stepUpload.classList.add('d-none');
        elements.stepUpload.classList.remove('active');
        elements.stepProcess.classList.remove('d-none');
        elements.stepProcess.classList.add('active');

        elements.a4PreviewCanvas.classList.add('d-none');
        elements.previewPlaceholder.classList.remove('d-none');

        if(state.docType === 'two-sided') {
            elements.workspaceTitle.innerHTML = `<span class="bg-primary text-white rounded-circle d-inline-flex justify-content-center align-items-center me-3" style="width: 36px; height: 36px;"><i class="bi bi-crop"></i></span> Adjust Perspective (Side ${state.currentSide === 'front' ? '1' : '2'}/2)`;
        } else {
            elements.workspaceTitle.innerHTML = `<span class="bg-primary text-white rounded-circle d-inline-flex justify-content-center align-items-center me-3" style="width: 36px; height: 36px;"><i class="bi bi-crop"></i></span> Adjust Perspective`;
        }
        
        state.cropApplied = false;
        elements.btnApplyCrop.classList.remove('d-none');
        elements.btnResetCrop.classList.add('d-none');
        elements.cornerLines.style.display = 'block';
        corners.forEach(c => c.style.display = 'block');
        elements.rotateControls.classList.remove('d-none');
        
        resetManualAdjustments();
        document.querySelector('.filter-btn.active')?.classList.remove('active');
        document.querySelector('.filter-btn[data-filter="original"]').classList.add('active');

        renderWorkspaceImage();

        elements.twoSidedControls.classList.add('d-none');
        elements.btnDownloadJpg.disabled = true;
        elements.btnDownloadPdf.disabled = true;
    }
    
    function resetManualAdjustments() {
        elements.adjBrightness.value = 0; elements.valBrightness.textContent = "0";
        elements.adjContrast.value = 0; elements.valContrast.textContent = "0";
        elements.adjSaturation.value = 0; elements.valSaturation.textContent = "0";
        elements.adjExposure.value = 0; elements.valExposure.textContent = "0";
        if (state.cropApplied) applyFilterAndSettings();
    }

    function resetCropSelection() {
        state.cropApplied = false;
        elements.btnApplyCrop.classList.remove('d-none');
        elements.btnResetCrop.classList.add('d-none');
        elements.cornerLines.style.display = 'block';
        corners.forEach(c => c.style.display = 'block');
        elements.rotateControls.classList.remove('d-none');
        
        if (state.currentSide === 'front') state.frontProcessedData = null;
        else state.backProcessedData = null;
        
        elements.a4PreviewCanvas.classList.add('d-none');
        renderA4Preview();
    }
    
    function zoomImage(increment) {
        state.zoomLevel += increment;
        state.zoomLevel = Math.max(0.2, Math.min(state.zoomLevel, 3.0)); // restrict 20% to 300%
        elements.canvasWrapper.style.transform = `scale(${state.zoomLevel})`;
        elements.valZoomLevel.textContent = `${Math.round(state.zoomLevel * 100)}%`;
    }
    
    function resetZoom() {
        state.zoomLevel = 1.0;
        elements.canvasWrapper.style.transform = `scale(1)`;
        elements.valZoomLevel.textContent = `100%`;
    }

    function renderWorkspaceImage() {
        const sourceImg = state.currentSide === 'front' ? state.frontImage : state.backImage;
        const canvas = elements.sourceCanvas;
        const ctx = canvas.getContext('2d');
        
        // Dynamically compute absolute maximum bounds for rendering optimally
        const maxWidth = elements.workspaceContainer.clientWidth - 40;
        const maxHeight = (elements.workspaceContainer.clientHeight - 40) || 600;
        
        let w = sourceImg.width;
        let h = sourceImg.height;

        state.scaleBase = 1;
        
        // Compute strict scale limit maintaining aspect ratios dynamically
        const scaleW = maxWidth / w;
        const scaleH = maxHeight / h;
        const bestScale = Math.min(scaleW, scaleH);
        
        state.scaleBase = bestScale;
        w = w * bestScale;
        h = h * bestScale;

        canvas.width = w;
        canvas.height = h;
        ctx.drawImage(sourceImg, 0, 0, w, h);

        const margin = 20;
        state.points = [
            { x: margin, y: margin }, // TL
            { x: w - margin, y: margin }, // TR
            { x: w - margin, y: h - margin }, // BR
            { x: margin, y: h - margin } // BL
        ];
        
        updatePointsUI();
    }
    
    // Rotate function changes the sourceImage memory replacing it with adjusted image.
    function rotateImage(degrees) {
        if (state.cropApplied) return;
        showLoader(true);
        setTimeout(() => {
            const sourceImg = state.currentSide === 'front' ? state.frontImage : state.backImage;
            const tCanvas = document.createElement('canvas');
            const tCtx = tCanvas.getContext('2d');
            
            if (degrees === 90 || degrees === -90) {
                tCanvas.width = sourceImg.height;
                tCanvas.height = sourceImg.width;
            } else {
                tCanvas.width = sourceImg.width;
                tCanvas.height = sourceImg.height;
            }
            
            tCtx.translate(tCanvas.width / 2, tCanvas.height / 2);
            tCtx.rotate((degrees * Math.PI) / 180);
            tCtx.drawImage(sourceImg, -sourceImg.width / 2, -sourceImg.height / 2);
            
            const newImg = new Image();
            newImg.onload = () => {
                if(state.currentSide === 'front') state.frontImage = newImg;
                else state.backImage = newImg;
                
                renderWorkspaceImage();
                showLoader(false);
            };
            newImg.src = tCanvas.toDataURL('image/jpeg', 1.0);
        }, 50);
    }

    function startDrag(e, index) { 
        draggingPoint = index; 
        elements.magnifier.classList.remove('d-none');
        updateMagnifier(e);
    }

    function drag(e) {
        if (draggingPoint === null || state.cropApplied) return;
        const rect = elements.sourceCanvas.getBoundingClientRect();
        
        // Correct mouse coordinates factoring CSS scale() transformations
        let x = (e.clientX || e.touches[0].clientX) - rect.left;
        let y = (e.clientY || e.touches[0].clientY) - rect.top;
        x = x / state.zoomLevel;
        y = y / state.zoomLevel;

        x = Math.max(0, Math.min(x, elements.sourceCanvas.width));
        y = Math.max(0, Math.min(y, elements.sourceCanvas.height));

        state.points[draggingPoint] = { x, y };
        updatePointsUI();
        updateMagnifier(e);
    }

    function endDrag() { 
        draggingPoint = null; 
        elements.magnifier.classList.add('d-none');
    }
    
    function updateMagnifier(e) {
        if (draggingPoint === null) return;
        
        const rect = elements.sourceCanvas.getBoundingClientRect();
        let clientX = e.clientX || e.touches[0].clientX;
        let clientY = e.clientY || e.touches[0].clientY;
        
        // Extract exact point being manipulated relative to intrinsic canvas
        let pt = state.points[draggingPoint];
        
        let displayX = pt.x * state.zoomLevel;
        let displayY = pt.y * state.zoomLevel;
        
        // Position magnifier box identically where the active corner div is rendering but shifted above
        elements.magnifier.style.left = `${pt.x}px`;
        elements.magnifier.style.top = `${pt.y}px`;
        
        // Calculate the zoom into the actual drawn canvas
        const magZoom = 2; // Fixed magnifier optical zoom
        const bgSizeW = elements.sourceCanvas.width * magZoom;
        const bgSizeH = elements.sourceCanvas.height * magZoom;
        
        elements.magnifier.style.backgroundImage = `url(${elements.sourceCanvas.toDataURL()})`;
        elements.magnifier.style.backgroundSize = `${bgSizeW}px ${bgSizeH}px`;
        
        // The center of the background should focus perfectly on the pt coordinates modified by magZoom
        const bgX = -((pt.x * magZoom) - 65); // 65 is half of magnifier width
        const bgY = -((pt.y * magZoom) - 65);
        elements.magnifier.style.backgroundPosition = `${bgX}px ${bgY}px`;
    }

    function updatePointsUI() {
        const svgW = elements.sourceCanvas.width;
        const svgH = elements.sourceCanvas.height;
        elements.cornerLines.setAttribute('viewBox', `0 0 ${svgW} ${svgH}`);
        let polygonPoints = "";
        state.points.forEach((pt, i) => {
            corners[i].style.left = `${pt.x}px`;
            corners[i].style.top = `${pt.y}px`;
            polygonPoints += `${pt.x},${pt.y} `;
        });
        elements.cropPolygon.setAttribute('points', polygonPoints.trim());
    }

    function showLoader(show) {
        if (show) elements.processingLoader.classList.remove('d-none');
        else elements.processingLoader.classList.add('d-none');
    }

    function distance(p1, p2) { return Math.hypot(p1.x - p2.x, p1.y - p2.y); }

    function applyPerspectiveCorrection() {
        if (!window.cvReady) {
            alert('OpenCV is loading. Please wait.');
            return;
        }
        
        showLoader(true);
        setTimeout(() => {
            try {
                const sourceImg = state.currentSide === 'front' ? state.frontImage : state.backImage;
                let src = cv.imread(sourceImg);
                
                const scale = 1 / state.scaleBase;
                const tl = state.points[0];
                const tr = state.points[1];
                const br = state.points[2];
                const bl = state.points[3];
                
                const widthA = distance(br, bl) * scale;
                const widthB = distance(tr, tl) * scale;
                const maxWidth = Math.max(widthA, widthB);

                const heightA = distance(tr, br) * scale;
                const heightB = distance(tl, bl) * scale;
                const maxHeight = Math.max(heightA, heightB);
                
                const targetRatio = ID_WIDTH_MM / ID_HEIGHT_MM; // 1.5857
                let targetWidth = maxWidth;
                let targetHeight = maxWidth / targetRatio;
                
                const dsize = new cv.Size(targetWidth, targetHeight);

                const srcTri = cv.matFromArray(4, 1, cv.CV_32FC2, [
                    tl.x * scale, tl.y * scale,
                    tr.x * scale, tr.y * scale,
                    br.x * scale, br.y * scale,
                    bl.x * scale, bl.y * scale
                ]);

                const dstTri = cv.matFromArray(4, 1, cv.CV_32FC2, [
                    0, 0,
                    targetWidth - 1, 0,
                    targetWidth - 1, targetHeight - 1,
                    0, targetHeight - 1
                ]);

                const M = cv.getPerspectiveTransform(srcTri, dstTri);
                const dst = new cv.Mat();
                cv.warpPerspective(src, dst, M, dsize, cv.INTER_LINEAR, cv.BORDER_CONSTANT, new cv.Scalar());

                if (state.processedMat) state.processedMat.delete();
                state.processedMat = dst;

                src.delete(); srcTri.delete(); dstTri.delete(); M.delete();

                // Update UI state to locked
                state.cropApplied = true;
                elements.btnApplyCrop.classList.add('d-none');
                elements.btnResetCrop.classList.remove('d-none');
                elements.cornerLines.style.display = 'none';
                corners.forEach(c => c.style.display = 'none');
                elements.rotateControls.classList.add('d-none');

                // Apply active filter and explicit settings
                applyFilterAndSettings();
                
            } catch (err) {
                console.error("OpenCV Processing Error: ", err);
                alert("An error occurred during image processing.");
                showLoader(false);
            }
        }, 100);
    }

    function applyFilterAndSettings() {
        if (!state.processedMat) return;
        
        showLoader(true);
        setTimeout(() => {
            try {
                const src = state.processedMat;
                let dst = new cv.Mat();
                
                const activeFilterBtn = document.querySelector('.filter-btn.active');
                const filterType = activeFilterBtn ? activeFilterBtn.dataset.filter : 'original';

                switch (filterType) {
                    case 'bw':
                        cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY);
                        break;
                    case 'scan':
                        cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY);
                        cv.adaptiveThreshold(dst, dst, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY, 21, 10);
                        break;
                    case 'contrast':
                        src.convertTo(dst, -1, 1.4, 0);
                        break;
                    case 'color':
                        cv.cvtColor(src, dst, cv.COLOR_RGBA2RGB);
                        cv.cvtColor(dst, dst, cv.COLOR_RGB2HSV);
                        let channels = new cv.MatVector();
                        cv.split(dst, channels);
                        let s = channels.get(1);
                        s.convertTo(s, -1, 1.3, 0); 
                        channels.set(1, s);
                        cv.merge(channels, dst);
                        cv.cvtColor(dst, dst, cv.COLOR_HSV2RGB);
                        cv.cvtColor(dst, dst, cv.COLOR_RGB2RGBA);
                        channels.delete(); s.delete();
                        break;
                    case 'light':
                        src.convertTo(dst, -1, 1.0, 50);
                        break;
                    case 'original':
                    default:
                        src.copyTo(dst);
                        break;
                }
                
                // --- Apply Manual Adjustments ---
                let cVal = parseInt(elements.adjContrast.value);
                let bVal = parseInt(elements.adjBrightness.value);
                let sVal = parseInt(elements.adjSaturation.value);
                let eVal = parseInt(elements.adjExposure.value);
                
                let alpha = (cVal / 100) + 1.0; 
                let beta = bVal; 
                
                dst.convertTo(dst, -1, alpha, beta);
                
                if (eVal !== 0) {
                    let expFactor = Math.pow(2.0, eVal / 50.0);
                    dst.convertTo(dst, -1, expFactor, 0); 
                }

                if (sVal !== 0) {
                    if (dst.channels() === 4) {
                        cv.cvtColor(dst, dst, cv.COLOR_RGBA2RGB);
                    } else if (dst.channels() === 1) {
                        cv.cvtColor(dst, dst, cv.COLOR_GRAY2RGB);
                    }
                    cv.cvtColor(dst, dst, cv.COLOR_RGB2HSV);
                    
                    let channels = new cv.MatVector();
                    cv.split(dst, channels);
                    let s = channels.get(1);
                    let satFactor = (sVal / 100) + 1.0; 
                    s.convertTo(s, -1, satFactor, 0);
                    channels.set(1, s);
                    cv.merge(channels, dst);
                    
                    cv.cvtColor(dst, dst, cv.COLOR_HSV2RGB);
                    cv.cvtColor(dst, dst, cv.COLOR_RGB2RGBA);
                    channels.delete(); s.delete();
                }

                if (state.filteredMat) state.filteredMat.delete();
                state.filteredMat = dst;
                
                // Extract to hidden canvas to obtain dataUrl with rounded corners
                const hiddenCanvas = document.createElement('canvas');
                hiddenCanvas.width = dst.cols;
                hiddenCanvas.height = dst.rows;
                const tempCtx = hiddenCanvas.getContext('2d');
                
                // Temporary intermediary canvas to extract OpenCV image
                const cvCanvas = document.createElement('canvas');
                cv.imshow(cvCanvas, dst);
                
                // Draw onto hidden with rounded corners via clipping
                // Ratio calculation for pixel border radius relative to ID Card real mm size
                const pxPerMmCard = dst.cols / ID_WIDTH_MM;
                const radiusPx = BORDER_RADIUS_MM * pxPerMmCard;
                
                tempCtx.beginPath();
                tempCtx.roundRect(0, 0, hiddenCanvas.width, hiddenCanvas.height, radiusPx);
                tempCtx.clip();
                tempCtx.drawImage(cvCanvas, 0, 0);
                
                const dataUrl = hiddenCanvas.toDataURL('image/jpeg', 1.0);
                
                if (state.currentSide === 'front') {
                    state.frontProcessedData = dataUrl;
                } else {
                    state.backProcessedData = dataUrl;
                }
                
                // Repaint to main workspace window replacing the un-cropped version
                if (state.cropApplied) {
                    const cCanvas = elements.sourceCanvas;
                    const cw = hiddenCanvas.width;
                    const ch = hiddenCanvas.height;
                    
                    const maxWidth = elements.workspaceContainer.clientWidth - 40;
                    const maxHeight = (elements.workspaceContainer.clientHeight - 40) || 600;
                    
                    const scaleW = maxWidth / cw;
                    const scaleH = maxHeight / ch;
                    const cbestScale = Math.min(scaleW, scaleH);
                    
                    const drawW = cw * cbestScale;
                    const drawH = ch * cbestScale;
                    
                    cCanvas.width = drawW;
                    cCanvas.height = drawH;
                    
                    const srcCtx = cCanvas.getContext('2d');
                    srcCtx.drawImage(hiddenCanvas, 0, 0, drawW, drawH);
                }
                
                renderA4Preview();
                showLoader(false);
            } catch (e) {
                console.error("Filter Error", e);
                showLoader(false);
            }
        }, 10);
    }

    function renderA4Preview() {
        const pCanvas = elements.a4PreviewCanvas;
        pCanvas.width = A4_WIDTH_MM * PIXELS_PER_MM; 
        pCanvas.height = A4_HEIGHT_MM * PIXELS_PER_MM; 
        const ctx = pCanvas.getContext('2d');
        
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, pCanvas.width, pCanvas.height);
        
        const loadImg = (src) => {
            return new Promise((resolve) => {
                if(!src) { resolve(null); return; }
                const img = new Image();
                img.onload = () => resolve(img);
                img.src = src;
            });
        };

        Promise.all([
            loadImg(state.frontProcessedData),
            loadImg(state.backProcessedData)
        ]).then(([fImg, bImg]) => {
            
            const cardW = ID_WIDTH_MM * PIXELS_PER_MM;
            const cardH = ID_HEIGHT_MM * PIXELS_PER_MM;
            const yPos = 20 * PIXELS_PER_MM; // 20mm top margin
            
            if (state.docType === 'one-sided' && fImg) {
                const xPos = (pCanvas.width - cardW) / 2; // Center aligned
                ctx.drawImage(fImg, xPos, yPos, cardW, cardH);
            } 
            else if (state.docType === 'two-sided') {
                const marginX = 13 * PIXELS_PER_MM; // Equal padding left, middle, right relative to boundaries
                
                if (fImg) {
                    ctx.drawImage(fImg, marginX, yPos, cardW, cardH);
                }
                if (bImg) {
                    const xPosBack = marginX + cardW + marginX; // Placed strictly beside with padding
                    ctx.drawImage(bImg, xPosBack, yPos, cardW, cardH);
                }
            }

            elements.previewPlaceholder.classList.add('d-none');
            elements.a4PreviewCanvas.classList.remove('d-none');
            updateActionButtons();
        });
    }

    function updateActionButtons() {
        if (state.docType === 'two-sided' && state.currentSide === 'front') {
            elements.twoSidedControls.classList.remove('d-none');
            elements.btnDownloadJpg.disabled = true;
            elements.btnDownloadPdf.disabled = true;
        } else {
            elements.twoSidedControls.classList.add('d-none');
            elements.btnDownloadJpg.disabled = false;
            elements.btnDownloadPdf.disabled = false;
        }
    }

    function proceedToNextSideCrop() {
        if (!state.backImage) {
            alert("No back image uploaded. Please restart the process to upload the Back side too.");
            return;
        }
        state.currentSide = 'back';
        setupWorkspaceForCurrentSide();
    }

    function resetUploadUI() {
        state.frontImage = null;
        state.backImage = null;
        state.frontProcessedData = null;
        state.backProcessedData = null;
        
        elements.fileInputFront.value = '';
        elements.fileInputBack.value = '';
        elements.statusFront.textContent = 'Pending';
        elements.statusFront.classList.replace('text-success', 'text-dark');
        elements.indicatorFront.style.display = 'none';
        
        elements.statusBack.textContent = 'Pending';
        elements.statusBack.classList.replace('text-success', 'text-dark');
        elements.indicatorBack.style.display = 'none';
        
        elements.btnProceedCrop.classList.add('d-none');

        elements.stepProcess.classList.add('d-none');
        elements.stepProcess.classList.remove('active');
        elements.stepUpload.classList.remove('d-none');
        elements.stepUpload.classList.add('active');
        elements.previewPlaceholder.classList.remove('d-none');
        elements.a4PreviewCanvas.classList.add('d-none');
        elements.twoSidedControls.classList.add('d-none');
        elements.btnDownloadJpg.disabled = true;
        elements.btnDownloadPdf.disabled = true;
        
        if(state.processedMat) { state.processedMat.delete(); state.processedMat = null; }
        if(state.filteredMat) { state.filteredMat.delete(); state.filteredMat = null; }
    }

    function downloadFile(type) {
        if (type === 'jpg') {
            const dataUrl = elements.a4PreviewCanvas.toDataURL('image/jpeg', 1.0);
            let link = document.createElement('a');
            link.download = 'DocuStraight_Scan.jpg';
            link.href = dataUrl;
            link.click();
        } 
        else if (type === 'pdf') {
            // Because the a4PreviewCanvas perfectly mimics the A4 bounds, we can just save it identically inside a PDF 1:1
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
            
            const pCanvas = elements.a4PreviewCanvas;
            const pdfData = pCanvas.toDataURL('image/jpeg', 0.95);
            
            pdf.addImage(pdfData, 'JPEG', 0, 0, A4_WIDTH_MM, A4_HEIGHT_MM);
            pdf.save('DocuStraight_Document.pdf');
        }
    }

    return {
        init,
        resetUpload: resetUploadUI,
        triggerUpload,
        startProcessing,
        rotateImage,
        zoomImage,
        resetZoom
    };
})();

// Initialize safely
document.addEventListener('DOMContentLoaded', () => {
    if (window.app && window.app.init) {
        window.app.init();
    }
});
