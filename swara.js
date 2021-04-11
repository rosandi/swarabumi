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

function plotfile(fname,xx,res,axis='z') {
    
    if(fname=='--' || fname=='' || fname=='null') return;
    
    
    $.getJSON('load/'+fname+'/'+res+'/'+axis, function(data){
        var max=-1000;
        for (i=0;i<res;i++) if (max<data.mag[i]) max=data.mag[i];
        
        
        boxh=Math.round((hh-110)/res);
        boxw=ww/200; // should be range
        ofx=ofsw+xx*boxw;
        iy=hh-100;

        for (i=0;i<res;i++) {
            clr='hsl('+(255-255*(data.mag[i]/max))+',100%,50%)';
            ctx.beginPath();
            ctx.rect(ofx,iy-boxh, boxw, boxh);
            ctx.fillStyle=clr;
            ctx.fill()
            iy-=boxh;
        }
        
    });
}

function listSpectrum(from=0, to=200, axis='z'){
    $.getJSON('list/json',function(lst) {
        if(lst.files.lenght<to) to=lst.files.lenght;
        for(i=0;i<to;i++) {
            plotfile(lst.files[i],i,hh-ofsh,axis)
            
        }
    });
}

//---- MAIN PROGRAM ----

drawAxis();
// plotfile('20210411102119.json',0,res=hh-ofsh);
listSpectrum();
