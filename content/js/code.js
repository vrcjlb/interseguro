function _handleError(err) {
  console.log("Falló el request "+err)
}

function autocomplete(inp) {
  var currentFocus
  inp.addEventListener("input", function(e) {
      let val=this.value
      if (val.length>=3)
      fetch("https://testsoat.interseguro.com.pe/talentfestapi/destinos/"+val)
      .then((response) => response.json())
      .then((json) => {
        destinos=json
        closeAllLists()
        currentFocus = -1
        a = document.createElement("DIV")
        a.setAttribute("id", this.id + "autocomplete-list")
        a.setAttribute("class", "autocomplete-items")
        this.parentNode.appendChild(a)
        for (i = 0; i < destinos.length; i++) {
          const b = document.createElement("DIV")
          let pos = destinos[i].toUpperCase().indexOf(val.toUpperCase())
          b.innerHTML = destinos[i].substr(0, pos)
          b.innerHTML += "<strong>" +destinos[i].substr(pos, val.length) + "</strong>"
          b.innerHTML += destinos[i].substr(val.length+pos)
          b.innerHTML += "<input type='hidden' value='" + destinos[i] + "'>"
              b.addEventListener("click", function(e) {
              inp.value = this.getElementsByTagName("input")[0].value
              closeAllLists()
          })
          a.appendChild(b)
        }
      })
      .catch((err) => _handleError(err)) 
  })
  inp.addEventListener("keydown", function(e) {
      var x = document.getElementById(this.id + "autocomplete-list")
      if (x) x = x.getElementsByTagName("div")
      if (e.keyCode == 40) {
        currentFocus++
        addActive(x)
      } else if (e.keyCode == 38) { //up
        currentFocus--
        addActive(x)
      } else if (e.keyCode == 13) {
        e.preventDefault()
        if (currentFocus > -1) {
          if (x) x[currentFocus].click()
        }
      }
  })
  function addActive(x) {
    if (!x) return false; 
    removeActive(x);
    if (currentFocus >= x.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = (x.length - 1); 
    x[currentFocus].classList.add("autocomplete-active");
  }
  function removeActive(x) { 
    for (var i = 0; i < x.length; i++) {
      x[i].classList.remove("autocomplete-active");
    }
  }
  function closeAllLists(elmnt) {
      var x = document.getElementsByClassName("autocomplete-items")
      for (var i = 0; i < x.length; i++) {
        if (elmnt != x[i] && elmnt != inp) {
        x[i].parentNode.removeChild(x[i])
      }
    }
  }
  document.addEventListener("click", function (e) {
      closeAllLists(e.target)
  })
}

autocomplete(document.getElementById("destino"))

function setMinDate(inputDate,date){
  if (date){
    var today = new Date(date)
    var dd = today.getDate()+1
    var mm = today.getMonth()+1 //January is 0!
    var yyyy = today.getFullYear()  
  }
  else{
    var today = new Date()
    var dd = today.getDate()
    var mm = today.getMonth()+1 //January is 0!
    var yyyy = today.getFullYear()
  }
   if(dd<10){
          dd='0'+dd
      } 
      if(mm<10){
          mm='0'+mm
      } 

  today = yyyy+'-'+mm+'-'+dd;
  inputDate.setAttribute("min", today);
}

setMinDate(document.getElementById("fecha_partida"))

function addEventHandler(elem, eventType, handler) {
    if (elem.addEventListener)
        elem.addEventListener (eventType, handler, false);
    else if (elem.attachEvent)
        elem.attachEvent ('on' + eventType, handler); 
}
  
addEventHandler(document, 'DOMContentLoaded', function() {
  addEventHandler(document.getElementById('volver'), 'click', function() {
      changeInterface(true)
  });
  addEventHandler(document.getElementById('fecha_partida'), 'change', function() {
      setMinDate(document.getElementById("fecha_retorno"),this.value)
  });
  addEventHandler(document.getElementById('btn_cotizar'),'click', function(event){
    let json={}
    let inputList = Array.prototype.slice.call(document.forms["form_cotizacion"].getElementsByTagName("input"))
    inputList.forEach(function(element) {
      json[element.id]=traerValor(element.value);
    }); 
    fetch('https://testsoat.interseguro.com.pe/talentfestapi/cotizacion', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(json)
    })
    .then((response)=>response.json())
    .then((respuesta) => {
      mostrarPlanes(respuesta)
    })
    .catch((err) => _handleError(err)) 
  })
})

const traerValor = (valor) => {
    var date = new Date(valor)
    if (date instanceof Date && !isNaN(date.valueOf()) && valor.includes("-")) {
      var day = date.getDate()<10?"0"+date.getDate():date.getDate()
      var month = (date.getMonth()+1)<10?"0"+(date.getMonth()+1):(date.getMonth()+1)
      var year = date.getFullYear()
      return (day+"/"+month+"/"+year)
    }
    else{
      return valor
    }
}
function changeInterface(tipe){
  document.getElementById("cotizador").style.display = tipe?'block':'none'
  document.getElementById("respuesta").style.display = tipe?'none':'block' 
  document.getElementsByClassName("PlansContainer")[0].innerHTML="" 
}

function mostrarPlanes(json) { 
  changeInterface(false);
  let caracteristica='<div class="PlansBenefits"><h5>Qué obtienes</h5><ul id="caracteristicas">'
  let plan="";
  json.forEach(function(jsonElement,jsonIndex) {
    incluye=`<div class="PlanColumn-row"><span class="ti-check"></span></div>`
    no_incluye=`<div class="PlanColumn-row"><span class="ti-close"></span></div>`
    plan+=`<div class="PlanColumn" id="${jsonElement.tipo_plan.replace(" ","_")}">`
      plan+=`<div class="PlanColumn-title">`
        plan+=`<h6>${jsonElement.tipo_plan}</h6>`
      plan+=`</div>`
      plan+=`<div class="PlanColumn-header"><div class="PlanColumn-details"><div class="PlanColumn-cost">`
        plan+=`<p>$ ${jsonElement.precio_plan}</p>`
      plan+=`</div></div></div>`
      jsonElement.caracteristicas.forEach((element, index)=>{
        if(element.aplica)
          plan+=incluye
        else
          plan+=no_incluye
        if (jsonIndex==0){
          caracteristica+=`<li>${element.caracteristica}</li>` 
        }
      })
      plan+=`<div class="PlanColumn-footer">`
        plan+=`<a href="#!" class="btn-green">Comprar</a>`
      plan+=`</div></div>`
  }); 
  caracteristica+='</ul></div>'
  plan=caracteristica+plan
  document.getElementsByClassName("PlansContainer")[0].innerHTML=plan;
}
