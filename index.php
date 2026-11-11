<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="DocuStraight - Convert any crooked document photo into a perfectly aligned print-ready copy.">
    <title>DocuStraight – Smart Document Scanner</title>
    
    <!-- Google Fonts: Outfit & Inter -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
    
    <!-- Bootstrap 5 -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Bootstrap Icons -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css">
    
    <!-- Custom CSS -->
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body class="modern-bg">
    
    <!-- Main Header -->
    <header class="app-header glass-nav">
        <div class="container-fluid d-flex justify-content-between align-items-center">
            <div class="brand d-flex align-items-center gap-3">
                <div class="logo-circle">
                    <i class="bi bi-magic text-white fs-4"></i>
                </div>
                <div class="brand-text">
                    <h1 class="h4 mb-0 fw-bold title-text">DocuStraight</h1>
                    <span class="text-secondary small fw-medium d-none d-sm-block">Smart Document Scanner</span>
                </div>
            </div>
            <div class="status-indicator">
                <span id="cvLoading" class="badge bg-warning text-dark status-badge"><i class="bi bi-hourglass-split me-1"></i> Loading Core Engine...</span>
                <span id="cvReady" class="badge bg-success status-badge d-none"><i class="bi bi-check2-circle me-1"></i> Engine Ready</span>
            </div>
        </div>
    </header>

    <main class="container-fluid mt-4 main-content">
        <!-- Step 1: Upload & Type Selection -->
        <section id="step-upload" class="step-section active">
            <div class="row justify-content-center">
                <div class="col-lg-10 col-xl-8">
                    <div class="text-center mb-5 slide-up-anim delay-1">
                        <span class="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill fw-semibold mb-3">AI Document Alignment</span>
                        <h2 class="display-6 fw-bold mb-3 title-text">Perfect Scans in Seconds.</h2>
                        <p class="text-secondary fs-5">Upload your ID card, Aadhaar, or DL, and we'll automatically generate a perfectly straight, print-ready copy.</p>
                    </div>

                    <div class="card premium-card slide-up-anim delay-2 shadow-lg border-0">
                        <div class="card-body p-4 p-md-5">
                            <h5 class="fw-bold mb-4 text-center">1. Select Document Type</h5>
                            
                            <div class="d-flex flex-column flex-sm-row justify-content-center gap-3 gap-md-4 mb-5">
                                <label class="doc-type-card flex-fill">
                                    <input type="radio" name="docType" value="one-sided" checked>
                                    <div class="doc-type-content d-flex flex-column align-items-center justify-content-center">
                                        <div class="icon-wrapper mb-3"><i class="bi bi-person-vcard fs-2"></i></div>
                                        <span class="fw-bold fs-5">One Sided</span>
                                        <small class="text-secondary mt-1 text-center">PAN Card, Front IDs only</small>
                                    </div>
                                </label>
                                
                                <label class="doc-type-card flex-fill">
                                    <input type="radio" name="docType" value="two-sided">
                                    <div class="doc-type-content d-flex flex-column align-items-center justify-content-center">
                                        <div class="icon-wrapper mb-3"><i class="bi bi-files fs-2"></i></div>
                                        <span class="fw-bold fs-5">Two Sided</span>
                                        <small class="text-secondary mt-1 text-center">Aadhaar, DL (Front & Back)</small>
                                    </div>
                                </label>
                            </div>

                            <hr class="mb-5 opacity-10">
                            <h5 class="fw-bold mb-4 text-center">2. Upload Your Document Photos</h5>

                            <!-- Hidden inputs for pure specific targeting -->
                            <input type="file" id="fileInputFront" accept="image/jpeg, image/png, image/jpg" class="d-none">
                            <input type="file" id="fileInputBack" accept="image/jpeg, image/png, image/jpg" class="d-none">
                            
                            <!-- One Sided UI -->
                            <div id="uploadZoneSingle" class="upload-zone interactive text-center" onclick="app.triggerUpload('front')">
                                <div class="upload-zone-content py-5">
                                    <div class="upload-icon-pulse mb-4">
                                        <i class="bi bi-cloud-arrow-up-fill text-primary"></i>
                                    </div>
                                    <h4 class="fw-bold mb-2">Click or Drag & Drop Photo Here</h4>
                                    <p class="text-secondary mb-4">Supports JPG, JPEG, PNG (Max 10MB)</p>
                                    <button class="btn btn-primary rounded-pill px-5 shadow upload-btn">Choose Image</button>
                                </div>
                            </div>

                            <!-- Two Sided UI (Hidden by default) -->
                            <div class="d-none" id="uploadZoneDual">
                                <div class="row g-4 mb-4">
                                    <div class="col-md-6">
                                        <div class="upload-zone interactive h-100 d-flex flex-column justify-content-center align-items-center p-4 text-center" id="zoneFront" onclick="app.triggerUpload('front')">
                                            <div class="mb-3 position-relative">
                                                <i class="bi bi-front fs-1 text-primary"></i>
                                                <span class="position-absolute top-0 start-100 translate-middle p-2 bg-danger border border-light rounded-circle" id="indicatorFront" style="display: none;"></span>
                                            </div>
                                            <h5 class="fw-bold mb-2">Upload Front Side</h5>
                                            <p class="text-secondary small mb-3">The side with your face</p>
                                            <span class="badge bg-light text-dark border py-2 px-3 fw-medium w-100" id="statusFront">Pending</span>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="upload-zone interactive h-100 d-flex flex-column justify-content-center align-items-center p-4 text-center" id="zoneBack" onclick="app.triggerUpload('back')">
                                            <div class="mb-3 position-relative">
                                                <i class="bi bi-back fs-1 text-primary"></i>
                                                <span class="position-absolute top-0 start-100 translate-middle p-2 bg-danger border border-light rounded-circle" id="indicatorBack" style="display: none;"></span>
                                            </div>
                                            <h5 class="fw-bold mb-2">Upload Back Side</h5>
                                            <p class="text-secondary small mb-3">The side with barcode/address</p>
                                            <span class="badge bg-light text-dark border py-2 px-3 fw-medium w-100" id="statusBack">Pending</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="d-flex justify-content-center mt-2">
                                    <button class="btn btn-primary rounded-pill px-5 py-3 shadow fs-5 w-100 w-md-auto d-none slide-up-anim" id="btnProceedCrop" onclick="app.startProcessing()">
                                        Continue to Crop & Align <i class="bi bi-arrow-right ms-2"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Step 2: Processing Workspace -->
        <section id="step-process" class="step-section d-none">
            <div class="row h-100 g-4">
                <!-- Main Workspace (Center) -->
                <div class="col-lg-8 d-flex flex-column">
                    <div class="card premium-card flex-grow-1 workspace-card border-0 shadow-sm">
                        <div class="card-header bg-transparent border-bottom d-flex justify-content-between align-items-center py-3 px-4">
                            <h5 class="mb-0 fw-bold d-flex align-items-center title-text" id="workspaceTitle">
                                <span class="bg-primary text-white rounded-circle d-inline-flex justify-content-center align-items-center me-3" style="width: 36px; height: 36px;"><i class="bi bi-crop"></i></span> 
                                Adjust Perspective
                            </h5>
                            <button class="btn btn-outline-secondary btn-sm rounded-pill fw-medium px-3" onclick="app.resetUpload()"><i class="bi bi-arrow-counterclockwise me-1"></i> Start Over</button>
                        </div>
                        <div class="card-body p-0 workspace-container position-relative" id="workspaceContainer">
                            <!-- Overlay loading indicator -->
                            <div id="processingLoader" class="processing-loader d-none">
                                <div class="glass-loader shadow-lg rounded-4 p-4 text-center">
                                    <div class="spinner-border text-primary mb-3" style="width: 3rem; height: 3rem;" role="status"></div>
                                    <h6 class="fw-bold mb-0 text-dark">Aligning Magic...</h6>
                                </div>
                            </div>
                            <!-- Canvas wrapper for relative positioning -->
                            <div class="canvas-wrapper" id="canvasWrapper">
                                <canvas id="sourceCanvas" class="shadow rounded-3"></canvas>
                                <!-- Interactive Corner Points -->
                                <div class="corner-point" id="pt-tl" data-id="0"></div>
                                <div class="corner-point" id="pt-tr" data-id="1"></div>
                                <div class="corner-point" id="pt-br" data-id="2"></div>
                                <div class="corner-point" id="pt-bl" data-id="3"></div>
                                <!-- Connecting lines -->
                                <svg class="corner-lines" id="cornerLines">
                                    <polygon id="cropPolygon" points="0,0 0,0 0,0 0,0" />
                                </svg>
                                
                                <!-- Pointer magnifier -->
                                <div id="magnifier" class="glass-magnifier d-none shadow-lg"></div>
                            </div>
                            
                            <!-- Zoom Context Actions -->
                            <div class="position-absolute top-0 end-0 m-3 z-3">
                                <div class="bg-white rounded-pill shadow-sm px-2 py-1 d-flex gap-1 align-items-center">
                                    <button class="btn btn-sm btn-link text-dark text-decoration-none p-1" onclick="app.zoomImage(-0.1)" title="Zoom Out"><i class="bi bi-zoom-out"></i></button>
                                    <span class="small fw-bold px-2" id="valZoomLevel">100%</span>
                                    <button class="btn btn-sm btn-link text-dark text-decoration-none p-1" onclick="app.zoomImage(0.1)" title="Zoom In"><i class="bi bi-zoom-in"></i></button>
                                    <div class="vr mx-1"></div>
                                    <button class="btn btn-sm btn-link text-primary text-decoration-none p-1 fw-bold" onclick="app.resetZoom()" title="Reset Zoom">Reset</button>
                                </div>
                            </div>
                            
                            <!-- Rotation Controls Overlay -->
                            <div id="rotateControls" class="position-absolute bottom-0 start-50 translate-middle-x mb-4 bg-white rounded-pill shadow px-3 py-2 d-flex gap-2 align-items-center">
                                <span class="text-secondary small fw-medium me-2 px-1">Rotate</span>
                                <button class="btn btn-light btn-sm rounded-circle shadow-sm" onclick="app.rotateImage(-90)" title="Rotate Left" style="width:36px; height:36px;"><i class="bi bi-arrow-counterclockwise fs-6"></i></button>
                                <button class="btn btn-light btn-sm rounded-circle shadow-sm" onclick="app.rotateImage(90)" title="Rotate Right" style="width:36px; height:36px;"><i class="bi bi-arrow-clockwise fs-6"></i></button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Control Panel (Right) -->
                <div class="col-lg-4">
                    <div class="card premium-card h-100 border-0 shadow-sm side-panel">
                        <div class="card-body d-flex flex-column h-100 p-4">
                            
                            <!-- Perspective Action -->
                            <div class="mb-4">
                                <h6 class="fw-bold mb-2 text-primary small text-uppercase tracking-wider">Step 1</h6>
                                <h5 class="fw-bold mb-3 title-text">Confirm Alignment</h5>
                                <p class="text-secondary small mb-3">Drag the 4 corners to fit your document's edges closely.</p>
                                
                                <div class="d-flex gap-2">
                                    <button class="btn btn-primary w-100 py-2 rounded-pill shadow fw-medium" id="btnApplyCrop">
                                        <i class="bi bi-check-circle-fill me-2"></i> Apply Crop & Align
                                    </button>
                                    <button class="btn btn-outline-danger w-100 py-2 rounded-pill shadow-sm fw-medium d-none" id="btnResetCrop">
                                        <i class="bi bi-arrow-counterclockwise me-2"></i> Reset Crop
                                    </button>
                                </div>
                            </div>

                            <hr class="text-muted opacity-10 my-3">

                            <!-- Filters Action -->
                            <div class="mb-4">
                                <h6 class="fw-bold mb-2 text-primary small text-uppercase tracking-wider">Step 2</h6>
                                <h5 class="fw-bold mb-3 title-text">Enhance Output</h5>
                                
                                <div class="accordion" id="enhancementsAccordion">
                                    <!-- Preset Filters -->
                                    <div class="accordion-item border-0 bg-transparent mb-3">
                                        <h2 class="accordion-header">
                                            <button class="accordion-button collapsed bg-white shadow-sm rounded-4 fw-bold text-dark p-3" type="button" data-bs-toggle="collapse" data-bs-target="#collapseFilters" aria-expanded="false" aria-controls="collapseFilters">
                                                <i class="bi bi-palette-fill text-primary me-2"></i> Preset Filters
                                            </button>
                                        </h2>
                                        <div id="collapseFilters" class="accordion-collapse collapse" data-bs-parent="#enhancementsAccordion">
                                            <div class="accordion-body px-0 pt-3 pb-0">
                                                <div class="filter-options grid gap-2" style="display: grid; grid-template-columns: 1fr 1fr">
                                                    <button class="btn btn-outline-secondary filter-btn active" data-filter="original">Original</button>
                                                    <button class="btn btn-outline-secondary filter-btn" data-filter="scan"><i class="bi bi-printer me-1"></i> Scanner</button>
                                                    <button class="btn btn-outline-secondary filter-btn" data-filter="bw">Black & White</button>
                                                    <button class="btn btn-outline-secondary filter-btn" data-filter="contrast">High Contrast</button>
                                                    <button class="btn btn-outline-secondary filter-btn" data-filter="color">Vivid Color</button>
                                                    <button class="btn btn-outline-secondary filter-btn" data-filter="light">Lighten</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Manual Adjustments -->
                                    <div class="accordion-item border-0 bg-transparent">
                                        <h2 class="accordion-header">
                                            <button class="accordion-button collapsed bg-white shadow-sm rounded-4 fw-bold text-dark p-3" type="button" data-bs-toggle="collapse" data-bs-target="#collapseAdjustments" aria-expanded="false" aria-controls="collapseAdjustments">
                                                <i class="bi bi-sliders text-primary me-2"></i> Manual Adjustments
                                            </button>
                                        </h2>
                                        <div id="collapseAdjustments" class="accordion-collapse collapse" data-bs-parent="#enhancementsAccordion">
                                            <div class="accordion-body px-0 pt-3 pb-0">
                                                <div class="bg-light p-3 rounded-4 border">
                                                    <div class="d-flex justify-content-between align-items-center mb-3">
                                                        <span class="small fw-bold text-dark">Settings</span>
                                                        <button class="btn btn-sm btn-link text-danger text-decoration-none p-0 fw-medium" id="btnResetAdjustments"><i class="bi bi-arrow-counterclockwise"></i> Reset</button>
                                                    </div>
                                                    
                                                    <div class="mb-3">
                                                        <div class="d-flex justify-content-between mb-1">
                                                            <span class="small text-secondary">Brightness</span>
                                                            <span class="small fw-bold" id="valBrightness">0</span>
                                                        </div>
                                                        <input type="range" class="form-range custom-range" id="adjBrightness" min="-100" max="100" value="0">
                                                    </div>
                                                    <div class="mb-3">
                                                        <div class="d-flex justify-content-between mb-1">
                                                            <span class="small text-secondary">Contrast</span>
                                                            <span class="small fw-bold" id="valContrast">0</span>
                                                        </div>
                                                        <input type="range" class="form-range custom-range" id="adjContrast" min="-100" max="100" value="0">
                                                    </div>
                                                    <div class="mb-3">
                                                        <div class="d-flex justify-content-between mb-1">
                                                            <span class="small text-secondary">Saturation</span>
                                                            <span class="small fw-bold" id="valSaturation">0</span>
                                                        </div>
                                                        <input type="range" class="form-range custom-range" id="adjSaturation" min="-100" max="100" value="0">
                                                    </div>
                                                    <div>
                                                        <div class="d-flex justify-content-between mb-1">
                                                            <span class="small text-secondary">Exposure</span>
                                                            <span class="small fw-bold" id="valExposure">0</span>
                                                        </div>
                                                        <input type="range" class="form-range custom-range" id="adjExposure" min="-100" max="100" value="0">
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <hr class="text-muted opacity-10 my-3">
                            
                            <!-- Preview & Layout -->
                            <div class="mb-4 flex-grow-1 d-flex flex-column preview-section">
                                <h6 class="fw-bold mb-2 text-primary small text-uppercase tracking-wider">Result</h6>
                                <h5 class="fw-bold mb-3 title-text d-flex justify-content-between align-items-center">
                                    A4 Page Preview
                                    <span class="badge bg-success bg-opacity-10 text-success small border border-success border-opacity-25 py-1 fw-bold">ID Sized</span>
                                </h5>
                                <div class="preview-container mb-3 flex-grow-1 shadow-inner rounded-4" id="previewContainer">
                                    <canvas id="a4PreviewCanvas" class="shadow-sm border d-none print-preview-canvas rounded-2"></canvas>
                                    <div class="preview-placeholder text-center text-muted" id="previewPlaceholder">
                                        <div class="mb-3"><i class="bi bi-file-earmark-image opacity-25" style="font-size: 3rem;"></i></div>
                                        <p class="small fw-medium mb-0">Apply crop to generate preview</p>
                                    </div>
                                </div>
                            </div>

                            <!-- Actions -->
                            <div class="mt-auto">
                                <div id="twoSidedControls" class="d-none mb-3">
                                    <button class="btn btn-warning w-100 fw-bold py-3 shadow rounded-pill" id="btnNextSide">
                                        Next: Process Back Side <i class="bi bi-arrow-right-circle-fill ms-2"></i>
                                    </button>
                                </div>

                                <div class="d-flex gap-2" id="downloadControls">
                                    <button class="btn btn-light border-secondary border-opacity-25 flex-fill py-2 rounded-pill fw-bold text-dark shadow-sm" id="btnDownloadJpg" disabled>
                                        <i class="bi bi-filetype-jpg text-primary me-2"></i> Download JPG
                                    </button>
                                    <button class="btn btn-success flex-fill py-2 rounded-pill fw-bold shadow-sm" id="btnDownloadPdf" disabled>
                                        <i class="bi bi-filetype-pdf text-white me-2"></i> Download PDF
                                    </button>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </section>

    </main>

    <!-- Scripts -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
    
    <!-- OpenCV.js loader -->
    <script>
        var Module = {
            onRuntimeInitialized: function() {
                document.getElementById('cvLoading').classList.add('d-none');
                document.getElementById('cvReady').classList.remove('d-none');
                window.cvReady = true;
                if (window.app && window.app.init) {
                    window.app.init();
                }
            }
        };
    </script>
    <script async src="https://docs.opencv.org/4.8.0/opencv.js" type="text/javascript"></script>
    
    <!-- App Logic -->
    <script src="assets/js/app.js"></script>
</body>
</html>
