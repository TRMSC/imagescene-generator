/*------------------------------------------------------------------------------------------------
  Imagescene Generator - Copyright (C) 2023, TRMSC - https://trmsc.github.io/imagescene-generator/
  GNU General Public Licence 3.0 - http://www.gnu.de/documents/gpl-3.0.en.html
  CC-BY-SA 4.0 DE https://creativecommons.org/licenses/by-sa/4.0/deed.de
  Discard the copyright note by using the creative commons license (attribution is sufficient)
------------------------------------------------------------------------------------------------*/

/**
 * @event
 * @listens onload
 * @class window 
 * @author TRMSC
 * @see https://github.com/TRMSC/hypetyper
 * @description get year for footer
 */
window.onload = function() {

    let time = new Date();
    let year = time.getFullYear();
    document.getElementById("year").innerHTML = year;
    return;
    
};