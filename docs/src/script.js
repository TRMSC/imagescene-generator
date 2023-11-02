/*------------------------------------------------------------------------------------------------
  Imagescene Generator - Copyright (C) 2023, TRMSC - https://trmsc.github.io/imagescene-generator/
  GNU General Public Licence 3.0 - http://www.gnu.de/documents/gpl-3.0.en.html
  CC-BY-SA 4.0 DE https://creativecommons.org/licenses/by-sa/4.0/deed.de
  Discard the copyright note by using the creative commons license (attribution is sufficient)
------------------------------------------------------------------------------------------------*/

/**
 * Define const variables
 * 
 * @param {array} shareData Site information for share method
 *
 */
const shareData = {
  title: 'Imagescene Generator | TRMSC',
  text: 'Create dynamic scenes from images | TRMSC',
  url: window.location
}


/**
 * Handle onload progress
 * 
 * @event
 * @listens onload
 * @class window 
 * @returns {void}
 */
window.onload = function() {

  // Call functions
  addYear();
  listenEvents();

  // Return
  return;
    
};


/**
 * Implement year
 * 
 * @function addYear
 * @returns {void}
 *
 */
addYear = () => {

  let time = new Date();
  let year = time.getFullYear();
  document.getElementById("year").innerHTML = year;

};


/**
 * Collect eventlisteners
 * 
 * @function listenEvents
 * @returns {void}
 *
 */
listenEvents = () => {

  // Share page
  let shareButtons = document.getElementsByClassName('imagescene-share');
  for (let i = 0; i < shareButtons.length; i++) {
    shareButtons[i].addEventListener('click', sharePage);
  }

  // Filepicker
  let imageInput = document.getElementById('imageInput');
  imageInput.addEventListener('change', function (event) {
    const selectedFile = event.target.files[0];
    handleFileSelect(selectedFile);
  });

  // Drag & Drop
  let dropzone = document.getElementById('dropzone');
  dropzone.addEventListener('dragover', function (e) {
    e.preventDefault();
    dropzone.classList.add('dragover');
    dropzone.style.backgroundColor = '#ab967554';
  });

  dropzone.addEventListener('dragleave', function () {
    dropzone.classList.remove('dragover');
    dropzone.style.backgroundColor = '';
  });

  dropzone.addEventListener('drop', function (e) {
    e.preventDefault();
    dropzone.classList.remove('dragover');
    dropzone.style.backgroundColor = '';
    const files = e.dataTransfer.files;
    handleFileSelect(files[0]);
  });

  // Check values when textareas content was changed
  let textarea = document.getElementById('imagescene-url');
  textarea.addEventListener('input', getValues);

  // Update status when width input was changes
  let width = document.getElementById('imagescene-w');
  width.addEventListener('input', changeStatus);

  // Update status when height input was changes
  let height = document.getElementById('imagescene-h');
  height.addEventListener('input', changeStatus);

  // Update status when alt input was changes
  let alt = document.getElementById('imagescene-alt');
  alt.addEventListener('input', changeStatus);

  // Generate scene
  let generateButton = document.getElementById('imagescene-generate');
  generateButton.addEventListener('click', generateScene);

  // Copy to clipboard
  let clipboardButton = document.getElementById('imagescene-copy');
  clipboardButton.addEventListener('click', copyClipboard);

  // Download SVG
  let downloadButton = document.getElementById('imagescene-download');
  downloadButton.addEventListener('click', downloadSvg);

};


/**
 * Share page by using the share api
 * 
 * @async
 * @function sharePage
 * @throws {error} When the share api isn't available or the share fails
 * 
 */
sharePage = async () => {

  if (navigator.share) {
    try {
      await navigator.share(shareData);
      console.log('Shared successfully');
    } catch (err) {
      console.log(`Error: ${err}`);
    }
  } else {
      copyUrl();
  }
  
};


/**
 * Copy URL to clipboard
 * 
 * @function copyUrl
 * @returns {void}
 * 
 */
copyUrl = () => {

  // Handle URL
  const textArea = document.createElement('textarea');
  textArea.value = shareData.url;
  document.body.appendChild(textArea);
  textArea.select();

  // Copy or throw an error
  try {
    document.execCommand('copy');
    alert(
      'Das Teilen über die Share-API wird in diesem Browser aktuell noch nicht unterstützt. ✖️\n' +
      'Die URL der Projektseite wurde daher zum Teilen in die Zwischenablage kopiert. ✔️'
    );
  } catch (err) {
    console.error('Fehler beim Kopieren in die Zwischenablage: ', err);
  }

  // Entfernen Sie das Textfeld aus dem Dokument
  document.body.removeChild(textArea);
  
};


/**
 * Get images values
 * 
 * @function getValues
 * @returns {void}
 *
 */
getValues = () => {

  // Change status
  changeStatus();

  // Get user input
  let content = document.getElementById('imagescene-url').value;
  let wInput = document.getElementById('imagescene-w');
  let hInput = document.getElementById('imagescene-h');
  let altInput = document.getElementById('imagescene-alt');

  // Search for width and height
  if (content.includes('width=') && content.includes('height=')) {
      const widthStart = content.indexOf('width="');
      const heightStart = content.indexOf('height="');
      const widthEnd = content.indexOf('"', widthStart + 7);
      const heightEnd = content.indexOf('"', heightStart + 8);

      if (widthStart !== -1 && heightStart !== -1 && widthEnd !== -1 && heightEnd !== -1) {
          const widthValue = content.substring(widthStart + 7, widthEnd);
          const heightValue = content.substring(heightStart + 8, heightEnd);

          // Check correctness
          if (!/%$/.test(widthValue) && !/%$/.test(heightValue)) {
              wInput.value = widthValue.replace(/[^\d.-]/g, '');
              hInput.value = heightValue.replace(/[^\d.-]/g, '');
          } else {
            wInput.value = "";
            hInput.value = "";
          }
      }
  }

  // Search for alt
  if (content.includes('alt="')) {
    const altStart = content.indexOf('alt="');
    const altEnd = content.indexOf('"', altStart + 5);

    if (altStart !== -1 && altEnd !== -1) {
        const altValue = content.substring(altStart + 5, altEnd);

        // Set the value of altInput
        altInput.value = altValue;
    }
  }

};


/**
 * Change status
 * 
 * @function changeStatus
 * @returns {void}
 *
 */
changeStatus = () => {

  let status = document.getElementById('imagescene-status');
  status.textContent = '🔁 Ergebnis ist nicht aktuell';
  status.setAttribute('title', 'Bitte Szene mit den geänderten Werten neu generieren');

};


/**
 * Start generating the scene
 * 
 * @function generateScene
 * @returns {void}
 *
 */
generateScene = () => {

  // Get user input
  let uInput = document.getElementById('imagescene-url');
  let content = uInput.value;
  let wInput = document.getElementById('imagescene-w');
  let hInput = document.getElementById('imagescene-h');
  let altInput = document.getElementById('imagescene-alt');

  // Search for embedded url using regex
  const srcMatch = content.match(/src=["'](.*?)["']/);
  let url = srcMatch ? srcMatch[1] : content;

  // Check completeness
  let check = true;

  if (uInput.value === '') {
    uInput.style.backgroundColor = '#eda8252e';
    check = false;
  }
  if (wInput.value === '') {
    wInput.style.backgroundColor = '#eda8252e';
    check = false;
  }
  if (hInput.value === '') {
    hInput.style.backgroundColor = '#eda8252e';
    check = false;
  }

  if (!check) {
    showInfo('Bitte alle erforderlichen Felder ausfüllen ✖️');

    setTimeout(() => {
      uInput.style.backgroundColor = ''; 
      wInput.style.backgroundColor = ''; 
      hInput.style.backgroundColor = ''; 
    }, 1900); 

    return;

  }

  // Set status
  let status = document.getElementById('imagescene-status');
  status.textContent = '✅ Ergebnis ist aktuell';
  status.setAttribute('title', 'Die generierte Szene entspricht den Eingaben innerhalb des Generators');

  // Show result
  let show = document.getElementById('resultpart');
  show.style.display = "";
  scrollResult();

  // Get template
  let templateName = document.getElementById('imagescene-template').value;
  //let templatePath = '../templates/' + templateName + '.raw';
  let templatePath = 'https://raw.githubusercontent.com/TRMSC/imagescene-generator/main/templates/' + templateName + '.raw';
  console.log(templatePath);

  // Fetch template content
  let templateContent = '';
  fetch(templatePath)
    .then(response => {
      // Check
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.text();
    })
    .then(fetchedContent => {
      // Handle template content
      console.log(fetchedContent);
      templateContent = fetchedContent.replace(/\$URL/g, url);
      console.log(templateContent);
      templateContent = templateContent.replace(/\$WIDTH/g, wInput.value);
      console.log(templateContent);
      templateContent = templateContent.replace(/\$HEIGHT/g, hInput.value);
      console.log(templateContent);
      templateContent = templateContent.replace(/\$ALT/g, altInput.value);
      console.log(templateContent);
    })
    .catch(error => {
      console.error('Fetch error:', error);
    });

  // TEMPORARY: Usage of a dummy code
  // let templateContent = '<svg id="example"><image width="$WIDTH" height="$HEIGHT" alt="$ALT" xlink:href="$URL" /></svg>';

  // Replace placeholders
  // templateContent = templateContent.replace(/\$URL/g, url);
  // templateContent = templateContent.replace(/\$WIDTH/g, wInput.value);
  // templateContent = templateContent.replace(/\$HEIGHT/g, hInput.value);
  // templateContent = templateContent.replace(/\$ALT/g, altInput.value);

  // Put the generated code to the textarea
  //document.getElementById('imagescene-result').value = templateContent;
  // Funktion zum Escapen von HTML-Sonderzeichen
  function escapeHtml(html) {
    return html.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  // templateContent escapen und in Textarea einfügen
  document.getElementById('imagescene-result').value = escapeHtml(templateContent);


  // Copy code to the clipboard
  copyClipboard();

};


/**
 * Scroll to result
 * 
 * @function scrollResult
 * @returns {void}
 *
 */
scrollResult = () => {

  // Get target
  const target = document.getElementById('resultpart');

  // Calculate position
  const targetPosition = target.getBoundingClientRect().top + window.scrollY - 50;

  // Scroll to position
  window.scrollTo({
    top: targetPosition,
    behavior: 'smooth'
  });

};


/**
 * Copy to clipboard
 * 
 * @function copyClipboard
 * @returns {void}
 *
 */
copyClipboard = () => {

  // Copy content
  document.getElementById('imagescene-result').select();
  document.execCommand('copy');

  // Call infobox
  let content = 'In die Zwischenablage kopiert ✔';
  showInfo(content);

};


/**
 * Show information box
 * 
 * @function showInfo
 * @param content Message for the infobox
 * @returns {void}
 *
 */
showInfo = (content) => {

  let infobox = document.getElementById("imagescene-info");
  infobox.textContent = content;
  setTimeout(function () {
    infobox.classList.add("imagesceneConfirm");
  }, 50)
  setTimeout(function () {
    infobox.classList.remove("imagesceneConfirm");
    document.getSelection().removeAllRanges();
  }, 1400)

};


/**
 * Download code as svg
 * 
 * @function downloadSvg
 * @returns {void}
 *
 */
downloadSvg = () => {

  // Get values
  let svg = document.getElementById('imagescene-result').value;
  let template = document.getElementById('imagescene-template').value;

  // Get date for filename
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); 
  const day = String(date.getDate()).padStart(2, '0'); 
  const currentDate = `${year}-${month}-${day}`;

  // Handle blob
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);

  // Download
  const a = document.createElement('a');
  a.href = url;
  a.download = currentDate + '-' + 'imagescene-' + template + '.svg';
  a.click();

  // Release url ressource
  URL.revokeObjectURL(url);

};


/**
 * Handle file select when added via button or dropzone
 * 
 * @function handleFileSelect
 * @param {File} file - The file added by user
 * @returns {void}
 */
handleFileSelect = (file) => {

  // Check if a file was provided
  if (file) {

    const reader = new FileReader();

    reader.onload = function () {

      // Convert image
      const dataUri = reader.result;

      // Handle values
      const img = new Image();
      img.src = dataUri;

      img.onload = function () {

        // Save values
        const originalWidth = img.width;
        const originalHeight = img.height;
        
        // Transmit values
        let width = document.getElementById('imagescene-w');
        width.value = originalWidth;
        let height = document.getElementById('imagescene-h');
        height.value = originalHeight;
        
        // Set Data URI directly to the textarea
        let textarea = document.getElementById('imagescene-url');
        textarea.value = dataUri;
        
        console.log('Breite: ' + originalWidth + 'px');
        console.log('Höhe: ' + originalHeight + 'px');
        console.log('Data URI des ausgewählten Bildes:', dataUri);
        
      };

    };

    reader.readAsDataURL(file);

  }

};





