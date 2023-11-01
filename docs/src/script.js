/*------------------------------------------------------------------------------------------------
  Imagescene Generator - Copyright (C) 2023, TRMSC - https://trmsc.github.io/imagescene-generator/
  GNU General Public Licence 3.0 - http://www.gnu.de/documents/gpl-3.0.en.html
  CC-BY-SA 4.0 DE https://creativecommons.org/licenses/by-sa/4.0/deed.de
  Discard the copyright note by using the creative commons license (attribution is sufficient)
------------------------------------------------------------------------------------------------*/

/**
 * Call functions
 * 
 * @event
 * @listens onload
 * @class window 
 * @returns {void}
 */
window.onload = function() {

  // Hide results part
  let show = document.getElementById('resultpart');
  show.style.display = "none";

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

  // Check dimensions when textareas content was changed
  let textarea = document.getElementById('imagescene-url');
  textarea.addEventListener('input', getDimensions);

  // Update status when width input was changes
  let width = document.getElementById('imagescene-w');
  width.addEventListener('input', changeStatus);

  // Update status when height input was changes
  let height = document.getElementById('imagescene-h');
  height.addEventListener('input', changeStatus);

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
 * Get images dimensions
 * 
 * @function getDimensions
 * @returns {void}
 *
 */
getDimensions = () => {

  // Change status
  changeStatus();

  // Get user input
  let content = document.getElementById('imagescene-url').value;
  let wInput = document.getElementById('imagescene-w');
  let hInput = document.getElementById('imagescene-h');

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

  // Search for embeded url
  if (content.includes('src="') || content.includes("src='")) {
      const srcStart = content.indexOf('src="');
      if (srcStart === -1) {
          srcStart = content.indexOf("src='");
      }
      const srcEnd = content.indexOf('"', srcStart + 5);
  
      if (srcStart !== -1 && srcEnd !== -1) {
          var url = content.substring(srcStart + 5, srcEnd);
      }
  } else {
      // Use whole content if there is no embeded url
      url = content;
  }

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
    showInfo('Bitte alle Felder ausfüllen ✖️');

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

  // Show result
  let show = document.getElementById('resultpart');
  show.style.display = "";
  scrollResult();

  // Get template
  let templateName = document.getElementById('imagescene-template').value;
  let templatePath = '../templates/' + templateName + '.svg';
  // TODO: Fetch template content
  // TEMPORARY: Usage of a dummy code
  let templateContent = '<svg id="example"><image width="$WIDTH" height="$HEIGHT" xlink:href="$URL" /></svg>';

  // Replace placeholders
  templateContent = templateContent.replace(/\$URL/g, uInput.value);
  templateContent = templateContent.replace(/\$WIDTH/g, wInput.value);
  templateContent = templateContent.replace(/\$HEIGHT/g, hInput.value);

  // Put the generated code to the textarea
  document.getElementById('imagescene-result').value = templateContent;

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