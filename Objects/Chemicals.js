var cdata=[];
var rdata=[];
cdata['Ferric Chloride']=new Chemical('Ferric Chloride','light brown',-1,0,'FeCl3',0.16,2.9,162,'brown',undefined);
class Reaction{
    constructor(pr,ba,cat){
        this.Products=pr;  
        this.Balance=ba;      
        this.Catalyst=cat;
    }
}
function Transfer(a,b,vol){
    if(vol==0)
    	return;
    vol=Math.min(vol,a.volume);
    for(var i=0;i<a.Chemicals.length;i++){
        var flag=0;
        if(a.Chemicals[i].Moles>Math.pow(10,-10)){
            for(var j=0;j<b.Chemicals.length;j++){
                if(b.Chemicals[j].Name==a.Chemicals[i].Name){
                    var tr=a.Chemicals[i].Moles*vol/a.volume;
                    b.Chemicals[j].Moles+=tr;
                    a.Chemicals[i].Moles-=tr;
                    flag=1;
                    break;
                }
                else if(rdata[b.Chemicals[j].Name]!=undefined && rdata[b.Chemicals[j].Name][a.Chemicals[i].Name]!=undefined){
                    var x=rdata[b.Chemicals[j].Name][a.Chemicals[i].Name];
                    var l=Math.min(a.Chemicals[i].Moles*vol/a.volume,b.Chemicals[j].Moles*x.Balance[0]/x.Balance[1]);
                    if(l==a.Chemicals[i].Moles*vol/a.volume)
                        flag=1;
                    var t;
                    a.Chemicals[i].Moles-=l;
                    b.Chemicals[i].Moles-=l*x.Balance[1]/x.Balance[0];
                    for(var k=0;k<x.Products.length;k++){
                        t=copyChemical(cdata[x.Products[k]]);
                        if(t.Col_in_water==undefined){
                            console.log(cdata[x.Products[k]]);
                        }
                        t.Moles=x.Balance[k+2]*l/x.Balance[0];
                        var f2=1;
                        for(var m=0;m<b.Chemicals.length;m++){
                            if(b.Chemicals[m].Name==t.Name){
                                b.Chemicals[m].Moles+=t.Moles;
                                f2=0;
                            }
                        }
                        if(f2)
                            b.Chemicals.push(t);
                    }
                }
            }
        }
        else
            flag=1;
        if(!flag){
            var temp=new Chemical(a.Chemicals[i].Name,a.Chemicals[i].Color,a.Chemicals[i].Nature,a.Chemicals[i].Nfac,a.Chemicals[i].Formula,a.Chemicals[i].Moles,a.Chemicals[i].Density,a.Chemicals[i].Molarmass,a.Chemicals[i].Col_in_water);
            temp.Moles*=(vol/a.	volume);
            a.Chemicals[i].Moles-=temp.Moles;
            b.Chemicals.push(temp);
        }
    }

    a.volume-=vol;
    b.volume+=vol;
    if(a.volume < Math.pow(10,-10)){
        a.Clear();
    }
    a.FindWeight();
    b.FindWeight();
    b.FindNature();
    b.FindColor();
    // var tep=(b.Chemicals[0].Moles*b.Chemicals[0].Nature*b.Chemicals[0].Nfac+b.Chemicals[1].Moles*b.Chemicals[1].Nature*b.Chemicals[1].Nfac+b.Chemicals[2].Moles*b.Chemicals[2].Nature*b.Chemicals[2].Nfac);
    // console.log(tep);
    // tep/=b.volume;
    // var pph;
    // if(tep<0){
    //     console.log("here1");
    //     pph=14+Math.log10(-tep+Math.pow(10,-4))-3;
    // }
    // else{
    //     console.log("here2");
    //    pph=-Math.log10(tep+Math.pow(10,-4))+3;
    // }
    // console.log(pph);
}
function Mixture(chemarr,ind){
    this.Indicator=ind;
    this.Hions=0;
    this.Ph=7;
    this.Chemicals=chemarr;
    this.volume=0;
    this.Color='transparent';
    this.Temperature=25;
    this.weight=0;
    for(var i=0;i<this.Chemicals.length;i++){
    	this.volume+=this.Chemicals[i].Moles*this.Chemicals[i].Molarmass/this.Chemicals[i].Density;
        this.weight+=this.Chemicals[i].Moles*this.Chemicals[i].Molarmass;
    }
    this.Chemicals.volume=Number((this.Chemicals.volume)).toFixed(3);
    this.FindNature=function(){
        if(this.volume==0){
        	this.Hions=0;
        	this.Ph=7;
            return;
        }
        this.Hions=0;
        for(var i=0;i<this.Chemicals.length;i++){
            this.Hions+=this.Chemicals[i].Moles*this.Chemicals[i].Nature*this.Chemicals[i].Nfac;
        }
        this.Hions*=1000;
        this.Hions/=this.volume;
        if(this.Hions<0){
        	this.Ph=14+Math.log10(-this.Hions+Math.pow(10,-7));
        }
    	else{
           this.Ph=-Math.log10(this.Hions+Math.pow(10,-7));
        }
    }
    this.FindColor=function(){
    	var iswater=0;
        for(var i=0;i<this.Chemicals.length;i++){
        	if(this.Chemicals[i].Name=='Water'){
        		iswater=1;
        		break;
        	}
        }
    	this.Color='transparent';
    	if(this.Indicator!=undefined){
    		this.Color=this.Indicator.Color(this.Ph);
    	}
    	if(this.Color=='transparent'){
        var maxmoles=0;
        var maxcol='transparent';
	    if(iswater==0){
	        for(var i=0;i<this.Chemicals.length;i++){
	            if(this.Chemicals[i].Color!='transparent'){
	                if(this.Chemicals[i].Moles > maxmoles){
	                    maxcol=this.Chemicals[i].Color;
	                    maxmoles=this.Chemicals[i].Moles;
	                }
	            }
	        }
	    }
	    else{
	    	for(var i=0;i<this.Chemicals.length;i++){
	            if(this.Chemicals[i].Col_in_water!='transparent'){
	                if(this.Chemicals[i].Col_in_water==undefined){
                        console.log(this.Chemicals[i].Name)
                    }
                    if(this.Chemicals[i].Moles > maxmoles){
	                    maxcol=this.Chemicals[i].Col_in_water;
	                    maxmoles=this.Chemicals[i].Moles;
	                }
	            }
	        }	
	    }
        if(maxcol!='transparent')
            this.Color=maxcol;
        if(this.Color=='transparent')
            this.Color="blue";
        }
        if(this.Color!='blue'){
            this.Color=parseInt(this.Color,16);
        }
        this.Color=new THREE.Color(this.Color);        
    }
    this.FindWeight=function(){
        this.volume=0;
        this.weight=0;
        for(var i=0;i<this.Chemicals.length;i++){
            this.weight+=this.Chemicals[i].Moles*this.Chemicals[i].Molarmass;
            this.volume+=this.Chemicals[i].Moles*this.Chemicals[i].Molarmass/this.Chemicals[i].Density; 
        }
    }
    this.FindNature();
    this.FindColor();
    this.toString=MixtoString;
    this.Clear=function(){
        this.volume=0;
        this.Chemicals=[];
        this.Color='blue';
    	this.Ph=7;
    	this.Hions=0;
    }
    this.Reduce=function(v){
        if(this.volume==0)
            return;
        v=Math.min(this.volume,v);
        for(var i=0;i<this.Chemicals.length;i++){
            this.Chemicals[i].Moles-=(this.Chemicals[i].Moles*v)/this.volume;
        }
        this.volume-=v;
        this.FindWeight();
    }
}
function MixtoString(){
	var s='new Mixture([';
	for(var i=0;i<this.Chemicals.length;i++){
		s+=this.Chemicals[i].toString();
		if(i!=this.Chemicals.length-1)
			s+=',';
	}
	s+='])';
	return s;
}
function Chemical(nc,col,nat,nf,cf,mol,den,mm,colw){
    this.Name=nc;
    this.Color=col;
    this.Nature=nat;
    this.Nfac=nf;
    this.Formula=cf;
    this.Moles=mol;
    this.Density=den;
    this.Molarmass=mm;
    this.Col_in_water=colw;
    this.toString=ChemToString;
}
function copyChemical(x){
    var r=new Chemical(x.Name,x.Color,x.Nature,x.Nfac,x.Formula,x.Moles,x.Molarmass,x.Density,x.Col_in_water);
    return r;
}
function ChemToString(){
	var s='new Chemical(';
    s+='\''+this.Name+'\''+',';
    s+='\''+this.Color+'\''+',';
    s+=this.Nature+',';
    s+=this.Nfac+',';
    s+='\''+this.Formula+'\''+',';
    s+=this.Moles+',';
    s+=this.Density+',';
    s+=this.Molarmass+',';
    s+='\''+this.Col_in_water+'\''+',';
    s+=this.Temperature+')';
    return s;
}
class Indicator{
    constructor(){
        this.color=function(){
        }
    }
}