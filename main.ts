const fs=require("node:fs");
const I=process.env.MAKEFUN_INPUT_DIR||"/input",O=process.env.MAKEFUN_OUTPUT_DIR||"/output";
// Tiny stack VM, ISA.md v1. Pure binary ops (no own trap) dispatch via F;
// DIV/MOD/DIVU/MODU, jumps, calls, memory and I/O are handled below.
const F={16:(a,b)=>(a+b)|0,17:(a,b)=>(a-b)|0,18:(a,b)=>Math.imul(a,b),24:(a,b)=>a&b,25:(a,b)=>a|b,26:(a,b)=>a^b,28:(a,b)=>a<<(b&31),29:(a,b)=>a>>(b&31),30:(a,b)=>(a>>>(b&31))|0,32:(a,b)=>a==b?1:0,33:(a,b)=>a<b?1:0,34:(a,b)=>(a>>>0)<(b>>>0)?1:0};
for(let n=1;n<=40;n++){
const i="i"+String(n).padStart(3,"0"),p=fs.readFileSync(I+"/"+i+"/program.bin"),q=fs.readFileSync(I+"/"+i+"/input.bin");
fs.mkdirSync(O+"/"+i,{recursive:true});
const m=new Int32Array(256),s=[],c=[],o=[];
let L=p.length,pc=0,t=0,j=0,e=0,d=0,A=0,B=0;
while(!d){
if(t>=1e6){e=10;break}
if(pc<0||pc>=L){e=9;break}
const a=p[pc];let k;
if(a==1)k=1;else if(a==2)k=4;else if(a>47&&a<52)k=2;
else if(a<8||(a>15&&a<31)||(a>31&&a<35)||a==52||a==64||a==65||(a>79&&a<84))k=0;
else{e=5;break}
if(pc+1+k>L){e=9;break}
t++;const x=pc+1+k;pc=x;
if(F[a]){if(s.length<2){e=2;d=1}else{B=s.pop();s.push(F[a](s.pop(),B))}continue}
switch(a){
case 0:e=0;d=1;break;
case 1:if(s.length>255){e=3;d=1;break}A=p[x-1];s.push(A>127?A-256:A);break;
case 2:if(s.length>255){e=3;d=1;break}s.push(p.readInt32LE(x-4));break;
case 3:if(!s.length){e=2;d=1;break}s.pop();break;
case 4:if(!s.length){e=2;d=1;break}if(s.length>255){e=3;d=1;break}s.push(s[s.length-1]);break;
case 5:if(s.length<2){e=2;d=1;break}A=s[s.length-1];s[s.length-1]=s[s.length-2];s[s.length-2]=A;break;
case 6:if(s.length<2){e=2;d=1;break}if(s.length>255){e=3;d=1;break}s.push(s[s.length-2]);break;
case 7:if(s.length<3){e=2;d=1;break}A=s[s.length-3];s[s.length-3]=s[s.length-2];s[s.length-2]=s[s.length-1];s[s.length-1]=A;break;
case 19:if(s.length<2){e=2;d=1;break}B=s.pop();A=s.pop();if(!B){e=4;d=1;break}s.push(Math.trunc(A/B)|0);break;
case 20:if(s.length<2){e=2;d=1;break}B=s.pop();A=s.pop();if(!B){e=4;d=1;break}s.push((A%B)|0);break;
case 21:if(s.length<2){e=2;d=1;break}B=s.pop();A=s.pop();if(!B){e=4;d=1;break}s.push(Math.floor((A>>>0)/(B>>>0))|0);break;
case 22:if(s.length<2){e=2;d=1;break}B=s.pop();A=s.pop();if(!B){e=4;d=1;break}s.push(((A>>>0)%(B>>>0))|0);break;
case 23:if(!s.length){e=2;d=1;break}s[s.length-1]=(-s[s.length-1])|0;break;
case 27:if(!s.length){e=2;d=1;break}s[s.length-1]=~s[s.length-1];break;
case 48:pc=x+p.readInt16LE(x-2);break;
case 49:if(!s.length){e=2;d=1;break}if(!s.pop())pc=x+p.readInt16LE(x-2);break;
case 50:if(!s.length){e=2;d=1;break}if(s.pop())pc=x+p.readInt16LE(x-2);break;
case 51:if(c.length>63){e=7;d=1;break}c.push(x);pc=p.readUInt16LE(x-2);break;
case 52:if(!c.length){e=8;d=1;break}pc=c.pop();break;
case 64:if(!s.length){e=2;d=1;break}A=s.pop();if(A<0||A>255){e=6;d=1;break}s.push(m[A]);break;
case 65:if(s.length<2){e=2;d=1;break}A=s.pop();B=s.pop();if(A<0||A>255){e=6;d=1;break}m[A]=B;break;
case 80:if(!s.length){e=2;d=1;break}A=String(s.pop());if(o.length+A.length>65536){e=11;d=1;break}for(let f=0;f<A.length;f++)o.push(A.charCodeAt(f));break;
case 81:if(!s.length){e=2;d=1;break}A=s.pop();if(o.length>65535){e=11;d=1;break}o.push(A&255);break;
case 82:if(s.length>255){e=3;d=1;break}s.push(j<q.length?q[j++]:-1);break;
case 83:if(!s.length){e=2;d=1;break}e=s.pop()&255;d=1;break;
}
}
fs.writeFileSync(O+"/"+i+"/stdout.bin",Buffer.from(o));
fs.writeFileSync(O+"/"+i+"/exit.txt",e+"\n");
}
