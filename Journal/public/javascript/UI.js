if (!Function.prototype.bind) {
  Function.prototype.bind = function (oThis) {
    if (typeof this !== "function") {
      // au plus proche de la fonction interne
      // ECMAScript 5 IsCallable
      throw new TypeError("Function.prototype.bind - ce qui est à lier ne peut être appelé");
    }

    var aArgs = Array.prototype.slice.call(arguments, 1),
        fToBind = this,
        fNOP = function () {},
        fBound = function () {
          return fToBind.apply(this instanceof fNOP
                 ? this
                 : oThis,
                 aArgs.concat(Array.prototype.slice.call(arguments)));
        };

    fNOP.prototype = this.prototype;
    fBound.prototype = new fNOP();

    return fBound;
  };
}

if(!document.getElementsByClassName) {
	document.getElementsByClassName = function(needle) {
    function acceptNode(node) {
      if (node.hasAttribute("class")) {
        var c = " " + node.className + " ";
         if (c.indexOf(" " + needle + " ") != -1)
           return NodeFilter.FILTER_ACCEPT;
      }
      return NodeFilter.FILTER_SKIP;
    }
    var treeWalker = document.createTreeWalker(document.documentElement,
        NodeFilter.SHOW_ELEMENT, acceptNode, true);
    var outArray = new Array();
    if (treeWalker) {
      var node = treeWalker.nextNode();
      while (node) {
        outArray.push(node);
        node = treeWalker.nextNode();
      }
    }
    return outArray;
  }
	var posts = document.getElementsByClassName("post");
  var closePosts = document.getElementsByClassName("close-post");
}

function hasClass(ele,cls) {
  return !!ele.className.match(new RegExp('(\\s|^)'+cls+'(\\s|$)'));
}

function addClass(ele,cls) {
  if (!hasClass(ele,cls)) ele.className += " "+cls;
}

function removeClass(ele,cls) {
  if (hasClass(ele,cls)) {
    var reg = new RegExp('(\\s|^)'+cls+'(\\s|$)');
    ele.className=ele.className.replace(reg,'');
  }
}

var socket = io();

var saveButton = document.getElementById("save");


if(saveButton)saveButton.addEventListener("click", saveFile);

var posts = document.getElementsByClassName("post");
var del_post = document.getElementsByClassName("delete-post");
var utilities = document.getElementsByTagName("header")[0];
var closePosts = document.getElementsByClassName("close-post");
var postOffTop, postOffLeft;
var open = false;

function focusPost(posts, closeBtn, event) {

  var childs = this.children;
  var item = this;
  var d = 0;
  var viewportOffset = this.getBoundingClientRect();
  if(!open) {
    // these are relative to the viewport
    postOffTop = viewportOffset.top + 5;
    postOffLeft = viewportOffset.left + 5;

    document.body.style.overflow = "hidden";

    function setTop() {
      this.style.top = 0 + "px";
    }

    function whichChild(elem){
      var  i= 0;
      while((elem=elem.previousSibling)!=null) ++i;
      return i;
    }

    function focusIn() {
      for(var el = 0; el < childs.length; el++) {
        if(childs[el].childNodes) {
          removeClass(childs[el], "leaveTop");
          removeClass(childs[el], "appearTop");
          if(/preview/.test(childs[el].className))childs[el].style.display = "none";
          if(/content/.test(childs[el].className))childs[el].style.display = "block";
          childs[el].style.animationDelay = 0+"."+d+ "s";
          childs[el].style.WebkitAnimationDelay = 0+"."+d+ "s";
          if(/content/.test(childs[el].className)) {
            addClass(childs[el], "appearLeft");
          } else {
            addClass(childs[el], "appearTop");
          }
          d = d + 2;
        }
      }
    }

    //to get item.api (useless for the moment)
    function get(item) {
      socket.emit("get", whichChild(item), "content");
    };

    window.setTimeout(setTop.bind(this), 750);
    window.setTimeout(focusIn.bind(this), 1500);
    this.style.top = postOffTop + "px";
    this.style.left = postOffLeft + "px";


    this.className = "focus_post";


    for(var el = 0; el < childs.length; el++) {
      if(childs[el].childNodes) {
        addClass(childs[el], "leaveTop");
      }
    }
    }
  open = true;
}

function closePost(post, event) {
  if (event.stopPropagation) {
    event.stopPropagation();
  }
  event.cancelBubble = true;
  event.preventDefault();

  var childs = post.children;

  function returnIn() {
    var d = 0;
    this.className = "post";
    document.body.style.overflow = "auto";
    for(var el = 0; el < childs.length; el++) {
      if(childs[el].childNodes) {
        removeClass(childs[el], "leaveTop");
        removeClass(childs[el], "appearTop");
        if(/preview/.test(childs[el].className))childs[el].style.display = "block";
        if(/content/.test(childs[el].className))childs[el].style.display = "none";
        childs[el].style.animationDelay = 0+"."+d+ "s";
        childs[el].style.WebkitAnimationDelay = 0+"."+d+ "s";
        d = d + 2;
      }
    }
  }

  function setTop() {
    post.style.left = postOffLeft + "px";
  }

  this.style.opacity = 0;
  post.style.top = postOffTop + "px";

  post.className = "unfocus_post";

  window.setTimeout(setTop.bind(post), 650);
  window.setTimeout(returnIn.bind(post), 1500);

  for(var el = 0; el < childs.length; el++) {
    if(childs[el].childNodes) {
      addClass(childs[el], "leaveTop");
    }
  }
  open = false;
}

function deletePost(post, event) {
  if (event.stopPropagation) {
    event.stopPropagation();
  }
  event.cancelBubble = true;
  event.preventDefault();

  var title = post.getElementsByTagName("h3")[0].innerHTML;

  socket.emit("deletePost", title);

}

function extendUtils() {
  console.log(this);
}

if(utilities)utilities.addEventListener("click", extendUtils.bind(utilities));

if(posts.length > 1) {
  for(post in posts){
      if(!isNaN(parseInt(post))) { 
        posts[post].addEventListener("click", focusPost.bind(posts[post], posts, closePosts[post]));
        del_post[post].addEventListener("click", deletePost.bind(del_post[post], posts[post]));
    }
  }
}

if(closePosts.length > 1) {
  for(btn in closePosts){
    if(!isNaN(parseInt(btn))) { 
      closePosts[btn].addEventListener("click", closePost.bind(closePosts[btn], posts[btn]));
    }
  }
}

// Editor

function checkFile(){
var files = editor.getFiles();
for (x in files) {
  console.log('File: ' + x); //Returns the name of each file
};
}

function getFormattedDate() {
var today = new Date();
var dd = today.getDate();
var mm = today.getMonth()+1; //January is 0!

var yyyy = today.getFullYear();
if(dd<10){
   dd='0'+dd
}
if(mm<10){
   mm='0'+mm
}
var today = mm+'-'+dd+'-'+yyyy;
return today;
}

function saveFile(){
var content = editor.exportFile();
var tr = document.getElementById("title").value,
    tg = document.getElementById("tags").value,
    tags = tg.split(',');


var desc = {
  title: tr,
  tags: tags,
  date: getFormattedDate()
};


if(desc.title && desc.tags) {
  socket.emit("save", desc, content);
} else {
  alert("No content to save");
}
}
