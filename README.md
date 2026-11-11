# DocuStraight 📄✨

> **Smart Client-Side Document Scanner & Alignment Tool**  
> Convert crooked, angled document photos into perfectly straightened, aligned, print-ready A4 copies directly in your browser.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![OpenCV.js](https://img.shields.io/badge/OpenCV.js-4.8.0-5C3EE8?logo=opencv&logoColor=white)](https://docs.opencv.org/)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3-7952B3?logo=bootstrap&logoColor=white)](https://getbootstrap.com/)
[![Privacy: 100% Client-Side](https://img.shields.io/badge/Privacy-100%25_Client--Side-brightgreen)](#-privacy--security)

---

## 🌟 Key Features

- 📑 **One-Sided & Two-Sided Document Modes**:
  - **One-Sided**: Ideal for PAN Cards, single-side IDs, badges, certificates.
  - **Two-Sided**: Perfect for Aadhaar Card, Driving License, Voter ID (Front & Back merged on a single standard A4 sheet).
- 📐 **Interactive 4-Point Perspective Transform**:
  - Draggable corner handles with responsive canvas scaling.
  - Automatic perspective warp using **OpenCV.js** homography matrices.
- 🎨 **Image Enhancement Filters**:
  - **Original**: Full color preserved.
  - **Magic B&W**: Document clarity filter (high contrast text enhancement for clean photocopy appearance).
  - **Auto Contrast**: Adaptive histogram equalization / contrast boosting.
  - **Rotation**: 90° clockwise rotation control.
- 🖨️ **Print-Ready A4 Page Preview**:
  - Accurately renders standard ID card dimensions (85.6mm × 54mm) on an A4 sheet.
  - Real-time live canvas preview of the final print page.
- 💾 **Instant Multi-Format Export**:
  - High-resolution **JPG** export.
  - Print-ready **PDF** generation via **jsPDF**.
- 🔒 **100% Client-Side & Private**:
  - Your documents never leave your computer or touch any external server. All image processing occurs strictly inside your local browser memory.

---

## 🚀 Live Demo & Getting Started

### Option 1: Static Hosting / Direct Browser Access
Because DocuStraight is built purely with client-side technologies (HTML5, CSS3, JavaScript, OpenCV.js CDN), you can simply open `index.html` directly in your browser!

```bash
# Clone the repository
git clone https://github.com/rishiraydev/DocuStraight.git

# Navigate into the project folder
cd DocuStraight

# Open index.html in your default web browser
start index.html   # On Windows
open index.html    # On macOS
xdg-open index.html # On Linux
```

### Option 2: Run with Local PHP / Apache / Live Server
If you use XAMPP, WAMP, or PHP CLI:

```bash
php -S localhost:8000
```
Then visit `http://localhost:8000` in your web browser.

---

## 🛠️ Tech Stack

- **Frontend Core**: HTML5, Modern CSS3 (Glassmorphism, CSS Grid, Flexbox)
- **Styling & UI**: [Bootstrap 5.3](https://getbootstrap.com/), [Bootstrap Icons](https://icons.getbootstrap.com/), Google Fonts (Outfit & Inter)
- **Computer Vision**: [OpenCV.js 4.8.0](https://docs.opencv.org/) for perspective transformation, corner warping, and image filtering
- **PDF Generation**: [jsPDF 2.5.1](https://github.com/parallax/jsPDF)
- **Architecture**: Modular object-oriented JavaScript (`app.js`) with responsive HTML5 Canvas rendering

---

## 🔒 Privacy & Security

Document security and personal privacy are critical when handling identity cards (Aadhaar, PAN, DL, Passports). 

- **Zero Cloud Uploads**: All transformation algorithms, perspective warping, contrast filtering, and PDF compilations execute locally within your browser tab.
- **No Analytics / No Tracking**: No user data, images, or metadata are collected or transmitted.
- **Safe for Sensitive Documents**: Safe for processing confidential identity cards offline or online.

---

## 📂 Project Structure

```text
DocuStraight/
│
├── assets/
│   ├── css/
│   │   └── style.css       # Custom styles, animations, and responsive UI rules
│   └── js/
│       └── app.js          # Core application logic, OpenCV perspective warp & export handlers
├── index.html              # Static entrypoint for GitHub Pages / web servers
├── index.php               # PHP-compatible entrypoint for local web server environments
├── .gitignore              # Git ignore rules for clean repository hygiene
├── LICENSE                 # MIT License
└── README.md               # Documentation & usage guide
```

---

## 🤝 Contributing

Contributions, feature suggestions, and bug reports are warmly welcome!  
Feel free to open an issue or submit a pull request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See [`LICENSE`](LICENSE) for more information.

---

## 📬 Contact & Support

Developed with ❤️ by **Rishi Ray**  
- **GitHub**: [@rishiraydev](https://github.com/rishiraydev)  
- **Email**: [rishiray.info@gmail.com](mailto:rishiray.info@gmail.com)  

If you find this project helpful, please consider giving it a ⭐ on GitHub!
