/*
  Name:    page_builder_override.js
  History: 3-11-25 - dwaterson - Added methods to adjust framework markup for WCAG 2.0 compliancy
           4-14-25 - Added form requirement exception to loading desc. Added popover double click exception
*/

$(document).ready(function() {

  // Escape problematic characters for proper virtual domain exchange
  $("form").submit(function( event ) {
    $("textarea").each(function() {
      var replacedString = $(this).val();
      if (replacedString) {
        replacedString = replacedString.replace(/%/g, "%25"); // Escape Percent
        replacedString = replacedString.replace(/\n/g, "%0A"); // Escape New Line
        replacedString = replacedString.replace(/\r/g, "%0D"); // Escape Carriage Return
        replacedString = replacedString.replace(/\t/g, "%09"); // Escape Tab
        replacedString = replacedString.replace(/"/g, "%22"); // Escape Double-Quote
      }
      if (!replacedString || replacedString.includes(",")) {
        var currentName = $(this).attr("name");
        var textAreasCount = $("textarea[name="+currentName+"]").length;
        if (textAreasCount > 1) { // Array is Used in This Case
          replacedString = "\"" + replacedString + "\"";
        }
      }
      $(this).val(replacedString);
    });
  });

  // Sanitizes textarea data from problematic non-ASCII characers when entered
  $("textarea").on("input", function() {
    var cleantext = $(this).val();
    cleantext = cleantext.replace(/\u2013/g,"-");
    cleantext = cleantext.replace(/\u2014/g,"-");
    cleantext = cleantext.replace(/\u2022/g,"*");
    cleantext = cleantext.replace(/\uF0A7/g,"*");
    cleantext = cleantext.replace(/\uF0D8/g,"*");
    cleantext = cleantext.replace(/\uF076/g,"*");
    cleantext = cleantext.replace(/\u2018/g,"'");
    cleantext = cleantext.replace(/\u2019/g,"'");
    cleantext = cleantext.replace(/\u201C/g,"\"");
    cleantext = cleantext.replace(/\u201D/g,"\"");
    cleantext = cleantext.replace(/[^\x00-\x7F]/g,"");
    $(this).val(cleantext);
  });

  // Method applied to all framework submit buttons to prevent double-clicking
  $(".atu-prevent-double-click:not([data-bs-toggle='popover'])").click(function() {
    setTimeout(() => $(this).prop("disabled", true), 1);  // Disable button almost immediately
    setTimeout(() => $(this).prop("disabled", false), 4000); // Re-enable after 4 seconds
  });

  // Methods defined for allowing or disallowing certain keys from being entered in input fields
  $(function () {
    function showToast(message) {
      $(".toast").remove();

      var toastHTML = `
      <div style="z-index: 1050;" class="toast position-fixed top-0 end-0 m-3" role="alert" aria-live="assertive" aria-atomic="true" data-bs-autohide="true">
        <div class="toast-header">
          <i class="fas fa-ban text-danger"></i>&nbsp;
          <strong class="me-auto">Disallowed Character</strong>
          <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body">
          ${message}
        </div>
      </div>`;

      $("body").append(toastHTML);
      let toastEl = document.querySelector(".toast");
      let toast = new bootstrap.Toast(toastEl);
      toast.show();
    }

    // Class to allow Numbers only + basic nav keys
    $(".numbers-only").on("keydown", function (e) {
      let allowedKeys = [8, 37, 39, 46, 9]; // Backspace, Left Arrow, Right Arrow, Delete, Tab
      let isNumberKey = e.key >= "0" && e.key <= "9";
      let isPeriodKey = e.key === ".";

      // Prevent multiple periods (.)
      if (isPeriodKey && $(this).val().includes(".")) {
        e.preventDefault();
        showToast("Only one decimal point is allowed.");
        return;
      }

      if (!isNumberKey && !isPeriodKey && !allowedKeys.includes(e.which)) {
        e.preventDefault();
        showToast("Only numbers are allowed in this field.");
      }
    });

    // Class to restrict special char list from being entered
    $(".alphanum-only").on("keydown", function (e) {
      let disallowedChars = "@#$%^&=+`?!<>~;:\\/|*[]{}".split("");

      if (disallowedChars.includes(e.key)) {
        e.preventDefault();
        showToast("Only letters and numbers are allowed.");
      }
    });

  });

  // Apply role alert to "alert" messages, apply status for other messages
  document.querySelectorAll('.alert').forEach(element => {
    if (element.classList.contains('alert-danger') || element.classList.contains('alert-warning')) {
        element.setAttribute('role', 'alert');
    } else {
        element.setAttribute('role', 'status');
    }
  });

  
  // Assign name as id and adjust label for attribute to id
  document.querySelectorAll("input, select, textarea").forEach((element, index) => {
    let baseName = element.name || "input"; // Use name, fallback to "input"

    if (element.type === "hidden") return;
	  
    // Ensure uniqueness for elements sharing the same name
    let uniqueId = element.id || `${baseName}-${index}`;
    element.id = uniqueId; // Assign only if missing

    // Find the closest *unassigned* label
    let label = document.querySelector(`label[for="${baseName}"]`);

    if (label) {
        label.setAttribute("for", uniqueId); // Assign correct ID to label
    }
  });
  
// End of Document Ready
});

// Method used to showing a blocking Loading... message on event
function showLoadingDescriptions() {
  const activeElement = document.activeElement;

  // Check if the active element is inside a form
  const form = activeElement && activeElement.closest && activeElement.closest("form");
  if (form) {
    // If inside a form, validate before showing loader
    if (!form.checkValidity()) {
      form.reportValidity(); // Show validation errors
      return; // Don't show the loader
    }
  }

  // Show the loading overlay
  if (!document.getElementById("blurDescriptions")) {
    $("body").append(`
      <div id="blurDescriptions"
           style="top:0; left:0; position:fixed; display:none; height:100vh; width:100vw;
                  background-color:#333; opacity:.6; filter:alpha(opacity:60); text-align:center;">
          <div id="loadingDescriptions"
               style="position:fixed; top:50%; left:50%; transform:translate(-50%, -50%);
                      -webkit-transform:translate(-50%, -50%); -ms-transform:translate(-50%, -50%);
                      color:#fff; font-size:100px; display:none;">
              Loading...
          </div>
      </div>
    `);
  }

  $("#blurDescriptions").css({ display: "block" });
  $("#loadingDescriptions").css({ display: "block" });
}

// Method used to hide the blocking Loading... message
function hideLoadingDescriptions() {
  $("#loadingDescriptions").css({display: "none"});
  $("#blurDescriptions").css({display: "none"});
}

