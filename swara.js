/* 
  Instrumentation apps
  SWARA Application
*/

var cvs=document.getElementById("spectoplot");
var ctx=cvs.getContext('2d');
var hh=cvs.height;
var ww=cvs.width;

const ofsh=100;
const ofsw=100;

function getval(elid) {
    return document.getElementById(elid).value;
}

function setval(elid,val) {
    document.getElementById(elid).value=val;
}

function drawAxis() {
    ctx.rect(100,0,ww-ofsw,hh-ofsh);
    ctx.stroke();
}

function plotfile(fname,xx,resx,resy,axis='z',fmax) {
    
    if(fname=='--' || fname=='' || fname=='null') return;
    
    $.getJSON('load/'+fname+'/'+resy+'/'+axis, function(data){
        var max=-1000;
        var min=1e8;
        
        if (fmax<resy) resy=fmax; // FIXME! Use frequency
        
        for (i=0;i<resy;i++) {
            if (max<data.mag[i]) max=data.mag[i];
            if (min>data.mag[i]) min=data.mag[i];
        }
        
        boxh=(hh-110)/resy;
        boxw=(ww-ofsw)/resx; // should be range
        ofx=ofsw+xx*boxw;
        iy=hh-100;

        for (i=0;i<resy;i++) {
            clr='hsl('+(255-255*((data.mag[i]-min)/(max-min)))+',80%,50%)';
            ctx.beginPath();
            ctx.rect(ofx,iy-boxh, boxw, boxh);
            ctx.fillStyle=clr;
            ctx.fill()
            iy-=boxh;
        }
        
    });
}

function listSpectrum(from=0, to=200, axis='z',fmax=Infinity){
    $.getJSON('list/json',function(lst) {
        if(lst.files.lenght<to) to=lst.files.lenght;
        for(i=0;i<to;i++) {
            plotfile(lst.files[i],i,to-from,200,axis,fmax=fmax)
        }
    });
}

//---- MAIN PROGRAM ----

drawAxis();
// plotfile('20210411102119.json',0,res=hh-ofsh);
listSpectrum(0,200,'z');
