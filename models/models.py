import psycopg2
import json

conn = psycopg2.connect(database="audithon", user="postgres", password="4432", host="26.173.145.160", port="5434")
cursor = conn.cursor()


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


def test():
    return jsonify(get_data("select * from test.region_hist"))

