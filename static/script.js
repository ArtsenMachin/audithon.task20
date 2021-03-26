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
            // Чтобы метки начали кластеризоваться, выставляем опцию.
            clusterize: true,
            // ObjectManager принимает те же опции, что и кластеризатор.
            gridSize: 64,
            // Макет метки кластера pieChart.
            clusterIconLayout: "default#pieChart"
        });
    myMap.geoObjects.add(objectManager);

    // Создадим 5 пунктов выпадающего списка.
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
        // Теперь создадим список, содержащий 5 пунктов.
        listBoxControl1 = new ymaps.control.ListBox({
            data: {
                content: 'Значение',
                title: 'Значение'
            },
            items: listBoxItems1,
            state: {
                // Признак, развернут ли список.
                expanded: false,
                filters: listBoxItems1.reduce(reducer1, {})
            }
        });
    myMap.controls.add(listBoxControl1);

    // Добавим отслеживание изменения признака, выбран ли пункт списка.
    listBoxControl1.events.add(['select', 'deselect'], function (e) {
        var listBoxItem = e.get('target');
        var filters = ymaps.util.extend({}, listBoxControl1.state.get('filters'));
        filters[listBoxItem.data.get('content')] = listBoxItem.isSelected();
        listBoxControl1.state.set('filters', filters);
    });

    var filterMonitor = new ymaps.Monitor(listBoxControl1.state);
    filterMonitor.add('filters', function (filters) {
        // Применим фильтр.
        objectManager.setFilter(getFilterFunction1(filters));
    });

    function getFilterFunction1(categories) {
        return function (obj) {
            var content = obj.properties.hintContent;
            content=content.split("Значение: ");
            return categories[content[1]]
        }
    }

////////////////////////////////////////////////////////
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
        // Теперь создадим список, содержащий 5 пунктов.
        listBoxControl = new ymaps.control.ListBox({
            data: {
                content: 'Состояние',
                title: 'Состояние'
            },
            items: listBoxItems,
            state: {
                // Признак, развернут ли список.
                expanded: false,
                filters: listBoxItems.reduce(reducer, {})
            }
        });
    myMap.controls.add(listBoxControl);

    // Добавим отслеживание изменения признака, выбран ли пункт списка.
    listBoxControl.events.add(['select', 'deselect'], function (e) {
        var listBoxItem = e.get('target');
        var filters = ymaps.util.extend({}, listBoxControl.state.get('filters'));
        filters[listBoxItem.data.get('content')] = listBoxItem.isSelected();
        listBoxControl.state.set('filters', filters);
    });

    var filterMonitor = new ymaps.Monitor(listBoxControl.state);
    filterMonitor.add('filters', function (filters) {
        // Применим фильтр.
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
