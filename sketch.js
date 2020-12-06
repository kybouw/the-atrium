/*
 * The Atrium
 *
 * A visualization project on air pollution.
 * 
 * Copyright (c) Kyle Bouwman 2020
 * 
 * Air quality data is provided by The World Air Quality Index Project.
 * Visit https://waqi.info/ for more information.
 */

let aq_index;
let loc;
let response;
let WAQI_API_TOKEN = '8ce60c6a13693bfad9d7485af0f672760ab770e2';

function get_WAQI_URL(location) {
  return "https://api.waqi.info/feed/" + location + "/?token=" + WAQI_API_TOKEN;
}

function preload() {

  //data
  var api_url = get_WAQI_URL('here');
  response = loadJSON(api_url);

  // images hosted on imgbb
  // why is github not allowing me to access image resources from the repo?

  //static elements
  house = loadImage('https://i.ibb.co/60CJhhb/House-01.png');
  house_silent = loadImage('https://i.ibb.co/CHywzQ6/house-silent.png');
  tree = loadImage('https://i.ibb.co/V2GNxJr/Tree.png');
  deadtree = loadImage('https://i.ibb.co/6D9dnZ7/deadtree.png');
  person = loadImage('https://i.ibb.co/Ks1CFGx/Person.png'); 
  //sprites
  bird_closed = loadImage('https://i.ibb.co/ZSyGpDM/Bird-closed.png');
  bird_open = loadImage('https://i.ibb.co/TRDdBjj/Bird-open.png');
  takeout = loadImage('https://i.ibb.co/yS9TZ9Q/takeout.png');
  coffeecup = loadImage('https://i.ibb.co/hCkCdSM/coffeecup.png');
  waterbottle = loadImage('https://i.ibb.co/XV51rFR/waterbottle.png');

}

function setup() {
  frameRate(60);
  createCanvas(800, 600);

  if(response.status === "ok") {
    aq_index = response.data.aqi;
    loc = response.data.city.name;
  }

  //birds
  bird_timer = 0;
  bird_density = 60 * 5;
  birds = [];

  //trash
  trash_timer = 0;
  trash = [];

  // haze
  hazecolor = color('green');
  var maxhaze = 70;
  var opacity = (aq_index > 300)? maxhaze:Math.floor((aq_index * maxhaze) / 300);
  hazecolor.setAlpha(opacity);

  // show aqi
  console.log("Location: " + loc);
  console.log("AQI: " + aq_index);

}

function draw() {

  // sky
  background('lightblue');
  noStroke();

  // ground
  fill('#199C15');
  ellipse(width * 0.3, height, width, height / 4);
  ellipse(width * 0.85, height, width * 0.45, height / 4);

  // sun
  fill('yellow');
  circle(width * 0.87, height * 0.13, height * 0.1);

  //static elements
  if(aq_index < 300) {
    image(house, width * 0.13, height * 0.55);
  }
  else {
    image(house_silent, width * 0.13, height * 0.55);
  }
  if(aq_index <= 150) {
    image(person, width * 0.45, height * 0.75);
  }
  if(aq_index > 300) {
    image(deadtree, width * 0.73, height * 0.45);
  }
  else {
    image(tree, width * 0.73, height * 0.45);
  }

  //birds
  if(Math.floor(random()*180) === 0 && 
     random() * 300 + 1 > aq_index / 3 && 
     aq_index <= 100) {

    birds.push(new Bird());
  }

  for(var i = 0; i < birds.length; i++) {
    if(birds[i].move()) {
      birds[i].draw();
    }
    else {
      birds.splice(i, 1);
    }
  }

  bird_timer++;

  //trash
  if(random() * 300 < aq_index / 3) {
    trash.push(new Trash(random([waterbottle, takeout, coffeecup])));
  }

  for(var i = 0; i < trash.length; i++) {
    if(trash[i].move()) {
      trash[i].draw();
    }
    else {
      trash.splice(i, 1);
    }
  }

  trash_timer++;

  // haze
  fill(hazecolor);
  rect(0,0,width,height);

  // text
  textSize(24);
  fill('black');
  text("Location: " + loc, 10, 30);
  text("Air Quality Index: " + aq_index, 10, 70);

}

class Trash {

  orientation = 0;
  constructor(drawing) {
    this.drawing = drawing;
    if(this.drawing === waterbottle) {
      this.width = 14;
      this.height = 44;
    }
    else if(this.drawing === takeout) {
      this.width = 51;
      this.height = 52;
    }
    else {
      this.width = 22;
      this.height = 37;
    }
    this.orientation = Math.floor(random() * 360);
    this.rightward = (Math.floor(random() * 2) === 0);
    this.speed = Math.floor(random(1, 3));
    this.y = Math.floor(random(0, height));
    if(this.rightward) {
      this.x = -50;
    }
    else {
      this.x = width + 50;
    }
  }

  //returns true if it should still be drawn, false to be deleted
  move() {
    if(this.rightward) {
      this.x += this.speed;
      if(this.x > width + 50) {
        return false;
      }
    }
    else {
      this.x -= this.speed;
      if(this.x < -50) {
        return false;
      }
    }
    return true;
  }

  draw() {
    push();
    translate(this.x + (this.width/2), this.y + (this.height/2));
    rotate(radians(this.orientation));
    image(this.drawing, 0, 0);
    pop();
  }
}


class Bird {

  flap_length = 20;
  flap_density = 40;

  constructor() {
    this.open = true;
    this.flapi = Math.floor(random() * this.flap_density);
    this.rightward = (Math.floor(random() * 2) === 0);
    this.speed = Math.floor(random(1, 3));
    this.y = Math.floor(random(height*0.10, height*0.65));
    if(this.rightward) {
      this.x = -50;
    }
    else {
      this.x = width + 50;
    }
  }

  //returns true if it should still be drawn, false to be deleted
  move() {
    if(this.rightward) {
      this.x += this.speed;
      if(this.x > width + 50) {
        return false;
      }
    }
    else {
      this.x -= this.speed;
      if(this.x < -50) {
        return false;
      }
    }
    this.flapi++;
    if(this.open && this.flapi === this.flap_density) {
      this.flapi = 0;
      this.open = false;
    }
    else if(!this.open && this.flapi === this.flap_length) {
      this.flapi = 0;
      this.open = true;
    }
    return true;
  }

  draw() {
    if(this.open) {
      image(bird_open, this.x, this.y);
    }
    else {
      image(bird_closed, this.x, this.y);
    }
  }
}