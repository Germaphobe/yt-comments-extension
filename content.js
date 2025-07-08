// Create observer
const observer = new MutationObserver((mutationsList) => {
  for (const mutation of mutationsList) {
    for (const node of mutation.addedNodes) {
      // Only work with element nodes
      if (node.nodeType === Node.ELEMENT_NODE) {
        // Check inside the subtree in case the span is nested
        const commentBoxes = node.querySelectorAll?.('#commentbox');
        commentBoxes?.forEach(configureCommentBox);
      }
    }
  }
});

// Observe changes in the website
observer.observe(document.body, {
  childList: true,
  subtree: true, // Catch deeply nested changes
});

// Make changes to found comment boxes
function configureCommentBox(commentBox) {
  // Duplication prevention
  if (commentBox.dataset.enhanced === "true") return;
  commentBox.dataset.enhanced = "true";

  // Find necessary elements
  const emojiButton = commentBox.querySelector('#emoji-button');  // Syntax buttons will go next to this
  const input = commentBox.querySelector('#contenteditable-root');  // Comment text field
  const footer = commentBox.querySelector('#footer'); // Comment preview will go below this

  // Create formatting preview
  const previewContainer = document.createElement("div");
  previewContainer.className = "yt-comments-enhanced-preview-container";
  previewContainer.style.display = "none";

  const previewHeader = document.createElement("h2");
  previewHeader.innerHTML = "Live Preview";

  const previewBody = document.createElement("span");

  previewContainer.appendChild(previewHeader);
  previewContainer.appendChild(previewBody);

  footer.insertAdjacentElement('afterend', previewContainer);

  // Data for formatting buttons
  const buttons = [
    {
      label: "B",
      classes: ["yt-comments-enhanced-bold"],
      onClick: () => wrapSelectionWithSymbol("*"),
    },
    {
      label: "I",
      classes: ["yt-comments-enhanced-italic"],
      onClick: () => wrapSelectionWithSymbol("_"),
    },
    {
      label: "S",
      classes: ["yt-comments-enhanced-strikethrough"],
      onClick: () => wrapSelectionWithSymbol("-"),
    },
    {
      label: 'A<span>2</span>',
      classes: ["yt-comments-enhanced-superscript"],
      onClick: () => superscriptSelection(),
    },
  ];

  // Insert buttons next to emoji button
  buttons.reverse().forEach(config => {
    const btn = createSyntaxButton(config);
    emojiButton.insertAdjacentElement("afterend", btn);
  });

  // Update preview when input is typed
  input.addEventListener("click", updatePreview);
  input.addEventListener("input", updatePreview);
  input.addEventListener("blur", updatePreview);

  function createSyntaxButton({ label, classes, onClick }) {
    const button = document.createElement("button");
    button.innerHTML = label;
    button.classList.add("yt-comments-enhanced-buttons", ...classes);
    button.addEventListener("click", () => {
      if (elementContainsSelection(input)) {
        onClick();
      }
      updatePreview();  // Update preview when button is pressed
    });
    return button;
  }

  function updatePreview() {
    const currentText = input.innerHTML.trim();
    if (currentText === "<br>" || currentText === "") {
      previewContainer.style.display = "none";
    } else {
      previewContainer.style.display = "block";
      previewBody.innerHTML = formatText(input.innerHTML);
    }
  }
}

// Places symbols around a given text selection
function wrapSelectionWithSymbol(symbol) {
  const selection = window.getSelection();
  const range = selection.getRangeAt(0);
  const selectedText = range.toString();

  const newText = document.createTextNode(`${symbol}${selectedText}${symbol}`);
  range.deleteContents();
  range.insertNode(newText);

  // Select only text inside the symbol
  const newRange = document.createRange();
  newRange.setStart(newText, 1);
  newRange.setEnd(newText, 1 + selectedText.length);

  selection.removeAllRanges();
  selection.addRange(newRange);
}

// Converts markdown text to be display with formatting
function formatText(input) {
	const output = input
		.replace(/\*(.+?)\*/g, '<span style="font-weight: 500;">$1</span>') // Bold
		.replace(/_(.+?)_/g, '<span class="yt-core-attributed-string--italicized">$1</span>') // Italic
		.replace(/-(?![^<]*>)(.+?)-(?![^<]*>)/g, '<span class="yt-core-attributed-string--strikethrough">$1</span>'); // Strikethrough
	return output.trim(); // Remove whitespace
}

// Toggles superscript on selected text
function superscriptSelection() {
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    const selectedText = range.toString();

    const newText = toggleSuperscript(selectedText);

    // Create a text node with the new content
    const newNode = document.createTextNode(newText);

    // Replace the selected content
    range.deleteContents();
    range.insertNode(newNode);

    // Reselect the new content
    const newRange = document.createRange();
    newRange.setStartBefore(newNode);
    newRange.setEndAfter(newNode);

    selection.removeAllRanges();
    selection.addRange(newRange);
}

function toggleSuperscript(str) {
  if (str === "") { return "²" }
  const superscriptMap = {
    // Numbers
    '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
    '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',

    // Capital letters
    'A': 'ᴬ', 'B': 'ᴮ', 'C': 'ꟲ', 'D': 'ᴰ', 'E': 'ᴱ',
    'F': 'ꟳ', 'G': 'ᴳ', 'H': 'ᴴ', 'I': 'ᴵ', 'J': 'ᴶ',
    'K': 'ᴷ', 'L': 'ᴸ', 'M': 'ᴹ', 'N': 'ᴺ', 'O': 'ᴼ',
    'P': 'ᴾ', 'Q': 'ꟴ', 'R': 'ᴿ', 'S': 'ˢ', 'T': 'ᵀ',
    'U': 'ᵁ', 'V': 'ⱽ', 'W': 'ᵂ', 'X': 'ᵡ', 'Y': '𐞲', 'Z': 'ᙆ',

    // Lowercase letters
    'a': 'ᵃ', 'b': 'ᵇ', 'c': 'ᶜ', 'd': 'ᵈ', 'e': 'ᵉ',
    'f': 'ᶠ', 'g': 'ᵍ', 'h': 'ʰ', 'i': 'ⁱ', 'j': 'ʲ',
    'k': 'ᵏ', 'l': 'ˡ', 'm': 'ᵐ', 'n': 'ⁿ', 'o': 'ᵒ',
    'p': 'ᵖ', 'q': '𐞥', 'r': 'ʳ', 's': 'ˢ', 't': 'ᵗ',
    'u': 'ᵘ', 'v': 'ᵛ', 'w': 'ʷ', 'x': 'ˣ', 'y': 'ʸ', 'z': 'ᶻ',

    // Symbols
    '+': '⁺', '-': '⁻', '=': '⁼', '(': '⁽', ')': '⁾', ',': '˒', '.': '⋅'
  };

  // Inverse of superscriptMap, maps superscript characters to normal characters
  const normalMap = {};
  for (const [normal, superChar] of Object.entries(superscriptMap)) {
    normalMap[superChar] = normal;
  }

  const isAllSuperscript = [...str].every(
    char => !(char in superscriptMap) || char in normalMap
  );

  if (isAllSuperscript) {
    // Convert back to normal
    return [...str].map(char => normalMap[char] || char).join('');
  } else {
    // Convert to superscript
    return [...str].map(char => superscriptMap[char] || char).join('');
  }
}

// Returns true if specified element contains whole of user's selection
function elementContainsSelection(el) {
    var sel = window.getSelection();
    if (sel.rangeCount > 0) {
        for (var i = 0; i < sel.rangeCount; ++i) {
            if (!el.contains(sel.getRangeAt(i).commonAncestorContainer)) {
                return false;
            }
        }
        return true;
    }
    return false;
}