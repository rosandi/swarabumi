#!/usr/bin/python3

from http.server import BaseHTTPRequestHandler,HTTPServer
import sys
import os
import json
import numpy as np
try:
    from scipy.fft import fft
except:
    from scipy.fftpack import fft

from subprocess import check_output as cmd
from time import sleep,time

sleeplength=0.01
host=''
port=8080
app='swara.html'
datapath='./data'

for arg in sys.argv:
    if arg.find('host=') == 0:
        host=arg.replace('host=','')
    if arg.find('port=') == 0:
        port=arg.replace('port=','')
    if arg.find('dir=') == 0:
        datapath=arg.replace('dir=','')

def spectrum(data,nseg,axis='z'):
    la=int(data['length']/2)
    
    v=fft(data[axis])
    v[0]=0  # offset
    vv=np.zeros(nseg)
    aa=np.zeros(nseg)
    
    for i in range(la):
        idx=int(nseg*(i/la))
        vv[idx]+=v[i]
        aa[idx]+=1
    
    vv=vv/aa
    fniq=0.5*data['length']/data['tsample']
    vv[0]=0 # remove offset
    return fniq,np.abs(vv).tolist()

def hvsr(data,nseg):
    la=int(data['length']/2)
    
    v=np.sqrt(fft(data['x'])**2+fft(data['y']))
    #/fft(data['z'])
    
    vv=np.zeros(nseg)
    aa=np.zeros(nseg)
    
    for i in range(la):
        idx=int(nseg*(i/la))
        vv[idx]+=v[i]
        aa[idx]+=1
    
    vv=vv/aa
    fniq=0.5*data['length']/data['tsample']
    vv[0]=0 # remove offset
    return fniq,np.abs(vv).tolist()
    

class OtherApiHandler(BaseHTTPRequestHandler):
   
    def header(self,mime):
        self.send_response(200)
        self.send_header('Content-type',mime)
        self.end_headers()       
    
    def response(self,text,mime='text/plain'):
        self.send_response(200)
        self.send_header('Content-type',mime)
        self.end_headers()
        self.wfile.write(bytes(text,'utf-8'))
    
    def do_GET(self):
        global progparam
        
        acmd=self.requestline.split()
        print('Get request received',acmd)
        
        if len(acmd) < 1:
            self.send_response(400,"invalid response")

        htfile=acmd[1].replace('/',' ').strip()

        if htfile == '' or htfile=='app':
            appfile=open(app,mode='r')
            htcontent=appfile.read()
            appfile.close()
            self.response(htcontent,'text/html')
            print('sent: ', app)
            
        elif htfile == 'favicon.ico':
            self.header('image/x-icon')
            icofile=open('favicon.ico',mode='rb')
            ico=icofile.read()
            icofile.close()
            self.wfile.write(ico)
            
        elif htfile.rfind('.js',len(htfile)-3)>0:
            # we may limit only to specific javascripts
            try:
                jsfile=open(htfile,mode='r')
                htcontent=jsfile.read()
                jsfile.close()
                self.response(htcontent)
                print('sent script: {}'.format(htfile))
            except:
                self.response("/* file not found {} */".format(htfile))

        elif htfile.rfind('.css',len(htfile)-4)>0:
            print('sending style---'+htfile)
            try:
                jsfile=open(htfile,mode='r')
                htcontent=jsfile.read()
                jsfile.close()
                self.response(htcontent,'text/css')
                print('sent css: {}'.format(htfile))
            except:
                self.response("/* file not found {} */".format(htfile))

        elif htfile.find('list') == 0:
            datafiles=[]
            ext='.'+htfile.split()[1]
            print('list ext: *{}'.format(ext))
            for df in os.listdir(datapath):
                if df.rfind(ext) > 0:
                    datafiles.append(df)
            datafiles.sort(reverse=True)
            datafiles=json.dumps({'files':datafiles})
            self.response(datafiles,'text/json')
        
        elif htfile.find('load')==0:
            param=htfile.split()
            fname=datapath+'/'+param[1]
            ln=int(param[2])
            

            try:
                fl=open(fname)
                data=json.load(fl)
                fl.close()
            except:
                self.response('*** can not find data ***')
                return
                
            # param[3] --> hvsr or axis ot plot_type              
            if param[3] == 'hvsr':
                fmax,mag=hvsr(data,ln)
            else:
                fmax,mag=spectrum(data,ln,axis=param[3])
                
            v=json.dumps({'fmax':fmax,'mag':mag})
            self.response(v,'text/json')
            
        else:
            print('unimplemented request: ',htfile)
            self.header('text/plain')
            self.wfile.write(bytes('unimplemented request: '+htfile,'utf-8'))
            

################ MAIN PROGRAM ###############

print("serving on %s:%s"%(host,port))

try:
    HTTPServer((host,int(port)), OtherApiHandler).serve_forever()

except KeyboardInterrupt:
    print("\nterminating server")
    print("bye...")
