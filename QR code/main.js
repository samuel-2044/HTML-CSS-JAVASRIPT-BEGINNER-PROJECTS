// main.js file

function domReady(fn) {
    // Function to ensure DOM is ready before executing
    if (
        document.readyState === "complete" ||
        document.readyState === "interactive"
    ) {
        setTimeout(fn, 1000);
    } else {
        document.addEventListener("DOMContentLoaded", fn);
    }
}

domReady(function () {
    // Initialize QR scanner when DOM is ready

    let scannedText = '';

    // Callback function when QR code is successfully scanned
    function onScanSuccess(decodeText, decodeResult) {
        scannedText = decodeText;
        // Optionally alert or something, but since no display, maybe just store
    }

    // Create and render the QR code scanner
    let htmlscanner = new Html5QrcodeScanner(
        "my-qr-reader",
        { fps: 10, qrbox: 250 }
    );
    htmlscanner.render(onScanSuccess);

    // Change the camera icon to custom QR code image
    setTimeout(() => {
        const img = document.querySelector('#my-qr-reader img[alt="Camera based scan"]');
        if (img) {
            img.src = 'HelloTech-qr-code-1024x1024.webp';
        }
    }, 1000);

    // Add event listener for copy button
    document.getElementById('copy-btn').addEventListener('click', function() {
        if (!scannedText) {
            alert('No QR code scanned yet.');
            return;
        }
        navigator.clipboard.writeText(scannedText).then(function() {
            alert('Copied to clipboard!');
        });
    });
});