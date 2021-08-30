const api_url = 
      "https://swapi.dev/api/";
var cyrview = "people";
var cyrel = undefined;
var loaded = false;

async function LoadData(url){
    const response = await fetch(url);
    const data = await response.json();
    return data;
}

class ItemApi{
    static ByURL(type,url){
        var ret = null
        switch (type) {
            case "people":
               ret = new People(url,null);
              break;
            case "films":
                ret = new Film(url,null);
               break;
            default:
             break;
        }
        return ret
    }
    static ByData(type,data){
        var ret = null
        switch (type) {
            case "people":
               ret = new People(null,data);
              break;
            case "films":
                ret = new Film(null,data);
               break;
            default:
             break;
        }
        return ret
    }
}


class Lists{
    static L = {}
    static init(){
        this.L["films"]  = new List("films")
        this.L["people"]  = new List("people") 
    }

    static UpdateList(TypeList){
        this.L[TypeList].Build();
    }

}


class List {
    constructor(type) {
        this.type = type
        this.list = []
        this.load(undefined)
    }

    load(next){
        var urlload =  api_url+this.type+"/"
        if (next != undefined ){
            urlload = next
        }
        LoadData(urlload).then(data => {
            this.init(data)
        })
    }
    init(data){
            data.results.forEach(element => {
                var item = ItemApi.ByData(this.type,element) 
                this.list.push(item)
                var event = new CustomEvent("list_update", { "detail": this.type });
                document.dispatchEvent(event);
            });
            if (data.next != null) {
                this.load(data.next)
            }else{
                var event = new CustomEvent("list_loaded", { "detail": this.type });
                document.dispatchEvent(event);
            }
    }

    findByUrl(url){
        let obj = this.list.find(o => o.url === url);
        return obj;
    }

    findByIDD(idd){
        let obj = this.list.find(o => o.id === idd);
        return obj;
    }


    
    Build(){
        var html = "";

        this.list.forEach(element => {

            var pepel = document.querySelector(this.type+'[idd="'+element.id+'"]');
            if(pepel == null) {
                html += element.Build();
            }
      
        });
        UI.uppendthml(html);
    }

}



class People {
    static ByURL(url){
        return new People(url,null)
    }
    static ByData(data){
        return new People(null,data)
    }
    constructor(url,data) {
        if(url != null){
            this.url = url;
            LoadData(url).then(data => {
            this.load(data)
            })
        }else if(data != undefined){
            this.load(data)
        }
      }
      
      load(data){
        this.name = data.name;
        this.height = data.height;
        this.mass = data.mass;
        this.hair_color = data.hair_color;
        this.skin_color = data.skin_color;
        this.eye_color = data.eye_color;
        this.birth_year = data.birth_year;
        this.gender = data.gender
        this.created = data.created;
        this.edited=  data.edited;
        this.url = data.url;

        this.films = []
        data.films.forEach(film => {
            var filmel = Lists.L["films"].findByUrl(film)
            if(filmel != undefined ) {
                this.films.push(filmel);
            }else{
                var filmel = new Film();
                filmel.url = film;
                this.films.push(filmel);
            }

        });


        const ob = this.url.split("/");
        if(ob.length>0){
            this.id = ob[ob.length-2]
        }
      }


      check(){
        for (var i = 0; i < this.films.length; i++){
            var f = this.films[i];
            if (f.title == undefined) {
                 
                
                var fel = Lists.L["films"].findByUrl(f.url);
                if(fel != undefined){
                    this.films[i] = fel;
                }
            }
        }
      }

      Build(){
        this.check();
        var ret = "<people idd='"+this.id+"' onclick='Click(event,this,\""+this.id+"\")'><div class='left'>";
        ret += "<div class='face "+this.skin_color+"'><div class='mouth'><div class='eye-section'><div class='left-eye bg"+this.eye_color+"'></div><div class='right-eye bg"+this.eye_color+"'></div></div></div></div>";


        ret += "</div><div class='right'>"

        ret += "<name>"+this.name+"</name>";
        ret += "<zone>";
        ret += "<height>"+this.height+"</height>";
        ret += "<mass>"+this.mass+"</mass>";
        ret += "<hair_color>"+this.hair_color+"</hair_color>";
        ret += "<skin_color>"+this.skin_color+"</skin_color>";
        ret += "<eye_color>"+this.eye_color+"</eye_color>";
        ret += "<birth_year>"+this.birth_year+"</birth_year>";
        ret += "<gender>"+this.gender+"</gender>";
        ret += "</zone>";

        if(this.films.length>0){
            ret += "<zone>";
            this.films.forEach(film => {
                if(film != null){
                    let htmlfilm = film.BuildCompact();
                    ret += htmlfilm;
                }else{
                }
                
            });
            ret += "</zone>";
        }


        ret += "</div>"
        ret += "</people>";
        return ret;
      }

      BuildCompact(){
        var ret = "<people idd='"+this.id+"' onclick='Click(event,this,\""+this.id+"\")'>";
        ret += "<name>"+this.name+"</name>";
        ret += "</people>";
        return ret;
      }
}


class Film {
    static ByURL(url){
        return new Film(url,null)
    }
    static ByData(data){
        return new Film(null,data)
    }
    constructor(url,data) {
        if(url != null){
            this.url = url;
            LoadData(url).then(data => {
            this.load(data)
            })
        }else if(data != undefined){
            this.load(data)
        }
      }
      
      load(data){
        this.title = data.title;
        this.episode_id = data.episode_id;
        this.opening_crawl = data.opening_crawl;
        this.director = data.director;
        this.producer = data.producer;
        this.release_date = data.release_date;
        this.created = data.created;
        this.edited = data.edited
        this.url = data.url;
        const ob = this.url.split("/");
        if(ob.length>0){
            this.id = ob[ob.length-2]
        }

        this.characters = []
        data.characters.forEach(peop => {
            var peopel = Lists.L["people"].findByUrl(peop)
            if(peopel != undefined ) {
                this.characters.push(peopel);
            }else{
                var peopel = new People();
                peopel.url = peop;
                this.characters.push(peopel);
            }

        });


      }

      Check(){
        for (var i = 0; i < this.characters.length; i++){
            var f = this.characters[i];
            if (f.name == undefined) {
                var fel = Lists.L["people"].findByUrl(f.url);
                if(fel != undefined){
                    this.characters[i] = fel;
                }
            }
        }
      }

      Build(){
        this.Check();
        var ret = "<film idd='"+this.id+"' onclick='Click(event,this,\""+this.id+"\")'>";
        ret += "<title>"+this.title+"</title><zone>";
        ret += "<episode_id>"+this.episode_id+"</episode_id>";
        ret += "<director>"+this.director+"</director>";
        ret += "<producer>"+this.producer+"</producer>";
        ret += "<release_date>"+this.release_date+"</release_date></zone>";
        ret += "<opening_crawl>"+this.opening_crawl+"</opening_crawl>";

        if(this.characters.length>0){
            ret += "<zone>";
            this.characters.forEach(peop => {
                if(peop != null){
                    let htmlpeop = peop.BuildCompact();
                    ret += htmlpeop;
                }else{
                }
                
            });
            ret += "</zone>";
        }

        ret += "</film>";
        return ret;

      }

      BuildCompact(){
        var ret = "<film idd='"+this.id+"' onclick='Click(event,this,\""+this.id+"\")'>";
        ret += "<title>"+this.title+"</title>";
        ret += "</film>";
        return ret;

      }
}
  

class UI{
    static clearcontent(){

        var el = document.getElementById("list");
        if (el) {
            el.innerHTML = "";
        }
    }



    static uppendthml(html){
        var el = document.getElementById("list");
        if (el) {
            el.innerHTML= el.innerHTML + html;
        }
    }

    static init(){
        Lists.init()
        this.initevents();
    }
    static initevents(){

        
        document.addEventListener("list_loaded", function(e) {
            UpdateView();

            document.addEventListener("list_update", function(e) {
                UpdateView();
            });
        });

        
    }
}



function OnLoad() {
    loaded = true;
    UI.init();
    UpdateView();
}


function UpdateList() {
    UpdateView();
}

function UpdateView(){
    UI.clearcontent();
    if(cyrel == undefined){
        Lists.UpdateList(cyrview);
    }else{
        let html = cyrel.Build()
        UI.uppendthml(html);
    }
}

function ToList(){
    cyrel = undefined;
    UpdateView();
}

function Click(event,elmnt,idd) {
    event.stopPropagation();
    switch (elmnt.tagName) {
        case "FILM":
            cyrview = "films";
            cyrel = Lists.L[cyrview].findByIDD(idd);
          break;
        case "PEOPLE":
            cyrview = "people";
            cyrel = Lists.L[cyrview].findByIDD(idd);
           break;
        default:
         break;
    }

    UpdateView();
}

