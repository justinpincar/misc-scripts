function Animation(e,t,n,r) {
  this.offset = r || function() { return 0 };
  r = this.offset(viewportHeight);
  this.element = e;
  var i = e.offsetTop;
  this.start = i+r;
  this.height = e.offsetHeight;
  this.end = this.height+i;
  this.state = 0;
  this.animation = t;
  this.reset = n;
}

globalScrollPos = 0;
viewportHeight = window.innerHeight;
animations = [];
AnimationStateIdle = 0;
AnimationStateAnimating = 1;

Animation.prototype.resize = function(e) {
  var t = this.element.offsetTop;
  this.start = t+this.offset(e);
  this.height = this.element.offsetHeight;
  this.end = this.height+t;
}

Animation.prototype.animate = function(e, t) {
  if (this.end < e) {
    this.state == AnimationStateAnimating && (this.reset(), this.state = AnimationStateIdle);
    return;
   }

   if(this.start > e) {
     this.state == AnimationStateAnimating && (this.reset(), this.state = AnimationStateIdle);
     return;
   }
   
   this.state = AnimationStateAnimating, this.animation.call(this,e);
};

var rotate = new Animation (
  document.getElementById("timetracking"),
  function(e){
    stopwatchIndicator.style.webkitTransform = "rotate("+Math.floor(e/2)+"deg)"
  },
  function () {},
  function(e) { return -1*e }
);
animations.push(rotate);

var invoice=new Animation(document.getElementById("invoice"),function(e){var t=-1*this.height+(e-this.start);this.element.style.backgroundPosition="0px "+Math.max(t/2*-1,0)+"px",invoiceStamp.style.webkitTransform="scale("+Math.max(1+t/200*-1,1)+")",invoiceStamp.style.opacity=Math.min(1-t/300*-1,1)},function(){this.element.style.backgroundPosition="0px 0px"},function(e){return-1*e});animations.push(invoice);

var report=new Animation(document.getElementById("reports"),function(e){var t=-1*this.height+(e-this.start);reportsTooltip.style.opacity=Math.max(Math.min(t/300,1),0),reportsTooltip.style.webkitTransform="scale("+Math.max(Math.min(t/300,1),0)+")"},function(){},function(e){return-1*viewportHeight-150});animations.push(report);

var iphone=new Animation(document.getElementById("iphone"),function(e){var t=-1*this.height+(e-this.start),n=Math.max(t/2*-1,0)+"px 0px";iphoneContent.style.backgroundPosition=n},function(){iphoneContent.style.backgroundPosition="0px 0px"},function(e){return-1*e+100});animations.push(iphone),

function e() {
  var t = $(window).scrollTop();
  if (t == globalScrollPos) {
    window.requestAnimFrame(e);
    return;
  }
  t > 0 ? $(navigation).addClass("shadow") : $(navigation).removeClass("shadow");
  t > 95 ? $(navigation).addClass("blue-signup") : $(navigation).removeClass("blue-signup");
 
  globalScrollPos = t;

  for (var n=animations.length-1; n>=0; n--) {
    var r = animations[n];
    r.animate(t, viewportHeight)
  }
  
  window.requestAnimFrame(e);
}();
