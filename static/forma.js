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
    let coordinate=[x,y];
    comment=document.getElementById('comment_input').value;

    file=document.getElementById('image_input').files;

    if( typeof file == 'undefined' ) return;

	var data = new FormData();

	$.each(file, function( key, value ){
		data.append( key, value );
	});

	data.append( 'my_file_upload', 1 );

	$.ajax({
		url         : '/server',
		type        : 'POST', 
		data        : {name, type, importance, adress, coordinate, comment, data},
		cache       : false,
		dataType    : 'json',
		
		processData : false,
		
		contentType : false, 
		
		success     : function( respond, status, jqXHR ){

			
			if( typeof respond.error === 'undefined' ){
				
				var files_path = respond.files;
				var html = '';
				$.each( files_path, function( key, val ){
					 html += val +'<br>';
				} )

				$('.ajax-reply').html( html );
			}
			
			else {
				console.log('ОШИБКА: ' + respond.data );
			}
		},

		error: function( jqXHR, status, errorThrown ){
			console.log( 'ОШИБКА AJAX запроса: ' + status, jqXHR );
		}

	});

}