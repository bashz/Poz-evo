var width = document.getElementById("game").offsetWidth,
height = document.getElementById("game").offsetHeight;

var ID = 0;
var pozes = [];
Poz = function(r, g, b, gen, x, y, gender, id, victories, vx, vy){
  this.r = r;
  this.g = g;
  this.b = b;
  this.gen = gen || 0;
  this.x = x || Math.round(Math.random() * width);
  this.y = y || Math.round(Math.random() * height);
  this.gender = gender || Math.round(Math.random());
  this.id = id || ++ID;
  this.victories = victories || 0;
  this.vx = vx || Math.random() * 10 - 5;
  this.vy = vy || Math.random() * 10 - 5;
  this.inactive = 0;
  this.graph;
  this.circle;
  this.init = function(selection, poz){
  	this.graph = selection.append("g");
  	this.graph.append("circle")
    .attr("r", 16)
    .attr("fill", "rgb(" + this.r + "," + this.g + "," + this.b + ")");
    this.graph.append("text")
    .attr("x", -6)
    .attr("y", 6)
    .text(this.gender ? "M" : "F");
  }
  this.destroy = function(){
  	this.graph.remove();
  }
}

combat = function(obja, obji){
  var rga = obja.r - obji.r + obji.g;
  var gba = obja.g - obji.g + obji.b;
  var bra = obja.b - obji.b + obji.r;
  var rgi = obji.r - obja.r + obja.g;
  var gbi = obji.g - obja.g + obja.b;
  var bri = obji.b - obja.b + obja.r;
  var Ra = rga * rga + gba * gba + bra * bra + Math.pow(Math.abs(obja.r - obja.g) + Math.abs(obja.g - obja.b) + Math.abs(obja.b - obja.r), 2);
  var Ri = rgi * rgi + gbi * gbi + bri * bri + Math.pow(Math.abs(obji.r - obji.g) + Math.abs(obji.g - obji.b) + Math.abs(obji.b - obji.r), 2);
  return (Ra * (.9 + Math.random() * .2)  > Ri * (.9 + Math.random() * .2));
}

reproduce = function(obja, obji){
  var r = Math.round((obja.r + obji.r) * (.4 + Math.random() * .2) + 4 * (Math.random() - .5));
  var g = Math.round((obja.g + obji.g) * (.4 + Math.random() * .2) + 4 * (Math.random() - .5));
  var b = Math.round((obja.b + obji.b) * (.4 + Math.random() * .2) + 4 * (Math.random() - .5));
  var gen = obja.gen > obji.gen? obja.gen + 1 : obji.gen + 1;
  [r,g,b] = boundry(r,g,b);
  return new Poz(r, g, b, gen, obji.x, obja.y);
}

function boundry(){
  for(arg in arguments){
    arguments[arg] = arguments[arg] < 256 ? arguments[arg] > 0 ? arguments[arg] : 0 : 256;
  }
  return arguments
}

var t= [{r:255,g:0,b:0},{r:255,g:255,b:0},{r:0,g:255,b:0},{r:0,g:255,b:255},{r:0,g:0,b:255},{r:255,g:0,b:255}];

init = function(){
	d3.select("#game svg").remove();
	var svg = d3.select("#game").append("svg")
  .attr("width", width)
  .attr("height", height);
  for(var i = 0; i < t.length; i++){
    var poz = new Poz(t[i].r, t[i].g, t[i].b);
    poz.init(svg);
    pozes.push(poz);
  }
  simulate(svg);
}

simulate = function(svg){
	var markedCollisions = [];
	var dispatch = d3.dispatch("collide");
	dispatch.on("collide", function (poza, pozi) {
		poza.inactive = 60;
		pozi.inactive = 60;
		if(poza.gender !== pozi.gender){
			var p = reproduce(poza, pozi);
			p.init(svg);
			pozes.push(p);
		}else{
			result = combat(poza, pozi);
			var index = 0;
			if(result){
				poza.victories++;
				index = pozes.map(function(e) { return e.id; }).indexOf(pozi.id);
			}else{
				pozi.victories++;
				index = pozes.map(function(e) { return e.id; }).indexOf(poza.id);
			}
      if(pozes[index]){
       pozes[index].destroy();
       pozes.splice(index, 1);
     }
   }
 });
	var Timer = d3.timer(function Timer() {
		for(var i = 0; i < markedCollisions.length; i++){
			dispatch.call("collide", null, markedCollisions[i][0], markedCollisions[i][1]);
		}
		markedCollisions = [];
		pozes.forEach(function (poz, index) {
			poz.x += poz.vx;
			poz.y += poz.vy;
			if(poz.inactive) poz.inactive--;
			if (poz.x < 0 || poz.x > width)
        poz.vx *= -1;
      if (poz.y < 0 || poz.y > height)
        poz.vy *= -1;
      poz.graph.attr("transform", "translate(" + poz.x + "," + poz.y + ")");
      for(var i = index + 1; i < pozes.length; i++){
       if (Math.sqrt((poz.x - pozes[i].x) * (poz.x - pozes[i].x) + (poz.y - pozes[i].y) * (poz.y - pozes[i].y)) <= 16 && !poz.inactive && !pozes[i].inactive){
        markedCollisions.push([poz, pozes[i]]);
      }
    }
  });
	});
}

//init();