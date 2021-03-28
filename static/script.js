window.onload = function() {
    let availableScreenHeight = document.documentElement.scrollHeight;
    availableScreenHeight=availableScreenHeight*0.6;
    document.getElementById('mapcontainer').style.height=''+availableScreenHeight+'px';
}

ymaps.ready(init);

function init() {
    var myMap = new ymaps.Map('map', {
            center: [55.76, 37.64],
            zoom: 10,
            controls: []
        },{
            restrictMapArea: [
                [82.846852, 7.008449],
                [34.289117, -160.765292]
            ]
        }, {
            searchControlProvider: 'yandex#search'
        }),
        objectManager = new ymaps.ObjectManager({
            
            clusterize: true,
          
            gridSize: 64,
            
            clusterIconLayout: "default#pieChart"
        });
    myMap.geoObjects.add(objectManager);

    var listBoxItems1 = ['федеральное', 'муниципальное', 'региональное', 'выявленный']
            .map(function (title) {
                return new ymaps.control.ListBoxItem({
                    data: {
                        content: title
                    },
                    state: {
                        selected: true
                    }
                })
            }),
        reducer1 = function (filters, filter) {
            filters[filter.data.get('content')] = filter.isSelected();
            return filters;
        },
      
        listBoxControl1 = new ymaps.control.ListBox({
            data: {
                content: 'Значение',
                title: 'Значение'
            },
            items: listBoxItems1,
            state: {
              
                expanded: false,
                filters: listBoxItems1.reduce(reducer1, {})
            }
        });
    myMap.controls.add(listBoxControl1);

 
    listBoxControl1.events.add(['select', 'deselect'], function (e) {
        var listBoxItem = e.get('target');
        var filters = ymaps.util.extend({}, listBoxControl1.state.get('filters'));
        filters[listBoxItem.data.get('content')] = listBoxItem.isSelected();
        listBoxControl1.state.set('filters', filters);
    });

    var filterMonitor = new ymaps.Monitor(listBoxControl1.state);
    filterMonitor.add('filters', function (filters) {
      
        objectManager.setFilter(getFilterFunction1(filters));
    });

    function getFilterFunction1(categories) {
        return function (obj) {
            var content = obj.properties.hintContent;
            content=content.split("Значение: ");
            return categories[content[1]]
        }
    }

    var listBoxItems = ['Удовлетворительное','Неудовлетворительное', 'Утраченный', 'N/A']
            .map(function (title) {
                return new ymaps.control.ListBoxItem({
                    data: {
                        content: title
                    },
                    state: {
                        selected: true
                    }
                })
            }),
        reducer = function (filters, filter) {
            filters[filter.data.get('content')] = filter.isSelected();
            return filters;
        },
        
        listBoxControl = new ymaps.control.ListBox({
            data: {
                content: 'Состояние',
                title: 'Состояние'
            },
            items: listBoxItems,
            state: {
                
                expanded: false,
                filters: listBoxItems.reduce(reducer, {})
            }
        });
    myMap.controls.add(listBoxControl);


    listBoxControl.events.add(['select', 'deselect'], function (e) {
        var listBoxItem = e.get('target');
        var filters = ymaps.util.extend({}, listBoxControl.state.get('filters'));
        filters[listBoxItem.data.get('content')] = listBoxItem.isSelected();
        listBoxControl.state.set('filters', filters);
    });

    var filterMonitor = new ymaps.Monitor(listBoxControl.state);
    filterMonitor.add('filters', function (filters) {
      
        objectManager.setFilter(getFilterFunction(filters));
    });

    function getFilterFunction(categories) {
        return function (obj) {
            var content = obj.properties.balloonContentFooter;
            content=content.split("Состояние культурного объекта: <br/>");
            return categories[content[1]]
        }
    }
   $.ajax({
        url: "/get_baloons"
    }).done(function (data) {
        objectManager.add(data);
    });
}

function ShowDiagrams(){
    console.log(document.getElementById('buttonImage').src);
    if(document.getElementById('buttonImage').src=="https://cdn.discordapp.com/attachments/783709006258503691/824990354503630858/add-plus-button.png"){
        document.getElementById('buttonImage').src="https://cdn.discordapp.com/attachments/783709006258503691/824990351797256222/clear-button.png";
        document.getElementById('diagrams').style.display='block';
        html_str='';
        html_str=   `<div class='row' id='diagramsContent'>
                        <div class='col-6 col-lg-3'>
                            <span>Регионы</span>
                            <select class='form-control' id='region_select'>
                                <option value='all'>все</option>
                            </select>
                        </div>
                        <div class='col-6 col-lg-3'>
                            <span>Значениe ОКН</span>
                            <select class='form-control' id='important_select'>
                                <option value='all'>все</option>
                                <option value='federal'>Федеральное</option>
                                <option value='regional'>Региональное</option>
                                <option value='municipalnie'>Муниципальное</option>
                                <option value='viyvlenie'>Выявленные</option>
                            </select>
                        </div>
                        <div class='col-6 col-lg-3'>
                            <span>Cостояние ОКН</span>
                            <select class='form-control' id='state_select'>
                                <option value='all'>все</option>
                                <option value='ud'>удовлетворительное</option>
                                <option value='neud'>неудовлетворительное</option>
                                <option value='utr'>утраченные</option>
                                <option value='na'>N/A</option>
                            </select>
                        </div>
                        <div class='col-6 col-lg-3'>
                        <button class="btnF btnFiltr" onclick='drawDiagrams()'>Применить фильтры</button>
                        </div>
                        <div class='col-12'>
                            <div id="charts"></div>
                        </div>
                    </div>`;
        document.getElementById('diagrams').innerHTML=html_str;
        //drawAll();
        $.ajax({
            url: "/select_diagrams"
        }).done(function (data) {
            select_data=JSON.parse(data);
            html_str='';
            for(let i=0; i<select_data.length; i++){
                $('#region_select').append("<option value="+select_data[i][0]+">"+select_data[i][1]+"</option>");
            }
            drawDiagrams();
        });
    }else{
        document.getElementById('buttonImage').src="https://cdn.discordapp.com/attachments/783709006258503691/824990354503630858/add-plus-button.png";
        document.getElementById('diagrams').innerHTML='';
        document.getElementById('diagrams').style.display='none';
    }
}

function drawDiagrams(){
    var n = document.getElementById('region_select').options.selectedIndex;    
    region_temp = document.getElementById('region_select').options[n].value;
    n = document.getElementById('important_select').options.selectedIndex;    
    important_temp = document.getElementById('important_select').options[n].value;
    n = document.getElementById('state_select').options.selectedIndex;    
    state_temp = document.getElementById('state_select').options[n].value;
    $.ajax({
        url: "/diagrams",
        data:{regions: region_temp,cult_value: important_temp,state:state_temp}
    }).done(function (data) {
        data = JSON.parse(data);
        if(region_temp=='all'&&important_temp=='all'&&state_temp=='all'){ /**все регионы, все значения, все состояния */
            drawAll(data);
        }else{
            if(region_temp!='all'&&important_temp=='all'&&state_temp=='all'){ /**1 регион, все значения, все состояния */
                drawReg(data);
            }else{
                if(region_temp!='all'&&important_temp!='all'&&state_temp=='all'){ /**1 регион, 1 значение, все состояния */
                    drawRegImp(data);
                }else{
                    if(region_temp!='all'&&important_temp=='all'&&state_temp!='all'){ /**1 регион, все значения, 1 состояние */
                        drawRegSt(data);
                    }else{
                        if(region_temp=='all'&&important_temp!='all'&&state_temp=='all'){ /**все регионы, 1 значение, все состояния */
                            drawImp(data);
                        }else{
                            if(region_temp=='all'&&important_temp!='all'&&state_temp!='all'){ /**все регионы, 1 значение, 1 состояние */
                                drawImpSt(data);
                            }else{
                                if(region_temp=='all'&&important_temp=='all'&&state_temp!='all'){ /**все регионы, все значение, 1 состояние */
                                    drawSt(data);
                                }else{                                                              /**1 регион, 1 значение, 1 состояние */
                                    drawRegImpSt(data);
                                } 
                            }
                        }  
                    }
                }
            }
        }
    });
}
/**все регионы, все значения, все состояния */
function drawAll(dataAll){
    
    document.getElementById('charts').innerHTML=`<div id="carouselExampleIndicators" class="carousel slide" data-ride="carousel">
    <ol class="carousel-indicators">
      <li data-target="#carouselExampleIndicators" data-slide-to="0" class="active"></li>
      <li data-target="#carouselExampleIndicators" data-slide-to="1"></li>
      <li data-target="#carouselExampleIndicators" data-slide-to="2"></li>
      <li data-target="#carouselExampleIndicators" data-slide-to="3"></li>
      <li data-target="#carouselExampleIndicators" data-slide-to="4"></li>
      <li data-target="#carouselExampleIndicators" data-slide-to="5"></li>
      <li data-target="#carouselExampleIndicators" data-slide-to="6"></li>
      <li data-target="#carouselExampleIndicators" data-slide-to="7"></li>
      <li data-target="#carouselExampleIndicators" data-slide-to="8"></li>
      <li data-target="#carouselExampleIndicators" data-slide-to="9"></li>
      <li data-target="#carouselExampleIndicators" data-slide-to="10"></li>
      <li data-target="#carouselExampleIndicators" data-slide-to="11"></li>
      <li data-target="#carouselExampleIndicators" data-slide-to="12"></li>
      <li data-target="#carouselExampleIndicators" data-slide-to="13"></li>
      <li data-target="#carouselExampleIndicators" data-slide-to="14"></li>
      <li data-target="#carouselExampleIndicators" data-slide-to="15"></li>
      <li data-target="#carouselExampleIndicators" data-slide-to="16"></li>
    </ol>
    <div class="carousel-inner">
      <div class="carousel-item active">
        <div class='d-block w-100 chart' id='chartdiv0'></div>
      </div>
      <div class="carousel-item">
      <div class='d-block w-100 chart' id='chartdiv1'></div>
      </div>
      <div class="carousel-item">
      <div class='d-block w-100 chart' id='chartdiv2'></div>
      </div>
      <div class="carousel-item">
      <div class='d-block w-100 chart' id='chartdiv3'></div>
      </div>
      <div class="carousel-item">
      <div class='d-block w-100 chart' id='chartdiv4'></div>
      </div>
      <div class="carousel-item">
      <div class='d-block w-100 chart' id='chartdiv5'></div>
      </div>
      <div class="carousel-item">
      <div class='d-block w-100 chart' id='chartdiv6'></div>
      </div>
      <div class="carousel-item">
      <div class='d-block w-100 chart' id='chartdiv7'></div>
      </div>
      <div class="carousel-item">
      <div class='d-block w-100 chart' id='chartdiv8'></div>
      </div>
      <div class="carousel-item">
      <div class='d-block w-100 chart' id='chartdiv9'></div>
      </div>
      <div class="carousel-item">
      <div class='d-block w-100 chart' id='chartdiv10'></div>
      </div>
      <div class="carousel-item">
      <div class='d-block w-100 chart' id='chartdiv11'></div>
      </div>
      <div class="carousel-item">
      <div class='d-block w-100 chart' id='chartdiv12'></div>
      </div>
      <div class="carousel-item">
      <div class='d-block w-100 chart' id='chartdiv13'></div>
      </div>
      <div class="carousel-item">
      <div class='d-block w-100 chart' id='chartdiv14'></div>
      </div>
      <div class="carousel-item">
      <div class='d-block w-100 chart' id='chartdiv15'></div>
      </div>
      <div class="carousel-item">
      <div class='d-block w-100 chart' id='chartdiv16'></div>
      </div>
    </div>
    <a class="carousel-control-prev" href="#carouselExampleIndicators" role="button" data-slide="prev">
      <span class="carousel-control-prev-icon" aria-hidden="true"></span>
      <span class="sr-only">Previous</span>
    </a>
    <a class="carousel-control-next" href="#carouselExampleIndicators" role="button" data-slide="next">
      <span class="carousel-control-next-icon" aria-hidden="true"></span>
      <span class="sr-only">Next</span>
    </a>
  </div>`;
       try{
        document.getElementById('chartdivS').innerHTML='';}
    catch{}

    let data= new Array(9);
    for (i=0; i<17; i++){
        data[i]=[];
    }
    for (let i=0; i<17; i++){
        for (let j=0; j<5; j++){
            data[i][j]=dataAll[i*5+j];
        }
    }
    am4core.ready(function() {
        
        // Themes begin
        am4core.useTheme(am4themes_material);
        am4core.useTheme(am4themes_animated);
        // Themes end
        let chart=[];
        for (let i=0; i<17; i++){
        chart[i] = am4core.create('chartdiv'+i+'', am4charts.XYChart)
        chart[i].colors.step = 2;
        
        chart[i].legend = new am4charts.Legend()
        chart[i].legend.position = 'top'
        chart[i].legend.paddingBottom = 20
        chart[i].legend.labels.template.maxWidth = 95
        
        var xAxis = chart[i].xAxes.push(new am4charts.CategoryAxis())
        xAxis.dataFields.category = 'category'
        xAxis.renderer.cellStartLocation = 0.1
        xAxis.renderer.cellEndLocation = 0.9
        xAxis.renderer.grid.template.location = 0;
        
        var yAxis = chart[i].yAxes.push(new am4charts.ValueAxis());
        yAxis.min = 0;
        
        function createSeries(value, name) {
            var series = chart[i].series.push(new am4charts.ColumnSeries())
            series.dataFields.valueY = value
            series.dataFields.categoryX = 'category'
            series.name = name
        
            series.events.on("hidden", arrangeColumns);
            series.events.on("shown", arrangeColumns);
        
            var bullet = series.bullets.push(new am4charts.LabelBullet())
            bullet.interactionsEnabled = false
            bullet.dy = 30;
            bullet.label.text = '{valueY}'
            bullet.label.fill = am4core.color('#ffffff')
        
            return series;
        }
        
        chart[i].data = data[i];        
        
        createSeries('first', 'Федеральное значение');
        createSeries('second', 'Региональное значение');
        createSeries('third', 'Муниципальное значение');
        createSeries('fourth', 'Выявленные');
        
        function arrangeColumns() {
        
            var series = chart[i].series.getIndex(0);
        
            var w = 1 - xAxis.renderer.cellStartLocation - (1 - xAxis.renderer.cellEndLocation);
            if (series.dataItems.length > 1) {
                var x0 = xAxis.getX(series.dataItems.getIndex(0), "categoryX");
                var x1 = xAxis.getX(series.dataItems.getIndex(1), "categoryX");
                var delta = ((x1 - x0) / chart[i].series.length) * w;
                if (am4core.isNumber(delta)) {
                    var middle = chart[i].series.length / 2;
        
                    var newIndex = 0;
                    chart[i].series.each(function(series) {
                        if (!series.isHidden && !series.isHiding) {
                            series.dummyData = newIndex;
                            newIndex++;
                        }
                        else {
                            series.dummyData = chart[i].series.indexOf(series);
                        }
                    })
                    var visibleCount = newIndex;
                    var newMiddle = visibleCount / 2;
        
                    chart[i].series.each(function(series) {
                        var trueIndex = chart[i].series.indexOf(series);
                        var newIndex = series.dummyData;
        
                        var dx = (newIndex - trueIndex + middle - newMiddle) * delta
        
                        series.animate({ property: "dx", to: dx }, series.interpolationDuration, series.interpolationEasing);
                        series.bulletsContainer.animate({ property: "dx", to: dx }, series.interpolationDuration, series.interpolationEasing);
                    })
                }
            }
         }
        }        
    });



    var n = document.getElementById('region_select').options.selectedIndex;    
    region_temp = document.getElementById('region_select').options[n].value;
    n = document.getElementById('important_select').options.selectedIndex;    
    important_temp = document.getElementById('important_select').options[n].value;
    n = document.getElementById('state_select').options.selectedIndex;    
    state_temp = document.getElementById('state_select').options[n].value;

    $.ajax({
        url: "/diagrams2",
        data:{regions: region_temp,cult_value: important_temp,state:state_temp}
    }).done(function (data) {
        data=JSON.parse(data)
        drawAllSecond(data);
    });
}
    function drawAllSecond(dataAll){

        var div = document.createElement("div");
        div.setAttribute("class", "col-12");
        div.innerHTML='<div id="chartdivS"></div>';
        document.getElementById('diagramsContent').appendChild(div);
        document.getElementById('chartdivS').innerHTML=`<div id="carouselExampleIndicators" class="carousel slide" data-ride="carousel">
                <ol class="carousel-indicators">
                <li data-target="#carouselExampleIndicators" data-slide-to="0" class="active"></li>
                <li data-target="#carouselExampleIndicators" data-slide-to="1"></li>
                <li data-target="#carouselExampleIndicators" data-slide-to="2"></li>
                <li data-target="#carouselExampleIndicators" data-slide-to="3"></li>
                <li data-target="#carouselExampleIndicators" data-slide-to="4"></li>
                <li data-target="#carouselExampleIndicators" data-slide-to="5"></li>
                <li data-target="#carouselExampleIndicators" data-slide-to="6"></li>
                <li data-target="#carouselExampleIndicators" data-slide-to="7"></li>
                <li data-target="#carouselExampleIndicators" data-slide-to="8"></li>
                <li data-target="#carouselExampleIndicators" data-slide-to="9"></li>
                <li data-target="#carouselExampleIndicators" data-slide-to="10"></li>
                <li data-target="#carouselExampleIndicators" data-slide-to="11"></li>
                <li data-target="#carouselExampleIndicators" data-slide-to="12"></li>
                <li data-target="#carouselExampleIndicators" data-slide-to="13"></li>
                <li data-target="#carouselExampleIndicators" data-slide-to="14"></li>
                <li data-target="#carouselExampleIndicators" data-slide-to="15"></li>
                <li data-target="#carouselExampleIndicators" data-slide-to="16"></li>
                </ol>
                <div class="carousel-inner">
                <div class="carousel-item active">
                    <div class='d-block w-100 chart' id='chartdiv0'></div>
                </div>
                <div class="carousel-item">
                <div class='d-block w-100 chart' id='chartdivs1'></div>
                </div>
                <div class="carousel-item">
                <div class='d-block w-100 chart' id='chartdivs2'></div>
                </div>
                <div class="carousel-item">
                <div class='d-block w-100 chart' id='chartdivs3'></div>
                </div>
                <div class="carousel-item">
                <div class='d-block w-100 chart' id='chartdivs4'></div>
                </div>
                <div class="carousel-item">
                <div class='d-block w-100 chart' id='chartdivs5'></div>
                </div>
                <div class="carousel-item">
                <div class='d-block w-100 chart' id='chartdivs6'></div>
                </div>
                <div class="carousel-item">
                <div class='d-block w-100 chart' id='chartdivs7'></div>
                </div>
                <div class="carousel-item">
                <div class='d-block w-100 chart' id='chartdivs8'></div>
                </div>
                <div class="carousel-item">
                <div class='d-block w-100 chart' id='chartdivs9'></div>
                </div>
                <div class="carousel-item">
                <div class='d-block w-100 chart' id='chartdivs10'></div>
                </div>
                <div class="carousel-item">
                <div class='d-block w-100 chart' id='chartdivs11'></div>
                </div>
                <div class="carousel-item">
                <div class='d-block w-100 chart' id='chartdivs12'></div>
                </div>
                <div class="carousel-item">
                <div class='d-block w-100 chart' id='chartdivs13'></div>
                </div>
                <div class="carousel-item">
                <div class='d-block w-100 chart' id='chartdivs14'></div>
                </div>
                <div class="carousel-item">
                <div class='d-block w-100 chart' id='chartdivs15'></div>
                </div>
                <div class="carousel-item">
                <div class='d-block w-100 chart' id='chartdivs16'></div>
                </div>
                </div>
                <a class="carousel-control-prev" href="#carouselExampleIndicators" role="button" data-slide="prev">
                <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                <span class="sr-only">Previous</span>
                </a>
                <a class="carousel-control-next" href="#carouselExampleIndicators" role="button" data-slide="next">
                <span class="carousel-control-next-icon" aria-hidden="true"></span>
                <span class="sr-only">Next</span>
                </a>
            </div>`;
   
    let data= new Array(9);
    for (i=0; i<17; i++){
        data[i]=[];
    }
    for (let i=0; i<17; i++){
        for (let j=0; j<5; j++){
            data[i][j]=dataAll[i*5+j];
        }
    }
    am4core.ready(function() {
        
        // Themes begin
        am4core.useTheme(am4themes_material);
        am4core.useTheme(am4themes_animated);
        // Themes end
        let chart=[];
        for (let i=0; i<17; i++){
        chart[i] = am4core.create('chartdiv'+i+'', am4charts.XYChart)
        chart[i].colors.step = 2;
        
        chart[i].legend = new am4charts.Legend()
        chart[i].legend.position = 'top'
        chart[i].legend.paddingBottom = 20
        chart[i].legend.labels.template.maxWidth = 95
        
        var xAxis = chart[i].xAxes.push(new am4charts.CategoryAxis())
        xAxis.dataFields.category = 'category'
        xAxis.renderer.cellStartLocation = 0.1
        xAxis.renderer.cellEndLocation = 0.9
        xAxis.renderer.grid.template.location = 0;
        
        var yAxis = chart[i].yAxes.push(new am4charts.ValueAxis());
        yAxis.min = 0;
        
        function createSeries(value, name) {
            var series = chart[i].series.push(new am4charts.ColumnSeries())
            series.dataFields.valueY = value
            series.dataFields.categoryX = 'category'
            series.name = name
        
            series.events.on("hidden", arrangeColumns);
            series.events.on("shown", arrangeColumns);
        
            var bullet = series.bullets.push(new am4charts.LabelBullet())
            bullet.interactionsEnabled = false
            bullet.dy = 30;
            bullet.label.text = '{valueY}'
            bullet.label.fill = am4core.color('#ffffff')
        
            return series;
        }
        
        chart[i].data = data[i];        
        
        createSeries('first', 'Удовлетворительное состояние');
        createSeries('second', 'Неуловлетворительное состояние');
        createSeries('third', 'Утраченные');
        createSeries('fourth', 'N/A');
        
        function arrangeColumns() {
        
            var series = chart[i].series.getIndex(0);
        
            var w = 1 - xAxis.renderer.cellStartLocation - (1 - xAxis.renderer.cellEndLocation);
            if (series.dataItems.length > 1) {
                var x0 = xAxis.getX(series.dataItems.getIndex(0), "categoryX");
                var x1 = xAxis.getX(series.dataItems.getIndex(1), "categoryX");
                var delta = ((x1 - x0) / chart[i].series.length) * w;
                if (am4core.isNumber(delta)) {
                    var middle = chart[i].series.length / 2;
        
                    var newIndex = 0;
                    chart[i].series.each(function(series) {
                        if (!series.isHidden && !series.isHiding) {
                            series.dummyData = newIndex;
                            newIndex++;
                        }
                        else {
                            series.dummyData = chart[i].series.indexOf(series);
                        }
                    })
                    var visibleCount = newIndex;
                    var newMiddle = visibleCount / 2;
        
                    chart[i].series.each(function(series) {
                        var trueIndex = chart[i].series.indexOf(series);
                        var newIndex = series.dummyData;
        
                        var dx = (newIndex - trueIndex + middle - newMiddle) * delta
        
                        series.animate({ property: "dx", to: dx }, series.interpolationDuration, series.interpolationEasing);
                        series.bulletsContainer.animate({ property: "dx", to: dx }, series.interpolationDuration, series.interpolationEasing);
                    })
                }
            }
         }
        }        
    });

    }

/**1 регион, все значения, все состояния */
function drawReg(data){

    document.getElementById('charts').innerHTML=`<div class='chartdiv'></div>`;
    try{
        document.getElementById('chartdivS').innerHTML='';}
    catch{}
    am4core.ready(function() {

        
        // Themes begin
        am4core.useTheme(am4themes_material);
        am4core.useTheme(am4themes_animated);
        // Themes end
                
        var chart = am4core.create('chartdiv', am4charts.XYChart)
        chart.colors.step = 2;
        
        chart.legend = new am4charts.Legend()
        chart.legend.position = 'top'
        chart.legend.paddingBottom = 20
        chart.legend.labels.template.maxWidth = 95
        
        var xAxis = chart.xAxes.push(new am4charts.CategoryAxis())
        xAxis.dataFields.category = 'category'
        xAxis.renderer.cellStartLocation = 0.1
        xAxis.renderer.cellEndLocation = 0.9
        xAxis.renderer.grid.template.location = 0;
        
        var yAxis = chart.yAxes.push(new am4charts.ValueAxis());
        yAxis.min = 0;
        
        function createSeries(value, name) {
            var series = chart.series.push(new am4charts.ColumnSeries())
            series.dataFields.valueY = value
            series.dataFields.categoryX = 'category'
            series.name = name
        
            series.events.on("hidden", arrangeColumns);
            series.events.on("shown", arrangeColumns);
        
            var bullet = series.bullets.push(new am4charts.LabelBullet())
            bullet.interactionsEnabled = false
            bullet.dy = 30;
            bullet.label.text = '{valueY}'
            bullet.label.fill = am4core.color('#ffffff')
        
            return series;
        }
        
        chart.data = data;
       
        createSeries('first', 'Удовлетворительное состояние');
        createSeries('second', 'Неуловлетворительное состояние');
        createSeries('third', 'Утраченные');
        createSeries('fourth', 'N/A');
        
        function arrangeColumns() {
        
            var series = chart.series.getIndex(0);
        
            var w = 1 - xAxis.renderer.cellStartLocation - (1 - xAxis.renderer.cellEndLocation);
            if (series.dataItems.length > 1) {
                var x0 = xAxis.getX(series.dataItems.getIndex(0), "categoryX");
                var x1 = xAxis.getX(series.dataItems.getIndex(1), "categoryX");
                var delta = ((x1 - x0) / chart.series.length) * w;
                if (am4core.isNumber(delta)) {
                    var middle = chart.series.length / 2;
        
                    var newIndex = 0;
                    chart.series.each(function(series) {
                        if (!series.isHidden && !series.isHiding) {
                            series.dummyData = newIndex;
                            newIndex++;
                        }
                        else {
                            series.dummyData = chart.series.indexOf(series);
                        }
                    })
                    var visibleCount = newIndex;
                    var newMiddle = visibleCount / 2;
        
                    chart.series.each(function(series) {
                        var trueIndex = chart.series.indexOf(series);
                        var newIndex = series.dummyData;
        
                        var dx = (newIndex - trueIndex + middle - newMiddle) * delta
        
                        series.animate({ property: "dx", to: dx }, series.interpolationDuration, series.interpolationEasing);
                        series.bulletsContainer.animate({ property: "dx", to: dx }, series.interpolationDuration, series.interpolationEasing);
                    })
                }
            }
        }
        
    });
}
/**1 регион, 1 значение, все состояния */
function drawRegImp(data){
    document.getElementById('charts').innerHTML=`<div class='chartdiv'></div>`;
    try{
        document.getElementById('chartdivS').innerHTML='';}
    catch{}
    am4core.ready(function() {

        // Themes begin
        am4core.useTheme(am4themes_material);
        am4core.useTheme(am4themes_animated);
        // Themes end
        
        // Create chart instance
        var chart = am4core.create("chartdiv", am4charts.PieChart);
        
        // Add data
        chart.data = data;
        
        // Add and configure Series
        var pieSeries = chart.series.push(new am4charts.PieSeries());
        pieSeries.dataFields.value = "value";
        pieSeries.dataFields.category = "state";
        pieSeries.slices.template.stroke = am4core.color("#fff");
        pieSeries.slices.template.strokeOpacity = 1;
        
        // This creates initial animation
        pieSeries.hiddenState.properties.opacity = 1;
        pieSeries.hiddenState.properties.endAngle = -90;
        pieSeries.hiddenState.properties.startAngle = -90;
        
        chart.hiddenState.properties.radius = am4core.percent(0);
        
        
        });

}
/**1 регион, все значения, 1 состояние */
function drawRegSt(data){
    document.getElementById('charts').innerHTML=`<div class='chartdiv'></div>`;
    try{
        document.getElementById('chartdivS').innerHTML='';}
    catch{}
    am4core.ready(function() {

        // Themes begin
        am4core.useTheme(am4themes_material);
        am4core.useTheme(am4themes_animated);
        // Themes end
        
        // Create chart instance
        var chart = am4core.create("chartdiv", am4charts.PieChart);
        
        // Add data
        chart.data = data;

        // Add and configure Series
        var pieSeries = chart.series.push(new am4charts.PieSeries());
        pieSeries.dataFields.value = "value";
        pieSeries.dataFields.category = "importance";
        pieSeries.slices.template.stroke = am4core.color("#fff");
        pieSeries.slices.template.strokeOpacity = 1;
        
        // This creates initial animation
        pieSeries.hiddenState.properties.opacity = 1;
        pieSeries.hiddenState.properties.endAngle = -90;
        pieSeries.hiddenState.properties.startAngle = -90;
        
        chart.hiddenState.properties.radius = am4core.percent(0);
        
        });
}
/**все регионы, 1 значение, все состояния */
function drawImp(dataAll){
    document.getElementById('charts').innerHTML=`<div id="carouselExampleIndicators" class="carousel slide" data-ride="carousel">
    <ol class="carousel-indicators">
    <li data-target="#carouselExampleIndicators" data-slide-to="0" class="active"></li>
    <li data-target="#carouselExampleIndicators" data-slide-to="1"></li>
    <li data-target="#carouselExampleIndicators" data-slide-to="2"></li>
    <li data-target="#carouselExampleIndicators" data-slide-to="3"></li>
    <li data-target="#carouselExampleIndicators" data-slide-to="4"></li>
    <li data-target="#carouselExampleIndicators" data-slide-to="5"></li>
    <li data-target="#carouselExampleIndicators" data-slide-to="6"></li>
    <li data-target="#carouselExampleIndicators" data-slide-to="7"></li>
    <li data-target="#carouselExampleIndicators" data-slide-to="8"></li>
    <li data-target="#carouselExampleIndicators" data-slide-to="9"></li>
    <li data-target="#carouselExampleIndicators" data-slide-to="10"></li>
    <li data-target="#carouselExampleIndicators" data-slide-to="11"></li>
    <li data-target="#carouselExampleIndicators" data-slide-to="12"></li>
    <li data-target="#carouselExampleIndicators" data-slide-to="13"></li>
    <li data-target="#carouselExampleIndicators" data-slide-to="14"></li>
    <li data-target="#carouselExampleIndicators" data-slide-to="15"></li>
    <li data-target="#carouselExampleIndicators" data-slide-to="16"></li>
    </ol>
    <div class="carousel-inner">
      <div class="carousel-item active">
        <div class='d-block w-100 chart' id='chartdiv0'></div>
      </div>
      <div class="carousel-item">
      <div class='d-block w-100 chart' id='chartdiv1'></div>
      </div>
      <div class="carousel-item">
      <div class='d-block w-100 chart' id='chartdiv2'></div>
      </div>
      <div class="carousel-item">
      <div class='d-block w-100 chart' id='chartdiv3'></div>
      </div>
      <div class="carousel-item">
      <div class='d-block w-100 chart' id='chartdiv4'></div>
      </div>
      <div class="carousel-item">
      <div class='d-block w-100 chart' id='chartdiv5'></div>
      </div>
      <div class="carousel-item">
      <div class='d-block w-100 chart' id='chartdiv6'></div>
      </div>
      <div class="carousel-item">
      <div class='d-block w-100 chart' id='chartdiv7'></div>
      </div>
      <div class="carousel-item">
      <div class='d-block w-100 chart' id='chartdiv8'></div>
      </div>
      <div class="carousel-item">
      <div class='d-block w-100 chart' id='chartdiv9'></div>
      </div>
      <div class="carousel-item">
      <div class='d-block w-100 chart' id='chartdiv10'></div>
      </div>
      <div class="carousel-item">
      <div class='d-block w-100 chart' id='chartdiv11'></div>
      </div>
      <div class="carousel-item">
      <div class='d-block w-100 chart' id='chartdiv12'></div>
      </div>
      <div class="carousel-item">
      <div class='d-block w-100 chart' id='chartdiv13'></div>
      </div>
      <div class="carousel-item">
      <div class='d-block w-100 chart' id='chartdiv14'></div>
      </div>
      <div class="carousel-item">
      <div class='d-block w-100 chart' id='chartdiv15'></div>
      </div>
      <div class="carousel-item">
      <div class='d-block w-100 chart' id='chartdiv16'></div>
      </div>
    </div>
    <a class="carousel-control-prev" href="#carouselExampleIndicators" role="button" data-slide="prev">
      <span class="carousel-control-prev-icon" aria-hidden="true"></span>
      <span class="sr-only">Previous</span>
    </a>
    <a class="carousel-control-next" href="#carouselExampleIndicators" role="button" data-slide="next">
      <span class="carousel-control-next-icon" aria-hidden="true"></span>
      <span class="sr-only">Next</span>
    </a>
  </div>`;
       try{
        document.getElementById('chartdivS').innerHTML='';}
    catch{}

    let data= new Array(9);
    for (i=0; i<17; i++){
        data[i]=[];
    }
    for (let i=0; i<17; i++){
        for (let j=0; j<5; j++){
            data[i][j]=dataAll[i*5+j];
        }
    }
    am4core.ready(function() {
        
        // Themes begin
        am4core.useTheme(am4themes_material);
        am4core.useTheme(am4themes_animated);
        // Themes end
        let chart=[];
        for (let i=0; i<17; i++){
        chart[i] = am4core.create('chartdiv'+i+'', am4charts.XYChart)
        chart[i].colors.step = 2;
        
        chart[i].legend = new am4charts.Legend()
        chart[i].legend.position = 'top'
        chart[i].legend.paddingBottom = 20
        chart[i].legend.labels.template.maxWidth = 95
        
        var xAxis = chart[i].xAxes.push(new am4charts.CategoryAxis())
        xAxis.dataFields.category = 'category'
        xAxis.renderer.cellStartLocation = 0.1
        xAxis.renderer.cellEndLocation = 0.9
        xAxis.renderer.grid.template.location = 0;
        
        var yAxis = chart[i].yAxes.push(new am4charts.ValueAxis());
        yAxis.min = 0;
        
        function createSeries(value, name) {
            var series = chart[i].series.push(new am4charts.ColumnSeries())
            series.dataFields.valueY = value
            series.dataFields.categoryX = 'category'
            series.name = name
        
            series.events.on("hidden", arrangeColumns);
            series.events.on("shown", arrangeColumns);
        
            var bullet = series.bullets.push(new am4charts.LabelBullet())
            bullet.interactionsEnabled = false
            bullet.dy = 30;
            bullet.label.text = '{valueY}'
            bullet.label.fill = am4core.color('#ffffff')
        
            return series;
        }
        
        chart[i].data = data[i];        
        
        createSeries('first', 'Удовлетворительное состояние');
        createSeries('second', 'Неуловлетворительное состояние');
        createSeries('third', 'Утраченные');
        createSeries('fourth', 'N/A');
        
        function arrangeColumns() {
        
            var series = chart[i].series.getIndex(0);
        
            var w = 1 - xAxis.renderer.cellStartLocation - (1 - xAxis.renderer.cellEndLocation);
            if (series.dataItems.length > 1) {
                var x0 = xAxis.getX(series.dataItems.getIndex(0), "categoryX");
                var x1 = xAxis.getX(series.dataItems.getIndex(1), "categoryX");
                var delta = ((x1 - x0) / chart[i].series.length) * w;
                if (am4core.isNumber(delta)) {
                    var middle = chart[i].series.length / 2;
        
                    var newIndex = 0;
                    chart[i].series.each(function(series) {
                        if (!series.isHidden && !series.isHiding) {
                            series.dummyData = newIndex;
                            newIndex++;
                        }
                        else {
                            series.dummyData = chart[i].series.indexOf(series);
                        }
                    })
                    var visibleCount = newIndex;
                    var newMiddle = visibleCount / 2;
        
                    chart[i].series.each(function(series) {
                        var trueIndex = chart[i].series.indexOf(series);
                        var newIndex = series.dummyData;
        
                        var dx = (newIndex - trueIndex + middle - newMiddle) * delta
        
                        series.animate({ property: "dx", to: dx }, series.interpolationDuration, series.interpolationEasing);
                        series.bulletsContainer.animate({ property: "dx", to: dx }, series.interpolationDuration, series.interpolationEasing);
                    })
                }
            }
         }
        }        
    });

}
/**все регионы, 1 значение, 1 состояние */
function drawImpSt(data){
    document.getElementById('charts').innerHTML=`<div class='chartdiv'></div>`;
    try{
        document.getElementById('chartdivS').innerHTML='';}
    catch{}

    am4core.ready(function() {
        try{
        document.getElementById('chartdiv').innerHTML='';
        document.getElementById('chartdiv1').innerHTML='';
        }catch{}
        // Themes begin
        am4core.useTheme(am4themes_material);
        am4core.useTheme(am4themes_animated);
        // Themes end
        
        // Create chart instance
        var chart = am4core.create("chartdiv", am4charts.XYChart);
        chart.scrollbarX = new am4core.Scrollbar();
        
        // Add data
        chart.data = data;
        
        // Create axes
        var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
        categoryAxis.dataFields.category = "country";
        categoryAxis.renderer.grid.template.location = 0;
        categoryAxis.renderer.minGridDistance = 30;
        categoryAxis.renderer.labels.template.horizontalCenter = "right";
        categoryAxis.renderer.labels.template.verticalCenter = "middle";
        categoryAxis.renderer.labels.template.rotation = 270;
        categoryAxis.tooltip.disabled = true;
        categoryAxis.renderer.minHeight = 110;
        
        var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
        valueAxis.renderer.minWidth = 50;
        
        // Create series
        var series = chart.series.push(new am4charts.ColumnSeries());
        series.sequencedInterpolation = true;
        series.dataFields.valueY = "value";
        series.dataFields.categoryX = "country";
        series.tooltipText = "[{categoryX}: bold]{valueY}[/]";
        series.columns.template.strokeWidth = 0;
        
        series.tooltip.pointerOrientation = "vertical";
        
        series.columns.template.column.cornerRadiusTopLeft = 10;
        series.columns.template.column.cornerRadiusTopRight = 10;
        series.columns.template.column.fillOpacity = 0.8;
        
        // on hover, make corner radiuses bigger
        var hoverState = series.columns.template.column.states.create("hover");
        hoverState.properties.cornerRadiusTopLeft = 0;
        hoverState.properties.cornerRadiusTopRight = 0;
        hoverState.properties.fillOpacity = 1;
        
        series.columns.template.adapter.add("fill", function(fill, target) {
          return chart.colors.getIndex(target.dataItem.index);
        });
        
        // Cursor
        chart.cursor = new am4charts.XYCursor();
        
        });

}
/**все регионы, все значение, 1 состояние */
function drawSt(dataAll){
    document.getElementById('charts').innerHTML=`<div id="carouselExampleIndicators" class="carousel slide" data-ride="carousel">
    <ol class="carousel-indicators">
    <li data-target="#carouselExampleIndicators" data-slide-to="0" class="active"></li>
    <li data-target="#carouselExampleIndicators" data-slide-to="1"></li>
    <li data-target="#carouselExampleIndicators" data-slide-to="2"></li>
    <li data-target="#carouselExampleIndicators" data-slide-to="3"></li>
    <li data-target="#carouselExampleIndicators" data-slide-to="4"></li>
    <li data-target="#carouselExampleIndicators" data-slide-to="5"></li>
    <li data-target="#carouselExampleIndicators" data-slide-to="6"></li>
    <li data-target="#carouselExampleIndicators" data-slide-to="7"></li>
    <li data-target="#carouselExampleIndicators" data-slide-to="8"></li>
    <li data-target="#carouselExampleIndicators" data-slide-to="9"></li>
    <li data-target="#carouselExampleIndicators" data-slide-to="10"></li>
    <li data-target="#carouselExampleIndicators" data-slide-to="11"></li>
    <li data-target="#carouselExampleIndicators" data-slide-to="12"></li>
    <li data-target="#carouselExampleIndicators" data-slide-to="13"></li>
    <li data-target="#carouselExampleIndicators" data-slide-to="14"></li>
    <li data-target="#carouselExampleIndicators" data-slide-to="15"></li>
    <li data-target="#carouselExampleIndicators" data-slide-to="16"></li>
    </ol>
    <div class="carousel-inner">
      <div class="carousel-item active">
        <div class='d-block w-100 chart' id='chartdiv0'></div>
      </div>
      <div class="carousel-item">
      <div class='d-block w-100 chart' id='chartdiv1'></div>
      </div>
      <div class="carousel-item">
      <div class='d-block w-100 chart' id='chartdiv2'></div>
      </div>
      <div class="carousel-item">
      <div class='d-block w-100 chart' id='chartdiv3'></div>
      </div>
      <div class="carousel-item">
      <div class='d-block w-100 chart' id='chartdiv4'></div>
      </div>
      <div class="carousel-item">
      <div class='d-block w-100 chart' id='chartdiv5'></div>
      </div>
      <div class="carousel-item">
      <div class='d-block w-100 chart' id='chartdiv6'></div>
      </div>
      <div class="carousel-item">
      <div class='d-block w-100 chart' id='chartdiv7'></div>
      </div>
      <div class="carousel-item">
      <div class='d-block w-100 chart' id='chartdiv8'></div>
      </div>
      <div class="carousel-item">
      <div class='d-block w-100 chart' id='chartdiv9'></div>
      </div>
      <div class="carousel-item">
      <div class='d-block w-100 chart' id='chartdiv10'></div>
      </div>
      <div class="carousel-item">
      <div class='d-block w-100 chart' id='chartdiv11'></div>
      </div>
      <div class="carousel-item">
      <div class='d-block w-100 chart' id='chartdiv12'></div>
      </div>
      <div class="carousel-item">
      <div class='d-block w-100 chart' id='chartdiv13'></div>
      </div>
      <div class="carousel-item">
      <div class='d-block w-100 chart' id='chartdiv14'></div>
      </div>
      <div class="carousel-item">
      <div class='d-block w-100 chart' id='chartdiv15'></div>
      </div>
      <div class="carousel-item">
      <div class='d-block w-100 chart' id='chartdiv16'></div>
      </div>
    </div>
    <a class="carousel-control-prev" href="#carouselExampleIndicators" role="button" data-slide="prev">
      <span class="carousel-control-prev-icon" aria-hidden="true"></span>
      <span class="sr-only">Previous</span>
    </a>
    <a class="carousel-control-next" href="#carouselExampleIndicators" role="button" data-slide="next">
      <span class="carousel-control-next-icon" aria-hidden="true"></span>
      <span class="sr-only">Next</span>
    </a>
  </div>`;
       try{
        document.getElementById('chartdivS').innerHTML='';}
    catch{}

    let data= new Array(9);
    for (i=0; i<17; i++){
        data[i]=[];
    }
    for (let i=0; i<17; i++){
        for (let j=0; j<5; j++){
            data[i][j]=dataAll[i*5+j];
        }
    }
    am4core.ready(function() {
        try{
        document.getElementById('chartdiv').innerHTML='';
        document.getElementById('chartdiv1').innerHTML='';
        }catch{}
        // Themes begin
        am4core.useTheme(am4themes_material);
        am4core.useTheme(am4themes_animated);
        // Themes end
        let chart=[];
        for (let i=0; i<17; i++){
        chart[i] = am4core.create('chartdiv'+i+'', am4charts.XYChart)
        chart[i].colors.step = 2;
        
        chart[i].legend = new am4charts.Legend()
        chart[i].legend.position = 'top'
        chart[i].legend.paddingBottom = 20
        chart[i].legend.labels.template.maxWidth = 95
        
        var xAxis = chart[i].xAxes.push(new am4charts.CategoryAxis())
        xAxis.dataFields.category = 'category'
        xAxis.renderer.cellStartLocation = 0.1
        xAxis.renderer.cellEndLocation = 0.9
        xAxis.renderer.grid.template.location = 0;
        
        var yAxis = chart[i].yAxes.push(new am4charts.ValueAxis());
        yAxis.min = 0;
        
        function createSeries(value, name) {
            var series = chart[i].series.push(new am4charts.ColumnSeries())
            series.dataFields.valueY = value
            series.dataFields.categoryX = 'category'
            series.name = name
        
            series.events.on("hidden", arrangeColumns);
            series.events.on("shown", arrangeColumns);
        
            var bullet = series.bullets.push(new am4charts.LabelBullet())
            bullet.interactionsEnabled = false
            bullet.dy = 30;
            bullet.label.text = '{valueY}'
            bullet.label.fill = am4core.color('#ffffff')
        
            return series;
        }
        
        chart[i].data = data[i];        
        
        createSeries('first', 'Федеральное значение');
        createSeries('second', 'Региональное значение');
        createSeries('third', 'Муниципальное значение');
        createSeries('fourth', 'Выявленные');
        
        function arrangeColumns() {
        
            var series = chart[i].series.getIndex(0);
        
            var w = 1 - xAxis.renderer.cellStartLocation - (1 - xAxis.renderer.cellEndLocation);
            if (series.dataItems.length > 1) {
                var x0 = xAxis.getX(series.dataItems.getIndex(0), "categoryX");
                var x1 = xAxis.getX(series.dataItems.getIndex(1), "categoryX");
                var delta = ((x1 - x0) / chart[i].series.length) * w;
                if (am4core.isNumber(delta)) {
                    var middle = chart[i].series.length / 2;
        
                    var newIndex = 0;
                    chart[i].series.each(function(series) {
                        if (!series.isHidden && !series.isHiding) {
                            series.dummyData = newIndex;
                            newIndex++;
                        }
                        else {
                            series.dummyData = chart[i].series.indexOf(series);
                        }
                    })
                    var visibleCount = newIndex;
                    var newMiddle = visibleCount / 2;
        
                    chart[i].series.each(function(series) {
                        var trueIndex = chart[i].series.indexOf(series);
                        var newIndex = series.dummyData;
        
                        var dx = (newIndex - trueIndex + middle - newMiddle) * delta
        
                        series.animate({ property: "dx", to: dx }, series.interpolationDuration, series.interpolationEasing);
                        series.bulletsContainer.animate({ property: "dx", to: dx }, series.interpolationDuration, series.interpolationEasing);
                    })
                }
            }
         }
        }        
    });

}
/**1 регион, 1 значение, 1 состояние */
function drawRegImpSt(data){
    document.getElementById('charts').innerHTML=`<div class='chartdiv'></div>`;
    try{
        document.getElementById('chartdivS').innerHTML='';}
    catch{}
    html_str='';
    html_str=`<div class='row text-center> 
                <div class='col-12 text-center mt-4'>
                <p>Всего ОКН по заданным фильтрам: <h2 id='bigNumber>`+data[0]+`</h2></p>
                </div>
              </div>`;
    document.getElementById('chartdiv').innerHTML=html_str;          
}

