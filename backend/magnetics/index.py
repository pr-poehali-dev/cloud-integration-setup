import json
import os
import psycopg2

def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])

def handler(event: dict, context) -> dict:
    """Авторизация и CRUD для магнитопроводов"""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": {"Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS", "Access-Control-Allow-Headers": "Content-Type, X-Admin-Token"}, "body": ""}

    headers = {"Access-Control-Allow-Origin": "*", "Content-Type": "application/json"}
    method = event.get("httpMethod")
    path = event.get("path", "")
    body = json.loads(event.get("body") or "{}")

    query_params = event.get("queryStringParameters") or {}

    # POST /login
    if method == "POST" and ("login" in path or "login" in query_params):
        password = body.get("password", "")
        if password == os.environ.get("ADMIN_PASSWORD", ""):
            return {"statusCode": 200, "headers": headers, "body": json.dumps({"ok": True})}
        return {"statusCode": 401, "headers": headers, "body": json.dumps({"ok": False, "error": "Неверный пароль"})}

    # Проверка токена для изменений
    admin_token = event.get("headers", {}).get("X-Admin-Token", "")
    is_admin = admin_token == os.environ.get("ADMIN_PASSWORD", "")

    # GET / — список всех
    if method == "GET":
        conn = get_conn()
        cur = conn.cursor()
        cur.execute("SELECT id, name, manufacture, coating FROM magnetics ORDER BY id")
        rows = cur.fetchall()
        conn.close()
        data = [{"id": r[0], "name": r[1], "manufacture": float(r[2]) if r[2] is not None else None, "coating": float(r[3]) if r[3] is not None else None} for r in rows]
        return {"statusCode": 200, "headers": headers, "body": json.dumps(data)}

    # PUT / — обновить запись
    if method == "PUT":
        if not is_admin:
            return {"statusCode": 403, "headers": headers, "body": json.dumps({"error": "Нет доступа"})}
        rid = body.get("id")
        manufacture = body.get("manufacture")
        coating = body.get("coating")
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            "UPDATE magnetics SET manufacture = %s, coating = %s WHERE id = %s",
            (manufacture, coating, rid)
        )
        conn.commit()
        conn.close()
        return {"statusCode": 200, "headers": headers, "body": json.dumps({"ok": True})}

    return {"statusCode": 404, "headers": headers, "body": json.dumps({"error": "Not found"})}