/*author: Vinicius Gomes
email:vinigomescunha at gmail.com*/
String.prototype.capitalize = function () {
  return this.replace(/^./, function (match) {
    return match.toUpperCase();
  });
};
buildElement = function(o){
	var ob = document.createElement(o.e);
	for(var a in o.attr) {
		if(typeof o.attr[a] == "object"){/*second level example: ob.style.width */
			for(var b in o.attr[a]) ob[a][b] = o.attr[a][b];
		} else {
			ob[a] = o.attr[a];
		}
	}
	return ob;
};
var Commom = {
	limit:10,
	page:0,
	allowedtypes :["text","checkbox","select-one","hidden"],
	fields :["name","email","address"], /*fields of node*/
	toggleClass: function(n) {
		e = document.getElementsByClassName(n)[0];
		e.style.visibility = (e.style.visibility == "visible") ? "hidden" : "visible";
	},
	advert: function (d,t) {/*success alert*/
		d = JSON.parse(d);
		a = document.getElementsByClassName("alert")[0];
		if(d.result == true ) a.innerText = t;
	},
	processList: function(r) {/* process fields list and send rows */
		if(r == false) return r; 
		var div = document.createElement('div'),
		h = document.createElement("div"),
		c = (document.getElementById("content").offsetWidth-120),
		pc = c / Commom.fields.length;
		h.className = "row";
		for(var i in Commom.fields){
			var d = buildElement({e:"div","attr":{className:"header cell","style":{"width":pc + "px"},innerHTML: Commom.fields[i].capitalize()}});
			h.appendChild(d);
		}
		div.appendChild(h);
		for(var i in r) {
			if(!r[i].id) continue;
			var rw = document.createElement('div');
			rw.className="row";
			for(var j in r[i]) {
				if(["id"].indexOf(j) !== -1) continue;//dont display field ID
				var inner = typeof r[i][j] == "string" ? r[i][j] : " &nbsp; ";
				var d = buildElement({e:"div", "attr":{className:j + " cell", innerHTML:inner, "style":{"width":pc + "px"}}});
				rw.appendChild(d);
			}
			var b = buildElement({e:"div", "attr":{className:"control cell"}}),
			ae = buildElement({e:"a", "attr":{href:"javascript:Commom.toggleUpdateForm('" + r[i].id + "')", innerText:"Editar"}}),
			ad = buildElement({e:"a", "attr":{href:"javascript:Commom.delete('" + r[i].id + "')", innerText:"Deletar"}});
			b.appendChild(ae);
			b.appendChild(ad);
			rw.appendChild(b);
			div.appendChild(rw);
		}
		return div;
	},
	paginate: function(num) {
		var p = document.createElement('ul'),
		l = Commom.limit,
		t;
		p.className = "pagination";
		var t = Math.floor(num/(l));
		for(var i=0;i<=t;i++) {
			var li = document.createElement('li');
			var a = buildElement({e:"a", "attr":{innerText: i+1, "href":"javascript:Commom.list(" + i + ")"}});
			li.appendChild(a);
			p.appendChild(li);
		}
		return p;
	},
	listData: function (d) {/* send fields to process, and after process the rows attach in the html */
		d = JSON.parse(d);
		var r = d.result,
		content = document.getElementById("content"),
		rw = Commom.processList(r),
		page = Commom.paginate(d.result.rows);
		content.innerHTML = "";
		if(rw) content.appendChild(rw);
		content.appendChild(page);
	},
	getFormElements: function(t) {/*get form elements in create and update*/
		var el = t.elements,
		f = [];
		for(var e in el) { /*while dont support select-multiple*/
			if(Commom.allowedtypes.indexOf(el[e].type) == -1 ) continue;
			var n = el[e].getAttribute('name'),
			v = t.elements.namedItem(n).value;
			f.push("fields[" + n + "]=" + encodeURIComponent(v));
		}
		return f.join("&");
	},
	create: function(e) {
		e.preventDefault(); /* extract elements of form*/
		if(this.elements['id']) this.elements['id'].remove();
		var f = Commom.getFormElements(this);
		Commom.post(f, "ajax/create.php", function(d){ Commom.advert(d,"Adicionado com sucesso!"); });
		this.reset();
		Commom.toggleClass("createform");
		setTimeout(function(){ Commom.list(Commom.page); }, 2000);
	},
	update: function(e) {
		e.preventDefault(); 
		var id = this.elements['id'].value,
		f = Commom.getFormElements(this);
		Commom.post(f, "ajax/update.php?id=" + id, function(d){ Commom.advert(d,"Atualizado com sucesso!"); });
		this.reset();
		Commom.toggleClass("updateform");
		Commom.list(Commom.page);
	},
	delete: function(e) {
		Commom.post("", "ajax/delete.php?id=" + e, function(d){ Commom.advert(d,"Deletado com sucesso!"); });
		setTimeout(function(){ Commom.list(Commom.page); }, 2000);
	},
	toggleUpdateForm: function(e) {
		Commom.post("", "ajax/find.php?n=id&s=" + e , function(a){
			a = JSON.parse(a);
			a = a.result[0];
			if(typeof a == 'undefined') {
				document.getElementsByClassName("alert")[0].innerText = "404 - Not Found!";
				return false;
			}
			var u = document.getElementById('fUpdate');
			u.reset();
			u = u.elements;
			for(var i in u)
				if(u[i].name && a[u[i].name]) u[i].value = typeof a[u[i].name] == 'string' ? a[u[i].name] : " " ;
			Commom.toggleClass("updateform");
		});
	},
	list: function (p) {
		Commom.page = p;
		Commom.post("", "ajax/list.php?limit=" + Commom.limit + "&page=" + parseInt(p), Commom.listData);
	},
	post: function(params, url, callback) {
		var http = new XMLHttpRequest();
		http.open("POST", url, true);
		http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		http.onreadystatechange = function() {
		    if(http.readyState == 4 && http.status == 200) {
		        callback(http.responseText);
		    }
		}
		http.send(params);
	},
	buildForm: function(id) {
		var cf = Commom.fields;
		for(var i in cf){/*for while only support text input form*/
			var d = buildElement({e:"input", "attr":{"type":"text", placeholder:cf[i] + " ... ", "name":cf[i]}});
			document.getElementById(id).appendChild(d);
		}
		var b = buildElement({e:"button","attr":{className:"sendButton", "innerText":"Enviar"}});
		document.getElementById(id).appendChild(b);
		document.getElementById(id).appendChild(buildElement({e:"input","attr":{type:"hidden", "name":"id"}}));
	}
};
Commom.buildForm("fCreate");
Commom.buildForm("fUpdate");
var tc = document.querySelectorAll('.toggleCreate'),
tu = document.querySelectorAll('.toggleUpdate');
for(var i=0;i<tc.length;i++) tc[i].addEventListener('click', function(){Commom.toggleClass("createform")}, false);
for(var i=0;i<tu.length;i++) tu[i].addEventListener('click', function(){Commom.toggleClass("updateform")}, false);
document.getElementById('fCreate').addEventListener('submit', Commom.create, false);
document.getElementById('fUpdate').addEventListener('submit', Commom.update, false);
Commom.list(0);