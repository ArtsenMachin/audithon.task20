import psycopg2
import json
from pydantic import BaseModel, ValidationError
from typing import List, Optional

conn = psycopg2.connect(database="audithon", user="postgres", password="4432", host="26.173.145.160", port="5434")
cursor = conn.cursor()


class baloon(BaseModel):
    type = "FeatureCollection"
    features = [{}]

    def add_features(self, name, value, id):
        self.features[id][name] = value
    
    def add_new_features_item(self):
        self.features.append({})


#
#               Шаблонные функции на получение данных из БД
# ----------------------------------------------------------------------------------
#


def get_data(query):
    cursor.execute(query)
    results = cursor.fetchall()
    return results


def jsonify(some_tuple):
    results = json.dumps(some_tuple, ensure_ascii=False, separators=(',', ': '))
    return results
#
# ----------------------------------------------------------------------------------
#


def map_baloon_data(page):
    if page != 1:
        page = 100*(int(page)-1)
    else:
        page -= 1
    print(page)
    baloon_data = get_data(
    """select
        co.object_id,
        co.reestr_number_cval,
        co.clutural_object_name_cval,
        co.coordinates_cval,
        case when co.image_jsonval is not null then co.image_jsonval ->> 'url'
            else 'https://cdn.discordapp.com/attachments/824553156905533491/825070117393793044/08cd6ad2398e2cc415bed2c5acd76b33.png' end image,
        cc.culture_cathegory_shortname_cval,
        cc.color_cval,
        os.state_name_cval,
        row_number () over () rn
    from dev.culrural_object_hist co
    left join dev.culture_cathegory_hist cc
        on cc.culture_cathegory_id = co.culture_cathegory_id_nval 
    left join dev.object_state_hist os
        on os.state_id = co.state_id_nval
    left join dev.object_type_hist ot
        on ot.object_type_id = co.object_type_id_nval
    left join dev.region_hist rh
        on rh.region_id = co.region_id_nval 
    left join dev.unesco_affiliation_hist ua
        on ua.unesco_affiliation_id = co.unesco_affiliation_id_nval 
    where co.coordinates_cval is not null
    offset %i limit 100""" %(int(page))
    )


    baloon_inf = baloon()
    object_id = 0


    for okn_object in baloon_data:
        object_id_default = okn_object[0]
        coordinates = okn_object[3]
        balloon_content_header = okn_object[2] + "<br><span class='description'>"+ okn_object[1] + "</span>"
        balloon_content_body = okn_object[4] #"<img src='" + okn_object[4] + "' width='200'><br/>' <b>Значение</b> <br/>" + okn_object[5]
        balloon_content_footer = "Состояние культурного объекта: <br/>" + okn_object[7]
        hint_content = "Значение: "+okn_object[5]
        icon_caption = okn_object[2]
        color = okn_object[6]


        baloon_inf.add_features("type", "feature", object_id)
        baloon_inf.add_features("id", object_id_default, object_id)
        baloon_inf.add_features("geometry", {"type": "Point", "coordinates": coordinates}, object_id)
        baloon_inf.add_features("properties", {"balloonContentHeader": balloon_content_header,
            "balloonContentBody": balloon_content_body,
            "balloonContentFooter": balloon_content_footer,
            "hintContent": hint_content,
            "iconCaption": icon_caption}, object_id)
        baloon_inf.add_features("options", {"preset": color}, object_id)

        object_id += 1
        baloon_inf.add_new_features_item()
        

    del baloon_inf.features[-1]
    return(jsonify(baloon_inf.dict()))
    
