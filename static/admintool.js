function cl_date_docx(){
    let src=document.getElementById('rep').src;
    src=src.replace('html','docx');
    src=src.replace('pdf','docx');
    src=src.replace('xlsx','docx');
    document.getElementById('rep').src=src;
}
function cl_date_XLSx(){
    let src=document.getElementById('rep').src;
    src=src.replace('html','xlsx');
    src=src.replace('docx','xlsx');
    src=src.replace('pdf','xlsx');
    document.getElementById('rep').src=src;
}
function cl_date_PDF(){
    let src=document.getElementById('rep').src;
    src=src.replace('html','pdf');
    src=src.replace('docx','pdf');
    src=src.replace('xlsx','pdf');
    document.getElementById('rep').src=src;
}  
function Reports(){
    document.getElementById("reports").innerHTML='';
    html_str1='';
    html_str1+="<div class='row justify-content-center align-items-center text-center'>";
    html_str1+="<div class='col-4 mb-4'>";
    html_str1+="<button class='btn btn_funct btn-docx mt-4' type='button' onclick='cl_date_docx()'>DOCX</button>";
    html_str1+="</div>";
    html_str1+="<div class='col-4 mb-4'>";
    html_str1+="<button class='btn btn_funct mt-4 btn-xls' type='button' onclick='cl_date_XLSx()'>XLSx</button>";
    html_str1+="</div>";
    html_str1+="<div class='col-4 mb-4'>";
    html_str1+="<button class='btn btn_funct mt-4 btn-pdf' type='button' onclick='cl_date_PDF()'>PDF</button>";
    html_str1+="</div>";
    html_str1+="</div>";
    document.getElementById("reports").innerHTML=html_str1;
    var link = "http://26.173.145.160:8080/jasperserver/rest_v2/reports/reports/Site_2/analyze.html"; 
    var iframe = document.createElement('iframe');
    frameborder=0;
    iframe.width="100%";
    iframe.height=window.innerHeight*0.6;
    iframe.id="rep";
    iframe.setAttribute("src", link);
    document.getElementById("reports").appendChild(iframe);
}

function Zayavki(){
    document.getElementById("reports").innerHTML='';
    html_str1='';
    html_str1+="<div class='row justify-content-center align-items-center text-center'>";
    html_str1+="<div class='col-4 mb-4'>";
    html_str1+="<button class='btn btn_funct btn-docx mt-4' type='button' onclick='cl_date_docx()'>DOCX</button>";
    html_str1+="</div>";
    html_str1+="<div class='col-4 mb-4'>";
    html_str1+="<button class='btn btn_funct mt-4 btn-xls' type='button' onclick='cl_date_XLSx()'>XLSx</button>";
    html_str1+="</div>";
    html_str1+="<div class='col-4 mb-4'>";
    html_str1+="<button class='btn btn_funct mt-4 btn-pdf' type='button' onclick='cl_date_PDF()'>PDF</button>";
    html_str1+="</div>";
    html_str1+="</div>";
    document.getElementById("reports").innerHTML=html_str1;
    var link = "http://26.173.145.160:8080/jasperserver/rest_v2/reports/reports/Site_2/analyze.html"; 
    var iframe = document.createElement('iframe');
    frameborder=0;
    iframe.width="100%";
    iframe.height=window.innerHeight*0.7;
    iframe.id="rep";
    iframe.setAttribute("src", link);
    elem=document.getElementById("reports");
    elem.appendChild(iframe);

    html_str1=`<div class="row text-center">
                    <div class='col-12 col-lg-6 mt-5 formsinput'>
                        <span class='InputHead mb-2'>Название объекта</span>
                        <input class='form-control inputs mt-2' type='text' placeholder='' id='name_input'>
                    </div>
                    <div class='col-12 col-lg-6 mt-5 formsinput'>
                        <span class='InputHead mb-2'>Тип объекта&nbsp;</span>
                        <select class='form-control selects mt-2' id='type_input'>
                            <option value='1'>Памятник археологии</option>
                            <option value='2'>Памятник истории</option>
                            <option value='3'>Памятник градостроительства и архитектуры</option>
                            <option value='4'>Памятник искусства</option>
                            <option value='5'>Памятник религии</option>
                        </select>
                    </div>
                    <div class='col-12 col-lg-6 mt-5 formsinput'>
                        <span class='InputHead mb-2'>Значение объекта</span>
                        <select class='form-control selects mt-2' id='important_input'>
                            <option value='federal'>Федеральное</option>
                            <option value='regional'>Региональное</option>
                            <option value='municipalnie'>Муниципальное</option>
                            <option value='viyvlenie'>Выявленные</option>
                        </select>
                    </div>
                    <div class='col-12 col-lg-6 mt-5 formsinput'>
                        <span class='InputHead mb-2'>Cостояние объекта</span>
                        <select class='form-control selects mt-2' id='state_input'>
                        <option value='all'>все</option>
                        <option value='ud'>удовлетворительное</option>
                        <option value='neud'>неудовлетворительное</option>
                        <option value='utr'>утраченные</option>
                        </select>
                    </div>
                    <div class='col-12 col-lg-6 mt-5 formsinput'>
                        <span class='InputHead mb-2'>Регион</span>
                        <select class='form-control' id='region_select'>
                        </select>
                    </div>
                    <div class='col-12 col-lg-6 mt-5 formsinput'>
                        <span class='InputHead mb-2'>Адрес</span>
                        <input class='form-control inputs' type='text' placeholder='' id='adress_input'>
                    </div>
                    <div class='col-12 col-lg-6 mt-5 formsinput'>
                        <span class='InputHead mb-2'>Координаты объекта</span>
                        <div class='row'>
                            <div class='col-6'><input class='form-control inputs mt-2' type='number' placeholder='X' id='coordinatex_input'></div>
                            <div class='col-6'><input class='form-control inputs mt-2' type='number' placeholder='Y' id='coordinatey_input'></div>
                        </div>
                    </div>    
                    <div class='col-12 col-lg-6 mt-5 formsinput'>
                        <button class='btn btn_funct mt-4' type='button' onclick='toServer()'>Отправить</button>
                    </div>
                </div>`
    var ele=document.createElement("div");
    ele.setAttribute("class",'row justify-content-center align-items-center');
    elem.appendChild(ele).innerHTML = html_str1;
    $.ajax({
        url: "/select_diagrams"
    }).done(function (data) {
        select_data=JSON.parse(data);
        html_str='';
        for(let i=0; i<select_data.length; i++){
            $('#region_select').append("<option value="+select_data[i][0]+">"+select_data[i][1]+"</option>");
        }
    });
}
function toServer(){
    let name, type, importance, state, adress, x, y;
    name=document.getElementById('name_input').value;
    type=document.getElementById('type_input').value;
    var n = document.getElementById('important_input').options.selectedIndex;    
    importance = document.getElementById('important_input').options[n].value;
    adress=document.getElementById('adress_input').value;
    x=document.getElementById('coordinatex_input').value;
    y=document.getElementById('coordinatey_input').value;
    let coordinate=[x,y];
    n = document.getElementById('state_input').options.selectedIndex;    
    state = document.getElementById('state_input').options[n].value;
    $.ajax({
        url: "/update",
        data:{name, type, importance, state, adress,coordinate}
    }).done(function (data) {
        if (data=='success'){
            alert('Успешно!');
        }
    });
}