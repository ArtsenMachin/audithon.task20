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

    var listBoxItems = ['Удовлетворительное','Неудовлетворительное', 'Утраченный']
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
        url: "/test"
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
        html_str=   `<div class='row'>
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
                            </select>
                        </div>
                        <div class='col-6 col-lg-3'>
                        <button class="btnF" onclick='drawDiagrams()'>Применить фильтры</button>
                        </div>
                        <div class='col-12'>
                            <div id="chartdiv"></div>
                        </div>
                    </div>`;
        document.getElementById('diagrams').innerHTML=html_str;
        
        $.ajax({
            url: "/select_diagrams"
        }).done(function (data) {
            select_data=JSON.parse(data);
            html_str='';
            for(let i=0; select_data[0].lenght; i++){
                $('#region_select').append("<option value="+select_data[0][i]+">"+select_data[1][i]+"</option>");
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
        data:{region_temp,important_temp,state_temp}
    }).done(function (data) {

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
function drawAll(data){

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
        
        chart.data = data;/*[
            {
                category: 'Place #1',
                first: 40,
                second: 55,
                third: 60
            },
            {
                category: 'Place #2',
                first: 30,
                second: 78,
                third: 69
            },
            {
                category: 'Place #3',
                first: 27,
                second: 40,
                third: 45
            },
            {
                category: 'Place #4',
                first: 50,
                second: 33,
                third: 22
            }
        ]*/
        
        
        createSeries('first', 'The First');
        createSeries('second', 'The Second');
        createSeries('third', 'The Third');
        
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
/**1 регион, все значения, все состояния */
function drawReg(data){

}
/**1 регион, 1 значение, все состояния */
function drawRegImp(data){

}
/**1 регион, все значения, 1 состояние */
function drawRegSt(data){

}
/**все регионы, 1 значение, все состояния */
function drawImp(data){

}
/**все регионы, 1 значение, 1 состояние */
function drawImpSt(data){

}
/**все регионы, все значение, 1 состояние */
function drawSt(data){

}
/**1 регион, 1 значение, 1 состояние */
function drawRegImpSt(data){

}