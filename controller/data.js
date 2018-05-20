function get_data_and_show_in_table(name) {
    $.ajax({
        url: "./model/get_data.php",
        type: 'POST',
        dataType: 'JSON',
        cache:false,
        data: {'name':name},
        success: function (data) {
            if(data.length>0){
                data=JSON.parse(data.replace(/\\"/g,""));
                data=decrypt(data);
                llenar_tabla(data,name);
            }
        },
        error: function (data) {
            alerta('No existen datos','good');
        }
    });
}

function get_data_and_wait(name){
    var resultado="true";
    $.ajax({
        url: "./model/get_data.php",
        type: 'POST',
        dataType: 'JSON',
        async: false,
        cache:false,
        data: {'name':name},
        success: function (data) {
            if(data.length>0){
                data=JSON.parse(data.replace(/\\"/g,""));
                data=decrypt(data);
                resultado=data;
            }
            else {
                alerta('No existen datos','good');
            }
        },
        error: function (data) {
            alerta('Error 404','good');
        }
    });
    sleep(1);
    return resultado;
};

function sleep(seconds) {
    for (var i = 0; i >= seconds*100000; i--) {
        i=i+1;
        i=i-1;
    }
}

function set_data(name,datos,i) {
    if (i==undefined) {i=0;}
    $.ajax({
        url: "./model/set_data.php",
        type: 'POST',
        dataType: 'JSON',
        data: {'json':datos[i],'name':name, 'drop':i},
        cache:false,
        success: function (data) {
            if(i*1+1<=datos.length-1)
            set_data(name,datos,i*1+1)
            else
            alerta(data,'good');
        },
        error: function (data) {
            alerta(data,'bad');
        }
    });
}

function append_data(name,datos,i) {
    // console.log(datos)
    if (i==undefined) {i=0;}
    $.ajax({
        url: "./model/append_data.php",
        type: 'POST',
        dataType: 'JSON',
        data: {'json':datos[i],'name':name, 'drop':i},
        cache:false,
        success: function (data) {
            if(i*1+1<=datos.length-1)
            append_data(name,datos,i*1+1)
        },
        error: function (data) {
            alerta(data,'bad');
        }
    });
}

function alerta(msj,tipo) {
    $(".mensaje_alerta").css('display', 'block');
    var id='msj_ID_' + Math.random().toString(36).substr(2, 9);
    var mensaje='<li id="'+id+'">'+
        '<div class="type"><span class="'+(tipo=='good'?'ti-info-alt':'ti-alert')+'"></span></div>'+
        '<div class="text">'+
            '<label>'+msj+'</label>'+
        '</div>'
    '</li>';
    setTimeout(function(){$("#"+id).remove()}, 3000);
    $(".mensaje_alerta").append(mensaje);
}


function decrypt(data){
    data.forEach( function(element, index) {
        element.forEach( function(ele, id) {
            data[index][id]=atob(ele);
        });
    });
    return data;
}


function encrypt(data){
    data.forEach( function(element, index) {
        element.forEach( function(ele, id) {
            data[index][id]=btoa(ele);
        });
    });
    return data;
}

function logout(){
    $.ajax({
        url: 'logout.php',
        type: 'POST',
        dataType: 'JSON',
        data: jsn
    });
}

function validar_login(user,password){
    var salida=select_from(get_data_and_wait("usuarios"),[3,4],[user,password]);
    if (salida.indexOf("OK")>=0) {
        var param=get_data_and_wait("usuarios")[salida.substring(3,salida.length)*1];
        console.log(param)
        salida=select_from(get_data_and_wait("roles"),[0],[param[5]]);
        var roles=(get_data_and_wait("roles")[salida.substring(3,salida.length)*1]);
        console.log(roles)
        salida=select_from(get_data_and_wait("negocios"),[0],[param[6]]);
        var negocio=(get_data_and_wait("negocios")[salida.substring(3,salida.length)*1]);
        console.log(negocio)
        json={'n':param[0],'a':param[1],'i':param[2],'u':param[3],'r':param[5], 'r1':roles[1], 'r2':roles[2] , 'r3':roles[3], 'r4':roles[4] ,'e':param[6], 'e1':negocio[1],'c':param[7],'t':(param[8]=="Claro"?"false":"true"),'v':param[9]};
        $.ajax({
            url: 'user.php',
            type: 'POST',
            dataType: 'JSON',
            data: json
        });
    }
    else{
        alerta(salida);
    }
}

function select_from(array,filtros,values) {
    var bandera=0,salida;
    array.forEach( function(element, index) {
        bandera=0;
        if (bandera==0){
            filtros.forEach( function(number,i) {
                console.log(element[number].trim().toUpperCase(),values[i].trim().toUpperCase())
                if(element[number].trim().toUpperCase()==values[i].trim().toUpperCase()){
                    salida=index;
                    bandera++;
                }
            });
            if(bandera!=filtros.length)
                bandera=0;
        }
    });
    console.log(bandera)
    return (bandera==values.length ? "OK-"+salida+"": "No se encontraron los datos");
}