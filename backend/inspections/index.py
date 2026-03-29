"""
API для сохранения, загрузки и удаления осмотров опор ЛЭП.
"""
import json
import os
import psycopg2
import psycopg2.extras

SCHEMA = 't_p82993556_powerline_inspection'

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
}


def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': {**CORS, 'Access-Control-Max-Age': '86400'}, 'body': ''}

    method = event.get('httpMethod', 'GET')
    path_params = event.get('pathParameters') or {}
    record_id = path_params.get('id')

    # GET — список всех осмотров
    if method == 'GET' and not record_id:
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            "SELECT id, pole_id, pole_name, line_name, template_id, datetime, lat, lng, tilt_angle, photo, defects, notes "
            f"FROM {SCHEMA}.inspections ORDER BY created_at DESC"
        )
        rows = cur.fetchall()
        cur.close()
        conn.close()
        result = []
        for r in rows:
            defects_raw = r[10]
            if isinstance(defects_raw, list):
                defects = defects_raw
            elif isinstance(defects_raw, str):
                defects = json.loads(defects_raw)
            else:
                defects = []
            result.append({
                'id': str(r[0]),
                'poleId': r[1],
                'poleName': r[2],
                'lineName': r[3],
                'templateId': r[4],
                'datetime': r[5],
                'lat': float(r[6]),
                'lng': float(r[7]),
                'tiltAngle': r[8],
                'photo': r[9],
                'defects': defects,
                'notes': r[11] or '',
            })
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'inspections': result})}

    # POST — сохранить осмотр
    if method == 'POST':
        body = json.loads(event.get('body') or '{}')
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            f"INSERT INTO {SCHEMA}.inspections "
            "(pole_id, pole_name, line_name, template_id, datetime, lat, lng, tilt_angle, photo, defects, notes) "
            "VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s) RETURNING id",
            (
                body.get('poleId', ''),
                body.get('poleName', ''),
                body.get('lineName', ''),
                body.get('templateId'),
                body.get('datetime', ''),
                body.get('lat', 0),
                body.get('lng', 0),
                body.get('tiltAngle', '0.0'),
                body.get('photo'),
                json.dumps(body.get('defects', [])),
                body.get('notes', ''),
            )
        )
        new_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()
        return {'statusCode': 201, 'headers': CORS, 'body': json.dumps({'id': str(new_id)})}

    # PUT — обновить осмотр
    if method == 'PUT' and record_id:
        body = json.loads(event.get('body') or '{}')
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            f"UPDATE {SCHEMA}.inspections "
            "SET defects=%s, notes=%s, tilt_angle=%s, photo=%s, updated_at=NOW() WHERE id=%s",
            (
                json.dumps(body.get('defects', [])),
                body.get('notes', ''),
                body.get('tiltAngle', '0.0'),
                body.get('photo'),
                int(record_id),
            )
        )
        conn.commit()
        cur.close()
        conn.close()
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True})}

    # DELETE — удалить запись
    if method == 'DELETE' and record_id:
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(f"DELETE FROM {SCHEMA}.inspections WHERE id=%s", (int(record_id),))
        conn.commit()
        cur.close()
        conn.close()
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True})}

    return {'statusCode': 404, 'headers': CORS, 'body': json.dumps({'error': 'Not found'})}
