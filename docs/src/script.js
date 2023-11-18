/*------------------------------------------------------------------------------------------------
  Imagescene Generator - Copyright (C) 2023, TRMSC - https://trmsc.github.io/imagescene-generator/
  GNU General Public Licence 3.0 - http://www.gnu.de/documents/gpl-3.0.en.html
  CC-BY-SA 4.0 DE https://creativecommons.org/licenses/by-sa/4.0/deed.de
  Discard the copyright note by using the creative commons license (attribution is sufficient)
------------------------------------------------------------------------------------------------*/

/**
 * Define global variables
 * 
 * @param {boolean} hasGenerated State of the generating progress
 * @param {array} templatesData Empty array for the templates.json content
 * @param {array} templatePath Path to the template directory depending on github or server adress
 * @param {string} originalFilename The filename that is used as default for download actions
 * @param {string} url Stores the image source url
 * @param {string} templateContent Includes the final content for templates imagescene
 * @param {array} shareData Site information for share method
 *
 */
let hasGenerated = false;
let templatesData = [];
let templatesPath;
let originalFilename;
let url;
let templateContent;
const shareData = {
  title: 'Imagescene Generator | TRMSC',
  text: 'Create dynamic scenes from images | TRMSC',
  url: window.location
};


/**
 * Handle onload progress
 * 
 * @event
 * @listens onload
 * @class window 
 * @returns {void}
 */
window.onload = function() {

  // Hide elements
  let infobox = document.getElementById("imagescene-info");
  infobox.style.visibility = 'hidden';

  // Call functions
  addYear();
  loadTemplates();
  listenEvents();
    
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
 * @listens click
 * @listens change
 * @listens dragover
 * @listens dragleave
 * @listens drop
 * @listens input
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

  // Update status when template was changed
  let templateSelect = document.getElementById('imagescene-template');
  templateSelect.addEventListener('change', function () {
    selectTemplates();
    changeStatus();
  });

  // Update status when width input was changes
  let width = document.getElementById('imagescene-w');
  width.addEventListener('input', changeStatus);

  // Update status when height input was changes
  let height = document.getElementById('imagescene-h');
  height.addEventListener('input', changeStatus);

  // Update status when alt input was changes
  let alt = document.getElementById('imagescene-alt');
  alt.addEventListener('input', changeStatus);

  // Clean generator fields
  let clean = document.getElementById('imagescene-clean');
  clean.addEventListener('click', function() {
    cleanGenerator('clean');
  });

  // Generate scene
  let generateButton = document.getElementById('imagescene-generate');
  generateButton.addEventListener('click', generateScene);

  // Handle preview
  let previewShowButton = document.getElementById('ic-preview-show');
  previewShowButton.addEventListener('click', handleResultPreview);
  let previewHideButton = document.getElementById('ic-preview-hide');
  previewHideButton.addEventListener('click', handleResultPreview);

  // Copy to clipboard
  let clipboardButton = document.getElementById('imagescene-copy');
  clipboardButton.addEventListener('click', copyClipboard);

  // Download HTML
  let downloadHtml = document.getElementById('imagescene-download-html');
  downloadHtml.addEventListener('click', function() {
    downloadFile('html');
  });

  // Download SVG
  let downloadSvg = document.getElementById('imagescene-download-svg');
  downloadSvg.addEventListener('click', function() {
    downloadFile('svg');
  });

};


/**
 * Load templates from templates.json
 * 
 * @function loadTemplates
 * @returns {void}
 *
 */
loadTemplates = () => {

  // Build path
  const baseUrl = window.location.href;
  const originPath = 'https://raw.githubusercontent.com/TRMSC/imagescene-generator/main/templates/';
  const relativePath = '../templates/';
  templatesPath = baseUrl.includes('github.io') ? originPath : relativePath;
  let json = templatesPath + 'templates.json';

  // Fetch data
  fetch(json)
    .then(response => response.json())
    .then(data => {
      
      // Handle template data
      templatesData = data.templates;
      let templatesSelect = document.getElementById('imagescene-template');
      templatesSelect.innerHTML = '';

      // Create options
      templatesData.forEach((template, index) => {
        const option = document.createElement('option');
        option.textContent = template.name;
        option.value = template.filename;
        if (template.default === true) option.selected = 'selected';
        templatesSelect.appendChild(option);
      });

      // Call function for changing status
      changeStatus();

      // Handle template selection
      selectTemplates();

    })
    .catch(error => {
      console.error('Error when loading templates.json: ' + error);
    });

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

        // Save filename
        originalFilename = file.name;

        // Change status
        changeStatus();
        
      };

    };

    reader.readAsDataURL(file);

  }

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

  // Handle status feedback
  let status = document.getElementById('imagescene-status');
  status.textContent = '🔁 Ergebnis ist nicht aktuell';
  status.setAttribute('title', 'Bitte Szene mit den geänderten Werten neu generieren');

  // Adjust button value
  if (hasGenerated) {
    let update = document.getElementById('imagescene-generate');
    update.value = "Szene aktualisieren";
  }

  // Handle cleaning button
  cleanGenerator('update');

};


/**
 * Handle template selection
 * 
 * @function selectTemplates
 * @returns {void}
 *
 */
selectTemplates = () => {

  // Get selection
  let templatesSelect = document.getElementById('imagescene-template');
  const selectedFilename = templatesSelect.value;
  const selectedTemplate = templatesData.find(template => template.filename === selectedFilename);
  
  // Adjust details
  const templatesName = document.getElementById('template-name');
  const templatesAuthor = document.getElementById('template-author');
  const templatesDescription = document.getElementById('template-description');
  templatesName.textContent = selectedTemplate.name;
  templatesAuthor.textContent = selectedTemplate.author;
  templatesDescription.textContent = selectedTemplate.description;

};


/**
 * Handle cleaning progress for generator
 * 
 * @function cleanGenerator
 * @param {string} way Determine ongoing in the sense of update button or clean the fields
 * @returns {void}
 *
 */
cleanGenerator = (way) => {

  // Declare variables for both ways
  let clean = document.getElementById('imagescene-clean');
  let generatePart = document.getElementById('generatepart');
  let inputFields = generatePart.querySelectorAll('input[type="number"]');
  let textAreas = generatePart.querySelectorAll('textarea');
  let templateSelect = document.getElementById('imagescene-template');
  let defaultTemplate = 'indian-summer.raw';

  // Split ongoing
  if (way === 'update') {

    // Update button
    let inputFieldsEmpty = Array.from(inputFields).every(field => field.value.trim() == '');
    let textAreasEmpty = Array.from(textAreas).every(area => area.value.trim() == '');
    let templateDefault = templateSelect.value === defaultTemplate;
    inputFieldsEmpty && textAreasEmpty && templateDefault ? clean.classList.add('ic-hidden') : clean.classList.remove('ic-hidden');

  } else {

    // Clear fields
    inputFields.forEach(field => {
      field.value = '';
    });

    textAreas.forEach(area => {
      area.value = '';
    });

    // Reset templates
    loadTemplates();

  }

};


/**
 * Start generating the scene
 * 
 * @function generateScene
 * @returns {void}
 *
 */
generateScene = () => {

  // Hide preview
  let resultPreviewContainer = document.getElementById('result-preview-container');
  resultPreviewContainer.classList.add('ic-d-none');
  let previewShow = document.getElementById('ic-preview-show');
  previewShow.classList.remove('ic-d-none');
  let previewHide = document.getElementById('ic-preview-hide');
  previewHide.classList.add('ic-d-none');

  // Get user input
  let uInput = document.getElementById('imagescene-url');
  let content = uInput.value;
  let wInput = document.getElementById('imagescene-w');
  let hInput = document.getElementById('imagescene-h');
  let altInput = document.getElementById('imagescene-alt');

  // Search for embedded url using regex
  const srcMatch = content.match(/src=["'](.*?)["']/);
  url = srcMatch ? srcMatch[1] : content;

  // Get information for generating filename
  originalFilename = content.includes("data:image/") ? "/" + originalFilename : url;
  const lastSlash = originalFilename.lastIndexOf('/');
  const lastDot = originalFilename.lastIndexOf('.');

  // Create filename
  originalFilename = (lastSlash !== -1 && lastDot > lastSlash) 
    ? originalFilename.substring(lastSlash + 1, lastDot) 
    : originalFilename.substring(lastSlash + 1, lastSlash + 9);

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
  hasGenerated = true;

  // Show result
  let show = document.getElementById('resultpart');
  show.style.display = "";
  scrollTarget('resultpart', 150);

  // Get template
  let templateName = document.getElementById('imagescene-template').value;
  let template = templatesPath + templateName;

  // Fetch template content
  fetch(template)
    .then(response => {
      // Check
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.text();
    })
    .then(fetchedContent => {
      // Handle template content
      templateContent = fetchedContent.replace(/\$URL/g, url);
      templateContent = templateContent.replace(/\$WIDTH/g, wInput.value);
      templateContent = templateContent.replace(/\$HEIGHT/g, hInput.value);
      templateContent = templateContent.replace(/\$ALT/g, altInput.value);

      // Add html addons
      templateContent = modifyContent('add', templateContent);

      // Put the generated code to the textarea
      document.getElementById('imagescene-result').value = templateContent;

      // Copy code to the clipboard
      copyClipboard();
    })
    .catch(error => {
      console.error('Fetch error:', error);
    });

};


/**
 * Modify content by adding or replacing div and html options
 * 
 * @function modifyContent
 * @param {string} action Add or remove modifications
 * @param {string} content The content that should be added
 * @returns {string} Modified content
 *
 */
modifyContent = (action, content) => {

  let lines = content.split('\n');

  if (action === 'add') {

    // Add indentations
    lines = lines.map((line, index) => (index >= 2 ? '  ' : '') + line);   

    // Add an empty line 2
    lines.splice(1, 0, '');

    // Add div tag
    let div = '<div class="imagescene">';
    lines.splice(2, 0, div);

    // Add an empty penultimate line
    if (lines[lines.length - 1] !== '  ') lines.splice(lines.length - 1, 0, '');

    // Close the div in the last line
    lines.push('</div>');

  } else if (action === 'remove') {

    // Remove line 2 and 3
    lines.splice(1, 3);

    // Remove the last line
    lines.pop();

    // Remove indentations
    lines = lines.map((line, index) => (index >= 1 ? line.replace(/^  /, '') : line));

    // Add XML declaration for SVG type
    lines.splice(0, 0, `<?xml version="1.0" encoding="UTF-8" standalone="no"?>`);

    // Add an empty line 2
    lines.splice(1, 0, '');

  }

  // Connect remaining lines
  let modifiedContent = lines.join('\n');

  // Return modified content
  return modifiedContent;

};


/**
 * Check image url and implement preview if the source is available
 * 
 * @function handleResultPreview
 * @returns {void}
 *
 */
handleResultPreview = () => {

  // Create test image
  let testImage = new Image();
  testImage.src = url;

  // Check image
  return new Promise((resolve) => {

    testImage.onload = function() {
      resolve(true);
    };

    testImage.onerror = function() {
      resolve(false);
    };

  }).then((isValid) => {

    if (isValid) {

      // Image source is given
      document.getElementById('imagescene-result-preview').innerHTML = templateContent;

    } else {

      // Image source isn't available
      document.getElementById('imagescene-result-preview').textContent = 
        "Für diese Bildszene kann keine Vorschau angezeigt werden. " +
        "Möglicherweise liegt das daran, dass die Bildquelle in einem passwortgeschützten Raum liegt " + 
        "(z.B. in Moodle) und im Browser dort aktuell keine Anmeldung besteht.";

    }

    // Function for toggling visibility
    function toggleVisibility(elementId) {
      let element = document.getElementById(elementId);
      element.classList.toggle('ic-d-none');
    }
    
    // Function calls for toggling
    toggleVisibility('result-preview-container');
    toggleVisibility('ic-preview-show');
    toggleVisibility('ic-preview-hide');

    // Scroll to preview
    scrollTarget('resultpart', 50);

  });

};


/**
 * Scroll to target
 * 
 * @function scrollTarget
 * @param {string} id The target ID
 * @param {number} value The scrolling distance
 * @returns {void}
 *
 */
scrollTarget = (id, value) => {

  // Get target
  const target = document.getElementById(id);

  // Calculate position
  const targetPosition = target.getBoundingClientRect().top + window.scrollY - value;

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
 * @param {string} target - Content to copy
 * @returns {void}
 *
 */
copyClipboard = (target) => {

  // Check if the url for sharing or the result should be copied to clipboard
  let textToCopy = target === 'share' ? shareData.url : document.getElementById('imagescene-result').value;

  if ('clipboard' in navigator) {
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        // Success
        let content = 'In die Zwischenablage kopiert ✔';
        showInfo(content);
      })
      .catch(err => {
        // Error
        console.error('copy to clipboard error: ', err);
        let content = 'Fehler beim Kopieren in die Zwischenablage ✖️';
        showInfo(content);
      });
  } else {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = textToCopy;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);

    // Call infobox
    let content = 'In die Zwischenablage kopiert ✔';
    showInfo(content);
  }

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
    infobox.style.visibility = '';
  }, 50)
  setTimeout(function () {
    infobox.classList.remove("imagesceneConfirm");
    document.getSelection().removeAllRanges();
  }, 1400)
  infobox.style.visibility = 'hidden';

};


/**
 * Download file as HTML or SVG
 * 
 * @function downloadFile
 * @param {string} type - Includes the file type (html or svg)
 * @returns {void}
 */
downloadFile = (type) => {
  // Get values
  let html = document.getElementById('imagescene-result').value;
  let template = document.getElementById('imagescene-template').value.replace(".raw", "");

  // Get date and time for filename
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  const currentDate = `${year}-${month}-${day}-${hours}-${minutes}-${seconds}`;

  // Get filename
  let userInput = document.getElementById('imagescene-filename');
  let option = document.getElementById("imagescene-filename-select").value;
  option = option
    .replace('{file}', originalFilename)
    .replace('{template}', template)
    .replace('{date}', currentDate)
    .replace('{type}', type);
  let filename = userInput.value.trim() !== '' ? userInput.value + '.' + type : option;

  // Modify content for SVG type
  html = type === 'svg' ? modifyContent('remove', html) : html;

  // Handle blob
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);

  // Download
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();

  // Release URL resource
  URL.revokeObjectURL(url);
  
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
    alert(
      'Das Teilen über die Share-API wird in diesem Browser aktuell noch nicht unterstützt. ✖️\n' +
      'Die URL der Projektseite wird daher zum Teilen in die Zwischenablage kopiert. ✔️'
    );
    copyClipboard('share');
  }
  
};


/**
 * Handle hidden Settings within the result part
 * 
 * @function handleSettings
 * @returns {void}
 * 
 * @ignore
 * This function is actually not needed but maybe important for later.
 * 
 * The following eventlistener is neccessary within listenEvents() when this function will be active:
 * // Toggle settings
 * let settingToggle = document.getElementById('imagescene-edit');
 * settingToggle.addEventListener('click', handleSettings);
 * 
 * Add the classes .edit-container and .ic-d-none for hidden parts in the index.html.
 * Further the edit button is neccessary:
 * <span id="imagescene-edit" class="ic-font-3" title="Bearbeiten">
 *   <img class="ic-icon-3" src="icons/cog.svg">
 * </span>
 *
 */
handleSettings = () => {

  // Declare target elements
  let editContainers = document.querySelectorAll('.edit-container');

  // Toggle each element
  editContainers.forEach(container => {
    container.classList.toggle('ic-d-none');
  });

};


