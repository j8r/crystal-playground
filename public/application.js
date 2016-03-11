var ws = new WebSocket("ws://" + location.host);
var outputDom = document.getElementById('output');
var sidebarDom = $('#sidebar');
var consoleButton = $('a[href="#output-modal"]')

var defaultCode = 'a = 1\nb = 3\nc = a + b\nr = rand\nputs c + r\n';

if(typeof(Storage) !== "undefined") {
  defaultCode = sessionStorage.lastCode || localStorage.lastCode || defaultCode;
}

var editor = CodeMirror(document.getElementById('editor'), {
  mode: 'crystal',
  theme: 'neat',
  lineNumbers: true,
  autofocus: true,
  tabSize: 2,
  viewportMargin: Infinity,
  value: defaultCode
});

// when clicking below the editor, set the cursor at the very end
var editorDom = $('#editor').click(function(e){
  if (e.target == editorDom[0]) {
    var info = editor.lineInfo(editor.lastLine())
    editor.setCursor(info.line, info.text.length);
    editor.focus();
  }
});

var sidebarWrapper = $('#sidebar-wrapper');
var editorWrapper = $('#editor-wrapper');
var matchEditorSidebarHeight = function() {
  window.setTimeout(function(){
    sidebarWrapper.height(editorWrapper.height());
  },0)
};
editor.on("change", function(){
  if(typeof(Storage) !== "undefined") {
    localStorage.lastCode = sessionStorage.lastCode = editor.getValue();
  }
  matchEditorSidebarHeight();
});
$(window).resize(matchEditorSidebarHeight);


var inspectModal = $("#inspect-modal");
var inspectModalValues = $(".inspect-values", inspectModal);
var inspectors = {};

function Inspector(line) {
  this.lineDom = $("<div>")
      .addClass("truncate")
      .css("top", ((line-1) * 1.46 + 0.5)+ "em");
  sidebarDom.append(this.lineDom);

  this.messages = [];

  this.lineDom.click(function() {
    if (this.messages.length == 1) return;

    inspectModalValues.empty();
    for(var i = 0; i < this.messages.length; i++) {
      var message = this.messages[i];
      inspectModalValues.append($("<p>").text(message.value))
    }
    inspectModal.openModal();
  }.bind(this));

  this.addMessage = function(message) {
    this.messages.push(message);
    if (this.messages.length == 1) {
      this.lineDom.text(message.value);
    } else {
      this.lineDom.text("(" + this.messages.length + " times)").css('cursor', 'pointer');
    }
  }.bind(this);

  return this;
}

function clearInspectors() {
  sidebarDom.empty();
  inspectors = {};
}

function getInspector(line) {
  var res = inspectors[line];
  if (!res) {
    res = new Inspector(line);
    inspectors[line] = res;
  }
  return res;
}

ws.onmessage = function(e) {
  var message = JSON.parse(e.data);

  switch (message.type) {
    case "run":
      outputDom.innerText = message.output;
      if (message.output.length > 0) {
        consoleButton.removeClass('disabled');
      }
      break;
    case "value":
      getInspector(message.line).addMessage(message);
      break;
    default:
      console.error("ws message not handled", message);
  }
};

function run() {
  clearInspectors();
  outputDom.innerText = "";
  consoleButton.addClass('disabled');

  ws.send(JSON.stringify({
    type: "run",
    source: editor.getValue()
  }));

  return false;
}

$(document).ready(function(){
  $('.modal-trigger').leanModal();
});
