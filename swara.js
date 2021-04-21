/* 
  Instrumentation apps
  SWARA Application
*/


function getval(elid) {
    return document.getElementById(elid).value;
}

function setval(elid,val) {
    document.getElementById(elid).value=val;
}

function drawAxis() {
    
    ctx.fillStyle='black';    
    ctx.rect(100,0,ww-ofsw,hh-ofsh);
    ctx.fill();
    
    // -- x-tics
    ctx.moveTo(ofsw,hh-ofsh);
    ctx.lineTo(ofsw,hh-ofsh+10);
    ctx.moveTo(ofsw+(ww-ofsw)/2,hh-ofsh);
    ctx.lineTo(ofsw+(ww-ofsw)/2,hh-ofsh+10);    
    ctx.moveTo(ww-1,hh-ofsh);
    ctx.lineTo(ww-1,hh-ofsh+10);
    
    // -- y-tics
    ctx.moveTo(ofsw,hh-ofsh);
    ctx.lineTo(ofsw-10,hh-ofsh);
    ctx.moveTo(ofsw,(hh-ofsh)/2);
    ctx.lineTo(ofsw-10,(hh-ofsh)/2);    
    ctx.moveTo(ofsw,1);
    ctx.lineTo(ofsw-10,1);
    ctx.stroke();
    
    ctx.font = "14px Arial";
    ctx.fillText("0", 75,hh-ofsh);
        
    ctx.font = "18px Arial";
    ctx.textAlign = "center";
    ctx.fillText("time", ofsw+(ww-ofsw)/2, hh-ofsh+50);
    
    ctx.rotate(-Math.PI/2);
    ctx.fillText("frequency (Hz)", -(hh-ofsh)/2, 20);
    ctx.rotate(Math.PI/2);
    ctx.restore();
}

function update_tics(fmax) {
    ctx.fillStyle='white';
    ctx.fillRect(30,0,60,20);
    ctx.fillRect(30,(hh-ofsh)/2-15,60,20);
    ctx.fillStyle='black';
    ctx.font = "14px Arial";
    ctx.textAlign = "center";
    ctx.fillText(fmax.toFixed(1), 75, 12);
    ctx.fillText((fmax/2).toFixed(1), 75, (hh-ofsh)/2);    
    ctx.fillStyle='white';
}

function plotfile(fname,xx,resx,resy,axis='z') {
    
    if(fname=='--' || fname=='' || fname=='null') return;
    
    $.getJSON('load/'+fname+'/'+resy+'/'+axis, function(data){
        var max=-1000;
        var min=1e8;
        
        for (i=0;i<resy;i++) {
            if (max<data.mag[i]) max=data.mag[i];
            if (min>data.mag[i]) min=data.mag[i];
        }
        
        boxh=(hh-ofsh)/resy;
        boxw=(ww-ofsw)/resx; // should be range
        ofx=ofsw+xx*boxw;
        iy=hh-100;

        for (i=0;i<resy;i++) {
            clr='hsl('+(255-255*((data.mag[i]-min)/(max-min)))+',80%,50%)';
            ctx.fillStyle=clr;
            ctx.fillRect(ofx,iy-boxh, boxw, boxh);
            iy-=boxh;
        }
        
        update_tics(data.fmax);
    });
}

function listSpectrum(from=0, to=200, res, axis='z'){
    $.getJSON('list/json',function(lst) {
        if(lst.files.lenght<to) to=lst.files.lenght;
        for(i=0;i<to;i++) {
            plotfile(lst.files[i],i,to-from,res,axis,fmax=fmax)
        }
    });  
}

function swarabox(boxid){
    sw=$(boxid).css('width');
    sh=$(boxid).css('height');
    divstr='<canvas id="spectoplot" width='+sw+' height='+sh+
            ' style="border:0px solid #000000;"></canvas>';
       
    $('#swarabox').html(divstr);
}

swarabox('#swarabox');

var cvs=document.getElementById("spectoplot");
var ctx=cvs.getContext('2d');
var hh=cvs.height;
var ww=cvs.width;
var fmax=0;
const ofsh=100;
const ofsw=100;

drawAxis();
listSpectrum(0,100,100,'hvsr');
