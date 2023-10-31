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

  addYear();
  listenEvents();
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

  let generateButton = document.getElementById('imagescene-generate');
  generateButton.addEventListener('click', generateScene);

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
  let content = document.getElementById('imagescene-url').value;

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

};