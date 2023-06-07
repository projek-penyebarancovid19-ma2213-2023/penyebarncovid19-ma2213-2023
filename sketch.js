let bg
let logo1
let logo2
let jumlahPenduduk;
let koefisienPenularan;
let koefisienKesembuhan;

class Orang {
  constructor(x, y, r, p) {
    this.r = r;
    this.pos = createVector(x, y);
    this.vel = createVector(random(-1, 1), random(-1, 1));
    this.vel.mult(4);
    this.status = 1;
    this.waktusakit = 0;

    this.move = true;

    this.peluangbepergian = p;
    if (random() > this.peluangbepergian) {
      this.move = false;
    }
  }

  tumbukan(lain) {
    var jarak = dist(this.pos.x, this.pos.y, lain.pos.x, lain.pos.y);
    return jarak <= this.r + lain.r;
  }

  gantaiarah(lain) {
    var tmp = lain.vel;
    lain.vel = this.vel;
    this.vel = tmp;
  }

  penularan(lain, timestamp) {
    if (this.status == 2 && lain.status == 1) {
      lain.status = 2;
      lain.waktusakit = timestamp;
    }

    if (lain.status == 2 && this.status == 1) {
      this.status = 2;
      this.waktusakit = timestamp;
    }
  }

  ceksembuh(waktunyata, masapenyembuhan) {
    if (waktunyata >= this.waktusakit + masapenyembuhan) {
      this.status = 3;
    }
  }

  update() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);

    if (this.pos.y + this.vel.y - this.r <= 265 || this.pos.y + this.vel.y + this.r >= 475) {
      this.vel.y = this.vel.y * -1;
    }

    if (this.pos.x + this.vel.x - this.r <= 35 || this.pos.x + this.vel.x + this.r >= width/2 - 35) {
      this.vel.x = this.vel.x * -1;
    }
  }

  show() {
    noStroke();
    ellipseMode(RADIUS);
    var col;

    switch (this.status) {
      case 1:
        col = color(0, 200, 0);
        break;
      case 2:
        col = color(200, 0, 0);
        break;
      case 3:
        col = color(0, 0, 200);
        break;
    }
    fill(col);
    ellipse(this.pos.x, this.pos.y, this.r, this.r);
  }
}

var jum = 500;
var peluangbepergian = 1;
var masapenyembuhan = 150;
var sisi = 500;
var faskes = 80;
var h = [];
var radius = 5;
var waktunyata = 0;
var psakit = [];
var info;

function preload(){
  bg=loadImage("bg.jpg")
  logo1=loadImage("logoitera.png")
  logo2=loadImage("logomath.png")
 
}
function setup() {
  createCanvas(1250, 750);
  
  jumlahPenduduk = createInput();
  jumlahPenduduk.position(400, 520);
  jumlahPenduduk.changed(draw)
  
  koefisienPenularan = createInput();
  koefisienPenularan.position(400, 560);
  koefisienPenularan.changed(draw)
  
  koefisienKesembuhan = createInput();
  koefisienKesembuhan.position(400, 600);
  koefisienKesembuhan.changed(draw)
  
  for (var i = 0; i < jum; i++) {
    var x = random(30 + radius, width/2 - 60 - radius);
    var y = random(260 + radius, 480 - radius);
    h.push(new Orang(x, y, radius, peluangbepergian));
  }
  
  h[0].status = 2;
  h[0].move = true;
  
  info = createElement("h2");
  info.style('color', 'white');
  info.position(40,507)
}

function draw() {
  //background
  loop()
  background("#7E1717")
  image(bg,0,0,1250,225)

  //simulasi
  fill("#white")
  text("Jumlah Penduduk", 400, 515);
  text("Koefisien Penularan", 400, 555);
  text("Koefisien Kesembuhan", 400, 595);
  rect(30,255,width/2-60,225)
  
  jum = parseInt(jumlahPenduduk.value());
  peluangbepergian = parseFloat(koefisienPenularan.value());
  masapenyembuhan = parseInt(koefisienKesembuhan.value());
  
  kalkulasi = { sh: 0, sk: 0, sm: 0, mt: 0 };
  
  for (var i = 0; i < jum; i++) {
    for (var j = i; j < jum; j++) {
      var tumbukan = h[i].tumbukan(h[j]);
      
      if (j != i && tumbukan) {
        h[i].gantaiarah(h[j]);

        if ((h[i].status == 2 || h[j].status == 2) && !(h[i].status == 2 && h[j].status == 2)) {
          h[i].penularan(h[j], waktunyata);
        }
      }
    }
    
    switch (h[i].status) {
      case 1:
        kalkulasi.sh++;
        break;
      case 2:
        kalkulasi.sk++;
        break;
      case 3:
        kalkulasi.sm++;
        break;
    }

    if (h[i].status == 2) {
      h[i].ceksembuh(waktunyata, masapenyembuhan);
    }
    
    if (h[i].move) {
      h[i].update();
    }
    
    h[i].show();
  }

  if (kalkulasi.sk > faskes) {
    kalkulasi.mt = kalkulasi.sk - faskes;
  }
  
  var kal = kalkulasi.sm - kalkulasi.mt < 0 ? 0 : kalkulasi.sm;
  info.html(`Susceptible: ${kalkulasi.sh} <br> Infected: ${kalkulasi.sk} <br> Recovered: ${kal}`);
  
  if (kalkulasi.sk > 0) {
    psakit.push([kalkulasi.sh, kalkulasi.sk, kalkulasi.sm]);
  }
  
  stroke(0);
  rect(30,height-100,width/2-60,100)
  line(30, height - 100, width/2-30, height - 100);
  
  stroke(125);
  line(30, height - faskes, width/2-30, height - faskes);
  
  for (var c = 0; c < psakit.length; c++) {
    var m0 = map(psakit[c][0], 0, jum, 0, 100);
    stroke(0, 200, 0, 125);
    line(c+30, height - 100, c+30, height - 100 + m0); 

    var m1 = map(psakit[c][1], 0, jum, 0, 100);
    stroke(200, 0, 0, 125);
    line(c+30, height, c+30, height - m1); 

    var m2 = map(psakit[c][2], 0, jum, 0, 100);
    stroke(0, 0, 200, 125);
    line(c+30, height - 100, c+30, height - 100 + m2); 
  }

  if (kalkulasi.sk == 0) {
    noLoop();
  }
  
  waktunyata++;
  
  
  //logo 
  image(logo1,1110,10,50,50)
  image(logo2,1165,7,58,58)
  
  //judul
  textSize(30)
  textStyle(BOLD)
  fill("white")
  text("PENULARAN VIRUS COVID19",400,120)
  
  textSize(20)
  text("Tugas Besar Mata Kuliah Visualisasi Dalam Sains Kelompok 3",320,140)
  textSize(30)
  text("Apa si Covid 19 itu??",750,275)
  textSize(18)
  text("Coronavirus Disease-2019(C0VID-19) merupakan suatu virus yang",670,305)
  text("dapat menyebabkan penyakit menular dengan gejala batuk, demam,",650,325)
  text("dan hilangnya indra perasa maupun penciuman, hingga sesak napas.",650,345)
  text("Negara kepulauan seperti Indonesia memiliki awal wabah yang",670,375)
  text("berbeda, Sehingga,penanganan wabah yang terjadi berbeda beda.",650,395)
  text("Akibatnya,hasil data kasus yang terkonfirmasi COVID-19 bervariasi",650,415)
    text("dan sulit di prediksi.",650,435)
  text("Pada Simulasi disamping kami menggunakan model SIR untuk  ",670,465)
  text("Menganalisis dinamika dan perilaku evolusi penyakit. Model SIR",650,485)
  text("terdiri atas 3 kelas populasi:",650,505)
  text("1.S = Individu Rentan",650,525)
  text("2. I = Individu Terinfeksi",650,545)
  text("3.R = Individu Sembuh",650,565)
  
  textSize(15)
  text("Tugas ini disusun Oleh kelompok 3",3*width/4,645)
  //namakelompok
  textSize(10)
  text("1.Aziza Yossefa",3*width/4,664)
  text("2.Ivan Daniel Siringo",3*width/4,675)
  text("3.Julia Fitriani",3*width/4,686)
  text("4.Nimas Prakesti Mika Aziz",3*width/4,697)
  text("5.Khairunisa",3*width/4,708)
  text("6.Cindy Salvia Situmorang",3*width/4,719)
  text("7.Adrian Aiken",3*width/4,730)
  //nim
  text("119160016",3*width/4+150,664)
  text("121160053",3*width/4+150,675)
  text("121160064",3*width/4+150,686)
  text("121160069",3*width/4+150,697)
  text("121160081",3*width/4+150,708)
  text("121160089",3*width/4+150,719)
  text("121160109",3*width/4+150,730)
}