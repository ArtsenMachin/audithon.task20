import psycopg2
import json
from pydantic import BaseModel, ValidationError
from typing import List, Optional

conn = psycopg2.connect(database="audithon", user="postgres",
                        password="4432", host="26.173.145.160", port="5434")
cursor = conn.cursor()


class json_serializable(BaseModel):
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
    results = json.dumps(some_tuple, ensure_ascii=False,
                         separators=(',', ': '))
    return results
#
# ----------------------------------------------------------------------------------
#


def map_baloon_data():
    baloon_data = get_data(
        """select
		co.object_id,
		co.reestr_number_cval,
		co.cultural_object_name_cval,
		cast(((coordinates_cval->>'coordinates')::jsonb ->> 0)::varchar as varchar(100)) coordinates_cval,
		case when co.image_jsonval is not null then co.image_jsonval ->> 'url'
			else 'https://cdn.discordapp.com/attachments/824553156905533491/825070117393793044/08cd6ad2398e2cc415bed2c5acd76b33.png' end image,
		cc.culture_cathegory_shortname_cval,
		cc.color_cval,
		os.state_name_cval,
		row_number () over () rn,
		cast(((coordinates_cval->>'coordinates')::jsonb ->> 1)::varchar as varchar(100)) coordinates_cval2
	from dev.cultural_object_hist co
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
	where co.coordinates_cval is not null"""
    )

    baloon_inf = json_serializable()
    object_id = 0

    for okn_object in baloon_data:
        object_id_default = okn_object[0]
        coordinates = [float(okn_object[9]), float(okn_object[3])]
        balloon_content_header = okn_object[2] + \
            "<br><span class='description'>" + okn_object[1] + "</span>"
        balloon_content_body = "<img src=" + \
            okn_object[4] + \
            " width='200'><br/> <b>Значение:</b>" + okn_object[5]
        balloon_content_footer = "Состояние культурного объекта: <br/>" + \
            okn_object[7]
        hint_content = "Значение: "+okn_object[5]
        icon_caption = okn_object[2]
        color = okn_object[6]

        baloon_inf.add_features("type", "Feature", object_id)
        baloon_inf.add_features("id", object_id_default, object_id)
        baloon_inf.add_features(
            "geometry", {"type": "Point", "coordinates": coordinates}, object_id)
        baloon_inf.add_features("properties", {
            "balloonContentHeader": balloon_content_header,
            "balloonContentBody": balloon_content_body,
            "balloonContentFooter": balloon_content_footer,
            "hintContent": hint_content,
            "iconCaption": icon_caption}, object_id)
        baloon_inf.add_features("options", {"preset": color}, object_id)

        object_id += 1
        baloon_inf.add_new_features_item()

    del baloon_inf.features[-1]
    return(jsonify(baloon_inf.dict()))


def regions_get():
    return jsonify(get_data(
        "select * from test.region_hist rh "
        "order by rh.region_id"
    ))


def region_and_cult_value(region, value, state):
    if region == 'all':
        regions = 0
    else:
	    regions = int(region)

    return get_data(
        "select "
        "cc.culture_cathegory_name_cval, "
        "rh.region_name_cval, "
        "coalesce(count(c.object_id), 0) cath_name_count, "
        "os.state_name_cval "
        'from dev.cultural_object_hist c '
        "full join dev.map_region_cathegory mrc "
        "on mrc.culture_cathegory_id = c.culture_cathegory_id_nval "
        "and mrc.region_id = c.region_id_nval "
        "and mrc.state_id = c.state_id_nval "
        "right join dev.culture_cathegory_hist cc "
        "on cc.culture_cathegory_id = mrc.culture_cathegory_id "
        "right join dev.region_hist rh "
        "on mrc.region_id = rh.region_id "
        "right join dev.object_state_hist os "
        "on os.state_id = mrc.state_id "
        "where (%i = 0 or mrc.region_id = %i) "
        "and (cc.system_name_cval = '%s' or '%s' = 'all') "
        "and (os.system_name_cval = '%s' or '%s' = 'all') "
        "group by os.state_name_cval, cc.culture_cathegory_name_cval, rh.region_name_cval "
        "order by rh.region_name_cval, cc.culture_cathegory_name_cval "
        % (regions, regions, value, value, state, state)
    )


def diagrams(regions, cult_value, state):

    # все регионы, все значение, 1 состояние
    if (regions == 'all' and cult_value == 'all' and state != 'all'):
        cul_value = region_and_cult_value('all', 'all', state)

        json_inf = json_serializable()
        object_id = 0

        for i in range(0, len(cul_value), 4):
            json_inf.add_features("category", cul_value[i][1], object_id)
            json_inf.add_features("first", cul_value[i+3][2], object_id)
            json_inf.add_features("second", cul_value[i+1][2], object_id)
            json_inf.add_features("third", cul_value[i+2][2], object_id)
            json_inf.add_features("fourth", cul_value[i][2], object_id)
            json_inf.add_new_features_item()
            object_id += 1

        del json_inf.features[-1]
        return(jsonify(json_inf.features))

    # 1 регион, все значения, 1 состояние
    elif (regions != 'all' and cult_value == 'all' and state != 'all'):
        cul_value = region_and_cult_value(regions, 'all', state)

        json_inf = json_serializable()

        json_inf.add_features("category", cul_value[0][1], 0)
        json_inf.add_features("first", cul_value[3][2], 0)
        json_inf.add_features("second", cul_value[1][2], 0)
        json_inf.add_features("third", cul_value[2][2], 0)
        json_inf.add_features("fourth", cul_value[0][2], 0)

        return(jsonify(json_inf.features))

    # 1 регион, 1 значение, 1 состояние
    elif (regions != 'all' and cult_value != 'all' and state != 'all'):
        cul_value = region_and_cult_value(regions, cult_value, state)
        return(str(cul_value[0][2]))
    # 1 регион, все значения, все состояния
    elif (regions != 'all' and cult_value == 'all' and state == 'all'):
        cul_value = region_and_cult_value(regions, 'all', 'all')

        json_inf = json_serializable()
        object_id = 0

        for i in range(0, len(cul_value), 4):
            json_inf.add_features("category", cul_value[i][1], 0)
            json_inf.add_features("first", cul_value[i+2][2], 0)
            json_inf.add_features("second", cul_value[i+1][2], 0)
            json_inf.add_features("third", cul_value[i+3][2], 0)
            json_inf.add_features("fourth", cul_value[i][2], 0)
            json_inf.add_new_features_item()
            object_id += 1

        del json_inf.features[-1]
        return(jsonify(json_inf.features))
    # все регионы, 1 значение, все состояния
    elif (regions == 'all' and cult_value != 'all' and state == 'all'):
        cul_value = region_and_cult_value('all', cult_value, 'all')

        json_inf = json_serializable()
        object_id = 0

        for i in range(0, len(cul_value), 4):
            json_inf.add_features("category", cul_value[i][1], 0)
            json_inf.add_features("first", cul_value[i+2][2], 0)
            json_inf.add_features("second", cul_value[i+1][2], 0)
            json_inf.add_features("third", cul_value[i+3][2], 0)
            json_inf.add_features("fourth", cul_value[i][2], 0)
            json_inf.add_new_features_item()
            object_id += 1

        del json_inf.features[-1]
        return(jsonify(json_inf.features))
    # все регионы, 1 значение, 1 состояние
    elif (regions == 'all' and cult_value != 'all' and state != 'all'):
        return 4
    # все регионы, все значения, все состояния
    elif (regions == 'all' and cult_value == 'all' and state == 'all'):
        return 3
    # 1 регион, 1 значение, все состояния
    else:
        return 1
