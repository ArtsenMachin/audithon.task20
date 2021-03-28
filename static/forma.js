function toIndex(){
    $.ajax({
        url: "/to_index"
    })
}
function toServer(){
    let name, type, importance, adress, x, y, comment, file;
    name=document.getElementById('name_input').value;
    type=document.getElementById('type_input').value;
    var n = document.getElementById('important_input').options.selectedIndex;    
    importance = document.getElementById('important_input').options[n].value;
    adress=document.getElementById('adress_input').value;
    x=document.getElementById('coordinatex_input').value;
    y=document.getElementById('coordinatey_input').value;
    let coordinate=x+', '+y;
    comment=document.getElementById('comment_input').value;
	let data = 'Нет вложения';

		$.ajax({
            url: "/server", 
            data        : {name, type, importance, adress, coordinate, comment, data},
        })
}