"""
API для сохранения и загрузки шаблонов линий ЛЭП.
"""
import json
import os
import psycopg2

SCHEMA = 't_p82993556_powerline_inspection'

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
}


def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': {**CORS, 'Access-Control-Max-Age': '86400'}, 'body': ''}

    method = event.get('httpMethod', 'GET')

    # GET — последний шаблон
    if method == 'GET':
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            f"SELECT id, line_name, voltage, poles FROM {SCHEMA}.templates ORDER BY created_at DESC LIMIT 1"
        )
        row = cur.fetchone()
        cur.close()
        conn.close()
        if not row:
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'template': None})}
        poles_raw = row[3]
        poles = poles_raw if isinstance(poles_raw, list) else json.loads(poles_raw or '[]')
        template = {
            'id': row[0],
            'lineName': row[1],
            'voltage': row[2],
            'poles': poles,
        }
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'template': template})}

    # POST — сохранить шаблон
    if method == 'POST':
        body = json.loads(event.get('body') or '{}')
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            f"INSERT INTO {SCHEMA}.templates (line_name, voltage, poles) VALUES (%s,%s,%s) RETURNING id",
            (
                body.get('lineName', ''),
                body.get('voltage', ''),
                json.dumps(body.get('poles', [])),
            )
        )
        new_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()
        return {'statusCode': 201, 'headers': CORS, 'body': json.dumps({'id': new_id})}

    return {'statusCode': 404, 'headers': CORS, 'body': json.dumps({'error': 'Not found'})}
