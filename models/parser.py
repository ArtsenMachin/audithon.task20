import psycopg2

conn = psycopg2.connect(database="audithon", user="postgres", password="4432", host="26.173.145.160", port="5434")
cursor = conn.cursor()

def get_data(query):
    cursor.execute(query)
    results = cursor.fetchall()
    return results


def jsonify(some_tuple):
    results = json.dumps(some_tuple, ensure_ascii=False, separators=(',', ': '))
    return results


cul_value = get_data(
			"select "
				"cc.culture_cathegory_name_cval, "
				"rh.region_name_cval, "
				"coalesce(count(c.object_id), 0) cath_name_count "
			"from dev.cultural_object_hist c "
			"full join dev.map_region_cathegory mrc "
				"on mrc.culture_cathegory_id = c.culture_cathegory_id_nval and mrc.region_id = c.region_id_nval "
			"right join dev.culture_cathegory_hist cc "
				"on cc.culture_cathegory_id = mrc.culture_cathegory_id "
			"right join dev.region_hist rh "
				"on mrc.region_id = rh.region_id "
			"group by cc.culture_cathegory_name_cval, rh.region_name_cval "
			"order by rh.region_name_cval, cc.culture_cathegory_name_cval "
		)


object_id = 0 


for i in range(0, len(cul_value), 4):
    print(cul_value[i])
    print(cul_value[i+1])
    print(cul_value[i+2])
    print(cul_value[i+3])
    object_id += 4

